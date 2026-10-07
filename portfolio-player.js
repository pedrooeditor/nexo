/* Player do portfólio: controles próprios, reprodução inline e tela cheia. */
(() => {
  'use strict';

  const paths = {
    play:'M8 5v14l11-7Z',
    pause:'M8 5v14M16 5v14',
    sound:'M11 5 6 9H3v6h3l5 4ZM15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14',
    muted:'M11 5 6 9H3v6h3l5 4ZM16 9l6 6M22 9l-6 6',
    expand:'M8 3H3v5M16 3h5v5M21 16v5h-5M8 21H3v-5',
    collapse:'M3 8h5V3M16 3v5h5M21 16h-5v5M8 21v-5H3'
  };
  const icon = name => '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + paths[name] + '"/></svg>';
  const time = seconds => {
    const total = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
    return Math.floor(total / 60) + ':' + String(total % 60).padStart(2, '0');
  };

  function mount(frame) {
    const video = frame?.querySelector('video');
    if (!video) return null;
    const cleanup = [];
    const originalParent = frame.parentNode;
    const originalNext = frame.nextSibling;
    let disposed = false;
    let nativeFullscreen = false;
    const on = (target, type, handler) => {
      target.addEventListener(type, handler);
      cleanup.push(() => target.removeEventListener(type, handler));
    };
    frame.classList.add('pf-video-frame');
    frame.setAttribute('role', 'group');
    frame.setAttribute('aria-label', 'Player: ' + video.getAttribute('aria-label'));
    frame.tabIndex = 0;
    video.controls = false;
    video.removeAttribute('muted');
    video.defaultMuted = false;
    video.muted = false;
    video.playsInline = true;
    video.disablePictureInPicture = true;
    video.disableRemotePlayback = true;
    video.setAttribute('controlslist', 'nodownload noremoteplayback');
    video.setAttribute('draggable', 'false');

    const overlay = document.createElement('div');
    overlay.className = 'pf-player-overlay';
    overlay.innerHTML = [
      '<button class="pf-player-center" type="button" aria-label="Reproduzir vídeo">' + icon('play') + '</button>',
      '<p class="pf-player-status" role="status" aria-live="polite" hidden></p>',
      '<div class="pf-player-controls">',
        '<input class="pf-player-progress" type="range" min="0" max="1000" value="0" step="1" aria-label="Progresso do vídeo" disabled>',
        '<div class="pf-player-row">',
          '<button class="pf-player-button pf-player-play" type="button" aria-label="Reproduzir vídeo">' + icon('play') + '</button>',
          '<span class="pf-player-time" aria-hidden="true">0:00 / 0:00</span>',
          '<button class="pf-player-button pf-player-sound" type="button" aria-label="Silenciar vídeo">' + icon('sound') + '<span>Silenciar</span></button>',
          '<button class="pf-player-button pf-player-fullscreen" type="button" aria-label="Tela cheia">' + icon('expand') + '</button>',
        '</div>',
      '</div>'
    ].join('');
    frame.append(overlay);
    const play = overlay.querySelector('.pf-player-play');
    const center = overlay.querySelector('.pf-player-center');
    const sound = overlay.querySelector('.pf-player-sound');
    const fullscreen = overlay.querySelector('.pf-player-fullscreen');
    const progress = overlay.querySelector('.pf-player-progress');
    const clock = overlay.querySelector('.pf-player-time');
    const status = overlay.querySelector('.pf-player-status');
    const isFullscreen = () => nativeFullscreen || frame.classList.contains('is-expanded') || document.fullscreenElement === frame || document.webkitFullscreenElement === frame;
    const message = copy => {
      if (disposed) return;
      status.textContent = copy;
      status.hidden = !copy;
    };
    const syncPlay = () => {
      if (disposed) return;
      const paused = video.paused || video.ended;
      play.innerHTML = icon(paused ? 'play' : 'pause');
      play.setAttribute('aria-label', paused ? 'Reproduzir vídeo' : 'Pausar vídeo');
      center.hidden = !paused || Boolean(video.error);
    };
    const syncTime = () => {
      const duration = video.duration;
      const current = video.currentTime;
      const valid = Number.isFinite(duration) && duration > 0;
      const ratio = valid ? Math.min(1, Math.max(0, current / duration)) : 0;
      progress.disabled = !valid;
      progress.value = String(Math.round(ratio * 1000));
      progress.style.setProperty('--pf-progress', ratio * 100 + '%');
      progress.setAttribute('aria-valuetext', time(current) + ' de ' + time(duration));
      clock.textContent = time(current) + ' / ' + time(duration);
    };
    const syncSound = () => {
      sound.innerHTML = icon(video.muted ? 'muted' : 'sound') + '<span>' + (video.muted ? 'Ativar som' : 'Silenciar') + '</span>';
      sound.setAttribute('aria-label', video.muted ? 'Ativar som' : 'Silenciar vídeo');
    };
    const syncFullscreen = () => {
      const expanded = isFullscreen();
      fullscreen.innerHTML = icon(expanded ? 'collapse' : 'expand');
      fullscreen.setAttribute('aria-label', expanded ? 'Sair da tela cheia' : 'Tela cheia');
    };
    const resume = async () => {
      try {
        await video.play();
        message('');
      } catch {
        if (!video.error) message('Toque em reproduzir para assistir.');
      }
      syncPlay();
    };
    const togglePlay = () => {
      if (video.paused || video.ended) {
        if (video.ended) video.currentTime = 0;
        resume();
      } else video.pause();
    };
    const exitExpanded = () => {
      frame.classList.remove('is-expanded');
      if (originalParent.isConnected && frame.parentNode !== originalParent) originalParent.insertBefore(frame, originalNext?.parentNode === originalParent ? originalNext : null);
      syncFullscreen();
    };
    const expandFallback = () => {
      if (disposed) return;
      const dialog = frame.closest('dialog');
      if (dialog) dialog.append(frame);
      frame.classList.add('is-expanded');
      frame.focus({preventScroll:true});
    };
    const toggleFullscreen = async () => {
      try {
        if (frame.classList.contains('is-expanded')) exitExpanded();
        else if (document.fullscreenElement === frame) await document.exitFullscreen();
        else if (document.webkitFullscreenElement === frame) document.webkitExitFullscreen();
        else if (video.webkitEnterFullscreen && !document.fullscreenEnabled && !document.webkitFullscreenEnabled && video.readyState > 0) video.webkitEnterFullscreen();
        else if (frame.requestFullscreen) await frame.requestFullscreen();
        else if (frame.webkitRequestFullscreen) frame.webkitRequestFullscreen();
        else if (video.webkitEnterFullscreen && video.readyState > 0) video.webkitEnterFullscreen();
        else expandFallback();
      } catch {
        expandFallback();
      }
      if (!disposed) syncFullscreen();
    };
    const seek = seconds => {
      if (Number.isFinite(video.duration) && video.duration > 0) {
        video.currentTime = Math.min(video.duration, Math.max(0, seconds));
        syncTime();
      }
    };
    const size = () => {
      if (video.videoWidth && video.videoHeight) frame.style.setProperty('--pf-video-ratio', video.videoWidth / video.videoHeight);
      syncTime();
    };

    on(play, 'click', togglePlay);
    on(center, 'click', togglePlay);
    on(video, 'click', togglePlay);
    on(sound, 'click', () => { video.muted = !video.muted; syncSound(); });
    on(fullscreen, 'click', toggleFullscreen);
    on(progress, 'input', () => seek(Number(progress.value) * video.duration / 1000));
    on(frame, 'contextmenu', event => event.preventDefault());
    on(video, 'dragstart', event => event.preventDefault());
    on(video, 'play', syncPlay);
    on(video, 'pause', syncPlay);
    on(video, 'ended', syncPlay);
    on(video, 'playing', () => { message(''); syncPlay(); });
    on(video, 'waiting', () => message('Carregando vídeo…'));
    on(video, 'canplay', () => { if (!video.paused) message(''); });
    on(video, 'volumechange', syncSound);
    on(video, 'timeupdate', syncTime);
    on(video, 'durationchange', syncTime);
    on(video, 'loadedmetadata', size);
    on(video, 'error', () => {
      message('Não foi possível carregar o vídeo. Tente abrir este projeto novamente.');
      syncPlay();
    });
    on(document, 'visibilitychange', () => { if (document.hidden) video.pause(); });
    on(document, 'fullscreenchange', syncFullscreen);
    on(document, 'webkitfullscreenchange', syncFullscreen);
    on(video, 'webkitbeginfullscreen', () => { nativeFullscreen = true; syncFullscreen(); });
    on(video, 'webkitendfullscreen', () => { nativeFullscreen = false; syncFullscreen(); });
    on(frame, 'keydown', event => {
      if (event.key === 'Escape' && frame.classList.contains('is-expanded')) {
        event.preventDefault();
        event.stopPropagation();
        exitExpanded();
        return;
      }
      if (event.target !== frame && event.target !== video) return;
      if (event.ctrlKey || event.altKey || event.metaKey) return;
      if (event.key === ' ' || event.key.toLowerCase() === 'k') togglePlay();
      else if (event.key.toLowerCase() === 'm') { video.muted = !video.muted; syncSound(); }
      else if (event.key.toLowerCase() === 'f') toggleFullscreen();
      else if (event.key === 'ArrowRight') seek(video.currentTime + 5);
      else if (event.key === 'ArrowLeft') seek(video.currentTime - 5);
      else return;
      event.preventDefault();
    });
    size();
    syncPlay();
    syncSound();
    // A montagem acontece no clique do cartão: play() usa o mesmo gesto, com som.
    // Links diretos que o navegador bloquear mantêm o botão para iniciar com áudio.
    resume();

    return {
      get expanded() { return frame.classList.contains('is-expanded'); },
      exitExpanded,
      destroy() {
        disposed = true;
        cleanup.forEach(remove => remove());
        video.pause();
        if (document.fullscreenElement === frame) document.exitFullscreen()?.catch?.(() => {});
        else if (document.webkitFullscreenElement === frame) document.webkitExitFullscreen();
        else if (nativeFullscreen && video.webkitExitFullscreen) video.webkitExitFullscreen();
        exitExpanded();
        video.removeAttribute('src');
        video.querySelectorAll('source').forEach(source => source.removeAttribute('src'));
        video.load();
      }
    };
  }

  window.NexoPortfolioPlayer = {mount};
})();
