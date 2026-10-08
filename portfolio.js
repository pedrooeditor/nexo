/* Galeria independente: não modifica o conteúdo nem os efeitos do restante do site. */
(() => {
  'use strict';
  const data = window.NEXO_PORTFOLIO;
  if (!data || !Array.isArray(data.categories) || !Array.isArray(data.projects)) return;

  const html = value => String(value ?? '').replace(/[&<>"']/g, char => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  })[char]);
  const safeURL = value => {
    if (!value || typeof value !== 'string') return '';
    try {
      const url = new URL(value, window.location.href);
      return /^https?:$/.test(url.protocol) ? url.href : '';
    } catch { return ''; }
  };
  const categoryMap = new Map(data.categories.map(category => [category.id, category]));
  const contactURL = (category, project) => {
    const message = 'Oi, Pedro! Tudo bem? Conheci a Nexo Studio e me interessei por ' + (category?.name || 'seus serviços') + '.'
      + (project ? ' Vi o trabalho “' + project.title + '” no portfólio e gostaria de algo nessa direção para minha empresa.' : ' Quero conversar sobre um projeto para minha empresa.')
      + ' Podemos entender o escopo e preparar uma proposta?';
    return 'https://wa.me/5511933596263?text=' + encodeURIComponent(message);
  };
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  const canAnimate = () => !motion.matches && !document.documentElement.classList.contains('motion-paused');
  const titleBefore = document.title;
  const token = 'nexo-' + Date.now().toString(36);
  let previousURL = window.location.pathname + window.location.search + '#trabalhos';
  let lastTrigger = null;
  let origin = null;
  let renderedRoute = '';
  let activeCategory = '';
  let activeProject = null;
  let animation = null;
  let pointerFrame = 0;
  let pointerSample = null;
  let focusTabAfterRender = false;
  let directEntry = true;
  let fallbackInert = [];
  let player = null;
  const duration = value => {
    if (!Number.isFinite(value) || value <= 0) return '';
    const seconds = Math.round(value);
    return Math.floor(seconds / 60) + ':' + String(seconds % 60).padStart(2, '0');
  };

  const dialog = document.createElement('dialog');
  dialog.className = 'pf-dialog';
  dialog.id = 'nexo-portfolio';
  dialog.setAttribute('aria-labelledby', 'pf-title');
  dialog.setAttribute('aria-describedby', 'pf-intro');
  dialog.innerHTML = [
    '<div class="pf-shell">',
      '<header class="pf-topbar">',
        '<button class="pf-return" type="button" data-close><span aria-hidden="true">←</span><span>Voltar ao site</span></button>',
        '<a class="pf-logo" href="#trabalhos" data-close aria-label="Nexo Studio, voltar ao site">',
          '<svg viewBox="245 775 770 220" aria-hidden="true"><image href="assets/nexo-logo-clean.webp" width="1254" height="1254"/></svg>',
          '<span>PORTFÓLIO</span>',
        '</a>',
        '<button class="pf-close" type="button" data-close aria-label="Fechar portfólio" autofocus><span aria-hidden="true">×</span></button>',
      '</header>',
      '<div class="pf-workspace">',
        '<div class="pf-navigation"><div class="pf-nav-inner">',
          '<span class="pf-nav-label">ESCOLHA UMA FRENTE</span>',
          '<nav class="pf-tabs" role="tablist" aria-label="Categorias do portfólio">',
            data.categories.map(category => '<button class="pf-tab" id="pf-tab-' + html(category.id) + '" type="button" role="tab" aria-controls="pf-panel" aria-selected="false" tabindex="-1" data-category="' + html(category.id) + '"><span class="pf-tab-number">' + html(category.number) + '</span><span class="pf-tab-label">' + html(category.label || category.name) + '</span><span class="pf-tab-short">' + html(category.short) + '</span><span class="pf-tab-icon" aria-hidden="true">' + html(category.icon) + '</span></button>').join(''),
          '</nav>',
        '</div></div>',
        '<div class="pf-scroll">',
          '<div class="pf-heading"><div class="pf-eyebrow"></div><h2 id="pf-title"></h2><p id="pf-intro"></p></div>',
          '<div id="pf-panel" class="pf-panel" role="tabpanel" tabindex="-1"></div>',
          '<footer class="pf-bottom"><span class="pf-signature"></span><span>CRIAÇÃO. EM CADA DETALHE.</span></footer>',
        '</div>',
      '</div>',
      '<p class="pf-sr" id="pf-status" role="status" aria-live="polite"></p>',
    '</div>'
  ].join('');
  document.body.append(dialog);

  const shell = dialog.querySelector('.pf-shell');
  const scroller = dialog.querySelector('.pf-scroll');
  const panel = dialog.querySelector('.pf-panel');
  const heading = dialog.querySelector('#pf-title');
  const intro = dialog.querySelector('#pf-intro');
  const status = dialog.querySelector('#pf-status');

  const visual = project => {
    const type = project.visual || 'brand';
    if (type === 'motion') return '<span class="pf-scene pf-scene-motion" aria-hidden="true"><span class="pf-scene-kicker">NEXO / MOTION</span><span class="pf-motion-copy"><small>O PRIMEIRO SEGUNDO.</small><strong>Faz ele<br><em>valer.</em></strong></span><span class="pf-orbit pf-orbit-one"></span><span class="pf-orbit pf-orbit-two"></span><span class="pf-motion-play">▷</span><span class="pf-timeline">' + Array.from({length:23}, (_, i) => '<i style="--i:' + i + ';--bar:' + (14 + (i * 17 % 41)) + 'px"></i>').join('') + '</span><span class="pf-scene-bottom">RITMO + DIREÇÃO</span></span>';
    if (type === 'brand') return '<span class="pf-scene pf-scene-brand" aria-hidden="true"><span class="pf-scene-kicker">NEXO / IDENTIDADE EM MOVIMENTO</span><span class="pf-brand-orbit"></span><svg class="pf-brand-mark" viewBox="350 240 560 490"><image href="assets/nexo-logo-clean.webp" width="1254" height="1254"/></svg><span class="pf-brand-word">TUDO<br><em>CONECTADO.</em></span></span>';
    if (type === 'social') return '<span class="pf-scene pf-scene-social" aria-hidden="true"><span class="pf-scene-kicker">NEXO / DIREÇÃO DE CONTEÚDO</span><span class="pf-social-card pf-social-a"><small>PRESENÇA</small><strong>FEITO<br>PARA<br><em>CONECTAR.</em></strong><i>✳</i></span><span class="pf-social-card pf-social-b"><small>IDENTIDADE</small><strong>SUA<br>MARCA.<br>SEU<br>UNIVERSO.</strong><i>↗</i></span><span class="pf-social-card pf-social-c"><small>CONTEÚDO</small><strong>Além<br>do<br>feed.</strong><i>✳</i></span></span>';
    if (type === 'identity') return '<span class="pf-scene pf-scene-identity" aria-hidden="true"><span class="pf-scene-kicker">NEXO / SISTEMA VISUAL</span><span class="pf-identity-type">Uma marca.<br><em>Em cada detalhe.</em></span><span class="pf-swatches"><i></i><i></i><i></i><i></i></span><span class="pf-identity-grid"><span>✳</span><span>↗</span><span>N</span></span><span class="pf-scene-bottom">PRESENÇA COM DIREÇÃO</span></span>';
    if (type === 'web' || type === 'landing') return '<span class="pf-scene pf-scene-web ' + (type === 'landing' ? 'pf-scene-landing' : '') + '" aria-hidden="true"><span class="pf-scene-kicker">NEXO / EXPERIÊNCIA DIGITAL</span><span class="pf-browser"><span class="pf-browser-bar"><i></i><i></i><i></i><small>UMA NOVA PRESENÇA DIGITAL</small></span><span class="pf-site-content"><span class="pf-site-nav"><b>NEXO</b><small>IDEIA &nbsp; DIREÇÃO &nbsp; CONTATO</small></span><span class="pf-site-hero"><span><small>' + (type === 'landing' ? 'CLAREZA EM CADA ETAPA.' : 'CRIATIVIDADE + ESTRATÉGIA') + '</small><strong>' + (type === 'landing' ? 'Uma página.<br><em>Um próximo passo.</em>' : 'Sua marca.<br><em>Em outro nível.</em>') + '</strong><i>Vamos conectar ↗</i></span><span class="pf-site-art"><i></i><i></i><i></i></span></span><span class="pf-site-strip">CONTEÚDO. DIGITAL. CRESCIMENTO.</span></span></span><span class="pf-phone"><i></i><small>NEXO</small><strong>Além<br>do<br>comum.</strong><b>↗</b></span></span>';
    return visual({ visual:'brand' });
  };

  const cover = project => {
    const src = safeURL(project.cover || project.media?.poster || (project.media?.type === 'image' ? project.media.src : ''));
    const width = project.media?.type === 'image' ? project.media.width : 0;
    const height = project.media?.type === 'image' ? project.media.height : 0;
    const size = Number.isInteger(width) && width > 0 && Number.isInteger(height) && height > 0 ? ' width="' + width + '" height="' + height + '"' : '';
    return src ? '<img class="pf-cover' + (project.media?.type === 'video' ? ' pf-video-cover' : '') + '" src="' + html(src) + '"' + size + ' alt="" loading="lazy" decoding="async">' : visual(project);
  };

  const media = project => {
    const src = safeURL(project.media?.src);
    if (project.media?.type === 'video' && src) {
      const poster = safeURL(project.media.poster);
      return '<video class="pf-real-media" controls playsinline webkit-playsinline preload="auto" disablepictureinpicture disableremoteplayback controlslist="nodownload noremoteplayback"' + (poster ? ' poster="' + html(poster) + '"' : '') + ' aria-label="' + html(project.title) + '"><source src="' + html(src) + '" type="video/mp4">Seu navegador não conseguiu reproduzir este vídeo.</video>';
    }
    if (project.media?.type === 'image' && src) return '<img class="pf-real-media" src="' + html(src) + '" alt="' + html(project.media.alt || project.title) + '" decoding="async">';
    if (project.media?.type === 'file' && src) return '<div class="pf-file"><span aria-hidden="true">↗</span><h3>' + html(project.title) + '</h3><a class="pf-action" href="' + html(src) + '" target="_blank" rel="noopener noreferrer">Abrir arquivo <span aria-hidden="true">↗</span></a></div>';
    return cover(project);
  };

  const demoNote = projects => projects.some(project => project.demo) ? '<div class="pf-notice"><span class="pf-notice-dot" aria-hidden="true"></span><p><strong>Prévia da apresentação.</strong> Os projetos reais serão adicionados em breve.</p></div>' : '';

  function renderGallery(category) {
    const categoryProjects = data.projects.filter(project => project.category === category.id);
    const projects = categoryProjects.some(project => !project.demo) ? categoryProjects.filter(project => !project.demo) : categoryProjects;
    heading.textContent = category.headline;
    intro.textContent = category.intro;
    panel.innerHTML = '<div class="pf-collection"><span><strong>' + String(projects.length).padStart(2, '0') + '</strong> ' + (category.id === 'motion' ? 'VÍDEOS' : 'PROJETOS') + '</span><span>' + (category.id === 'motion' ? 'Escolha um vídeo para assistir' : 'Clique em um projeto para visitar o site') + '</span></div>' + demoNote(projects) + (projects.length ? '<div class="pf-grid">' + projects.map((project, index) => {
      const website = category.id === 'web' && !project.demo ? safeURL(project.websiteUrl) : '';
      const attributes = ' class="pf-project" style="--pf-order:' + index + '"';
      return [
      website ? '<a' + attributes + ' href="' + html(website) + '" target="_blank" rel="noopener noreferrer" aria-label="Visitar: ' + html(project.title) + ' (abre em uma nova aba)">' : '<button' + attributes + ' type="button" data-case="' + html(project.id) + '" aria-label="' + (project.media?.type === 'video' ? 'Assistir: ' : 'Explorar: ') + html(project.title) + '">',
        '<span class="pf-thumb' + (project.media?.type === 'video' ? ' pf-thumb-video' : website && project.media?.type === 'image' ? ' pf-thumb-site' : '') + '">',
          cover(project),
          project.demo ? '<span class="pf-demo-badge">PRÉVIA VISUAL</span>' : '',
          project.media?.type === 'video' && !project.cover ? '<span class="pf-card-play" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg></span>' : '',
          duration(project.media?.duration) ? '<span class="pf-duration">' + duration(project.media.duration) + '</span>' : '',
          '<span class="pf-peek">' + (website ? 'Visitar site' : project.media?.type === 'video' ? 'Assistir vídeo' : 'Explorar projeto') + ' <span aria-hidden="true">↗</span></span>',
        '</span>',
        '<span class="pf-project-caption"><span><span class="pf-project-format">' + html(project.format) + '</span><strong>' + html(project.title) + '</strong></span><span class="pf-project-arrow" aria-hidden="true">↗</span></span>',
        project.objective ? '<span class="pf-project-summary"><span class="pf-project-goal-label">Objetivo do projeto</span>' + html(project.objective) + '</span>' : project.description ? '<span class="pf-project-summary">' + html(project.description) + '</span>' : '',
        '<span class="pf-tags">' + (project.tags || []).map(tag => '<span>' + html(tag) + '</span>').join('') + '</span>',
      website ? '</a>' : '</button>'
    ].join(''); }).join('') + '</div>' : '<div class="pf-empty"><span aria-hidden="true">' + html(category.icon) + '</span><h3>Novos projetos. Em breve.</h3><p>Vamos conversar sobre o que sua marca precisa?</p><a class="pf-action" data-contact href="' + html(contactURL(category)) + '" target="_blank" rel="noopener noreferrer">Conversar com a Nexo <span aria-hidden="true">↗</span></a></div>');
    panel.setAttribute('aria-labelledby', 'pf-tab-' + category.id);
    status.textContent = (category.label || category.name) + ': ' + projects.length + (projects.some(project => project.demo) ? ' prévias de apresentação.' : ' projetos.');
  }

  function renderProject(category, project) {
    heading.textContent = project.title;
    intro.textContent = project.format;
    const websiteURL = safeURL(project.websiteUrl);
    const isAnimatedDemo = project.demo && !safeURL(project.cover) && !safeURL(project.media?.src);
    const gallery = Array.isArray(project.gallery) ? project.gallery.filter(item => safeURL(item.src)) : [];
    const ratio = project.media?.type === 'video' && Number.isFinite(project.media.width) && Number.isFinite(project.media.height) && project.media.width > 0 && project.media.height > 0 ? project.media.width / project.media.height : null;
    const videos = project.media?.type === 'video' ? data.projects.filter(item => item.category === category.id && !item.demo && item.media?.type === 'video' && safeURL(item.media.src)) : [];
    panel.innerHTML = [
      '<button class="pf-detail-back" type="button" data-gallery><span aria-hidden="true">←</span> Voltar à galeria</button>',
      '<div class="pf-detail">',
        '<div class="pf-detail-stage">',
          '<div class="pf-media-frame"' + (ratio ? ' style="--pf-video-ratio:' + ratio + '"' : '') + '>' + media(project) + '</div>',
          isAnimatedDemo ? '<div class="pf-demo-control"><span>ANIMAÇÃO DE APRESENTAÇÃO</span><button type="button" data-pause aria-pressed="false">' + (canAnimate() ? 'Pausar animação Ⅱ' : 'Animação pausada') + '</button></div>' : '',
          gallery.length ? '<div class="pf-image-gallery">' + gallery.map(item => '<img src="' + html(safeURL(item.src)) + '" alt="' + html(item.alt || project.title) + '" loading="lazy" decoding="async">').join('') + '</div>' : '',
        '</div>',
        '<aside class="pf-detail-info">',
          project.demo ? '<span class="pf-demo-label">PRÉVIA DA APRESENTAÇÃO</span>' : '<span class="pf-demo-label">' + html(category.short) + '</span>',
          '<h3>' + (project.demo ? 'Um espaço para<br>ver cada detalhe.' : html(project.title)) + '</h3>',
          '<p>' + html(project.description) + '</p>',
          project.objective ? '<div class="pf-approach"><span>OBJETIVO DA ENTREGA</span><p>' + html(project.objective) + '</p></div>' : '',
          project.approach ? '<div class="pf-approach"><span>' + (project.demo ? 'A APRESENTAÇÃO' : 'O QUE FOI FEITO') + '</span><p>' + html(project.approach) + '</p></div>' : '',
          '<div class="pf-tags">' + (project.tags || []).map(tag => '<span>' + html(tag) + '</span>').join('') + '</div>',
          websiteURL ? '<a class="pf-action" href="' + html(websiteURL) + '" target="_blank" rel="noopener noreferrer">Visitar projeto <span aria-hidden="true">↗</span></a>' : '',
          '<a class="pf-action ' + (websiteURL ? 'pf-action-secondary' : '') + '" data-contact href="' + html(contactURL(category, project)) + '" target="_blank" rel="noopener noreferrer">' + (project.media?.type === 'video' ? 'Fale no WhatsApp' : 'Conversar no WhatsApp') + ' <span aria-hidden="true">↗</span></a>',
          videos.length > 1 ? '<div class="pf-switcher"><h4>NA GALERIA</h4>' + videos.map(item => '<button class="pf-switcher-row" type="button" data-case="' + html(item.id) + '"' + (item.id === project.id ? ' aria-current="true" disabled' : '') + '>' + cover(item) + '<span><strong>' + html(item.title) + '</strong><small>' + (item.id === project.id ? 'Selecionado' : 'Assistir vídeo') + (duration(item.media.duration) ? ' · ' + duration(item.media.duration) : '') + '</small></span><span class="pf-switcher-play" aria-hidden="true">▷</span></button>').join('') + '</div>' : '',
        '</aside>',
      '</div>'
    ].join('');
    panel.setAttribute('aria-labelledby', 'pf-title');
    status.textContent = project.title + (project.demo ? ', prévia da apresentação.' : ', visualização do projeto.');
    panel.querySelectorAll('.pf-real-media').forEach(element => {
      element.addEventListener('error', () => {
        if (element.tagName === 'VIDEO' && window.NexoPortfolioPlayer) return;
        if (panel.querySelector('.pf-media-error')) return;
        const note = document.createElement('p');
        note.className = 'pf-media-error';
        note.textContent = 'Não foi possível carregar a mídia. Tente abrir este projeto novamente.';
        panel.querySelector('.pf-detail-stage').append(note);
      });
    });
  }

  function route() {
    const parts = window.location.hash.slice(1).split('/');
    if (parts[0] !== 'portfolio' || !categoryMap.has(parts[1]) || parts.length > 3) return null;
    const category = categoryMap.get(parts[1]);
    const project = parts[2] ? data.projects.find(item => item.id === parts[2] && item.category === category.id) : null;
    return {category, project};
  }

  function stopMedia() {
    player?.destroy();
    player = null;
    dialog.querySelectorAll('video').forEach(video => {
      try { video.pause(); } catch { /* Navegadores sem reprodução de vídeo. */ }
    });
  }

  function showDialog() {
    if (dialog.open) return;
    document.documentElement.classList.add('pf-open');
    document.dispatchEvent(new Event('nexo:portfoliochange'));
    if (typeof dialog.showModal === 'function') dialog.showModal();
    else {
      dialog.setAttribute('open', '');
      dialog.setAttribute('aria-modal', 'true');
      dialog.setAttribute('role', 'dialog');
      fallbackInert = [...document.body.children].filter(element => element !== dialog).map(element => [element, element.inert]);
      fallbackInert.forEach(([element]) => { element.inert = true; });
    }
    if (canAnimate() && typeof shell.animate === 'function') {
      const x = origin ? Math.max(0, Math.min(window.innerWidth, origin.left + origin.width / 2)) : window.innerWidth / 2;
      const y = origin ? Math.max(0, Math.min(window.innerHeight, origin.top + origin.height / 2)) : window.innerHeight / 2;
      shell.style.transformOrigin = x + 'px ' + y + 'px';
      const frames = document.documentElement.classList.contains('motion-light') ? [{opacity:0}, {opacity:1}] : [{opacity:0, transform:'scale(.92)'}, {opacity:1, transform:'scale(1)'}];
      animation = shell.animate(frames, {duration:420, easing:'cubic-bezier(.16,1,.3,1)'});
    }
    dialog.querySelector('.pf-close').focus({preventScroll:true});
  }

  function hideDialog() {
    if (!dialog.open) return;
    stopMedia();
    if (animation) animation.cancel();
    if (typeof dialog.close === 'function') dialog.close();
    else dialog.removeAttribute('open');
    document.documentElement.classList.remove('pf-open');
    document.dispatchEvent(new Event('nexo:portfoliochange'));
    fallbackInert.forEach(([element, wasInert]) => { element.inert = wasInert; });
    fallbackInert = [];
    document.title = titleBefore;
    if (lastTrigger?.isConnected) lastTrigger.focus({preventScroll:true});
    else if (directEntry) document.getElementById('trabalhos')?.scrollIntoView({behavior:'instant'});
    activeProject = null;
    activeCategory = '';
  }

  function renderRoute() {
    const currentRoute = window.location.hash;
    if (renderedRoute === currentRoute) return;
    const next = route();
    renderedRoute = currentRoute;
    if (!next) { hideDialog(); return; }
    stopMedia();
    activeCategory = next.category.id;
    activeProject = next.project;
    dialog.dataset.category = next.category.id;
    dialog.dataset.view = next.project ? 'project' : 'gallery';
    dialog.querySelector('.pf-eyebrow').textContent = next.category.number + ' / ' + (next.category.label || next.category.name).toUpperCase();
    dialog.querySelector('.pf-signature').textContent = next.category.signature;
    dialog.querySelectorAll('.pf-tab').forEach(tab => {
      const selected = tab.dataset.category === activeCategory;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
    if (next.project) renderProject(next.category, next.project);
    else renderGallery(next.category);
    scroller.scrollTop = 0;
    const wasOpen = dialog.open;
    showDialog();
    if (next.project?.media?.type === 'video') player = window.NexoPortfolioPlayer?.mount(panel.querySelector('.pf-media-frame')) || null;
    document.title = (next.project ? next.project.title : (next.category.label || next.category.name)) + ' | Portfólio — Nexo Studio';
    if (focusTabAfterRender) {
      dialog.querySelector('#pf-tab-' + activeCategory).focus({preventScroll:true});
      focusTabAfterRender = false;
    } else if (wasOpen) {
      heading.tabIndex = -1;
      heading.focus({preventScroll:true});
    }
  }

  function navigate(category, project, replace = false) {
    const currentState = history.state?.nexoPortfolio;
    const depth = currentState?.token === token ? currentState.depth : 0;
    const state = {nexoPortfolio:{token, depth:replace ? depth : depth + 1}};
    const hash = '#portfolio/' + category + (project ? '/' + project : '');
    if (hash === window.location.hash) return;
    history[replace ? 'replaceState' : 'pushState'](state, '', hash);
    renderRoute();
  }

  function closePortfolio() {
    const state = history.state?.nexoPortfolio;
    if (state?.token === token && state.depth > 0) history.go(-state.depth);
    else {
      history.replaceState(null, '', previousURL);
      renderRoute();
    }
  }

  document.addEventListener('click', event => {
    const entry = event.target.closest?.('[data-portfolio]');
    if (!entry || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button > 0) return;
    if (!categoryMap.has(entry.dataset.portfolio)) return;
    event.preventDefault();
    if (!dialog.open) {
      previousURL = window.location.pathname + window.location.search + window.location.hash;
      lastTrigger = entry;
      origin = entry.getBoundingClientRect();
      directEntry = false;
    }
    navigate(entry.dataset.portfolio);
  });

  dialog.addEventListener('click', event => {
    const button = event.target.closest?.('button, [data-close]');
    if (!button) return;
    if (button.hasAttribute('data-close')) { event.preventDefault(); closePortfolio(); }
    else if (button.dataset.category) navigate(button.dataset.category, null, true);
    else if (button.dataset.case) navigate(activeCategory, button.dataset.case, Boolean(activeProject));
    else if (button.hasAttribute('data-gallery')) {
      const state = history.state?.nexoPortfolio;
      if (state?.token === token && state.depth > 0) history.back();
      else navigate(activeCategory, null, true);
    } else if (button.hasAttribute('data-pause')) {
      const frame = panel.querySelector('.pf-media-frame');
      const paused = frame.classList.toggle('is-paused');
      button.setAttribute('aria-pressed', String(paused));
      button.textContent = paused ? 'Retomar animação ▷' : 'Pausar animação Ⅱ';
    }
  });

  dialog.addEventListener('cancel', event => {
    event.preventDefault();
    if (player?.expanded) player.exitExpanded();
    else closePortfolio();
  });
  dialog.addEventListener('keydown', event => {
    if (event.target.matches('.pf-tab') && ['ArrowRight','ArrowLeft','ArrowDown','ArrowUp','Home','End'].includes(event.key)) {
      event.preventDefault();
      const index = data.categories.findIndex(category => category.id === activeCategory);
      const direction = ['ArrowRight','ArrowDown'].includes(event.key) ? 1 : -1;
      const target = event.key === 'Home' ? 0 : event.key === 'End' ? data.categories.length - 1 : (index + direction + data.categories.length) % data.categories.length;
      focusTabAfterRender = true;
      navigate(data.categories[target].id, null, true);
    }
    if (typeof dialog.showModal !== 'function' && event.key === 'Tab') {
      const targets = [...dialog.querySelectorAll('button:not([disabled]), a[href], [tabindex="0"]')].filter(element => element.tabIndex >= 0 && !element.hidden);
      const first = targets[0], last = targets[targets.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    if (typeof dialog.showModal !== 'function' && event.key === 'Escape') { event.preventDefault(); closePortfolio(); }
  });

  dialog.addEventListener('pointermove', event => {
    if (!pointer.matches || !canAnimate() || document.documentElement.classList.contains('motion-light') || event.pointerType === 'touch') return;
    const card = event.target.closest('.pf-project');
    if (!card) return;
    pointerSample = {card, x:event.clientX, y:event.clientY};
    if (pointerFrame) return;
    pointerFrame = requestAnimationFrame(() => {
      pointerFrame = 0;
      if (!dialog.open || !pointerSample.card.isConnected) return;
      const {card, x, y} = pointerSample;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--pf-x', (x - rect.left).toFixed(1) + 'px');
      card.style.setProperty('--pf-y', (y - rect.top).toFixed(1) + 'px');
    });
  });
  window.addEventListener('popstate', renderRoute);
  window.addEventListener('hashchange', renderRoute);
  renderRoute();
})();
