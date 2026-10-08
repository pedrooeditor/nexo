'use strict';

const root = document.documentElement;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const header = document.querySelector('.header');
const menu = document.querySelector('.menu');
const nav = document.getElementById('nav');
const motionToggle = document.querySelector('.effects-toggle');
let effectsPaused = false;
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
// O conteúdo e a leitura animada continuam iguais; só a decoração se adapta.
const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
let lightMotion = Boolean(connection?.saveData
  || (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4)
  || (navigator.deviceMemory > 0 && navigator.deviceMemory <= 4));
root.classList.toggle('motion-light', lightMotion);
function enableLightMotion() {
  if (lightMotion) return;
  lightMotion = true;
  root.classList.add('motion-light');
  document.dispatchEvent(new Event('nexo:motionprofile'));
}

function closeMenu(restoreFocus = false) {
  nav.classList.remove('open');
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', 'Abrir menu');
  if (restoreFocus) menu.focus();
}
menu.addEventListener('click', () => {
  const open = !nav.classList.contains('open');
  nav.classList.toggle('open', open);
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
});
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && nav.classList.contains('open')) closeMenu(true);
});
document.addEventListener('click', event => {
  if (nav.classList.contains('open') && !nav.contains(event.target) && !menu.contains(event.target)) closeMenu();
});
window.matchMedia('(min-width: 901px)').addEventListener('change', event => {
  if (event.matches) closeMenu();
});

// Entradas em cascata. Sem JavaScript, o conteúdo permanece visível.
const revealElements = document.querySelectorAll('.section-label, .section-heading, .work-access, .service-card, .connection-intro, .team-card, .process-grid li, .package-grid article, .faq>div, .final-cta-content');
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    revealObserver.unobserve(entry.target);
    // Depois da entrada, o atraso em cascata sai de cena para não atrasar o efeito do mouse.
    setTimeout(() => entry.target.style.setProperty('--reveal-delay', '0ms'), 1300);
  });
}, {threshold: 0.08, rootMargin: '0px 0px -4% 0px'});
revealElements.forEach((element, index) => {
  element.classList.add('reveal');
  if (element.matches('.work-access, .service-card, .team-card, .process-grid li, .package-grid article')) {
    element.style.setProperty('--reveal-delay', ((index % 3) * 70) + 'ms');
  }
  revealObserver.observe(element);
});
root.classList.add('has-motion');

// Movimentos contínuos param quando a seção sai da tela.
const zoneObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => entry.target.classList.toggle('in-view', entry.isIntersecting));
}, {rootMargin:'100px 0px'});
document.querySelectorAll('.hero-art, .manifesto, .service-card, .package-grid article, .footer-large, .metal, .scroll-cue, .button.primary').forEach(element => {
  element.classList.add('motion-zone');
  zoneObserver.observe(element);
});

// Caixas: luz que acompanha o cursor + inclinação leve para o lado do cursor (01, 03 e 05).
// O efeito usa uma folga de 10 px
// na borda: assim a caixa não fica tremendo quando sobe e o cursor passa a encostar na beirada.
const TILT_X = 5.5;   // graus de inclinação para cima/baixo
const TILT_Y = 7.5;   // graus de inclinação para os lados
const EDGE = 10;      // folga da borda, em px
const tiltCards = [...document.querySelectorAll('.work-access, .service-card, .team-card, .package-grid article')];
const nodeCards = [...document.querySelectorAll('.node')];
tiltCards.forEach(card => card.classList.add('tilt-card'));
const canHover = event => event.pointerType !== 'touch' && finePointer.matches && !reducedMotion.matches && !effectsPaused && !lightMotion && !root.classList.contains('pf-open');
let activeCard = null;
let pointerX = 0;
let pointerY = 0;
let paintFrame = 0;
function releaseCard(card) {
  card.classList.remove('tilt-live', 'node-live');
  card.style.setProperty('--tilt-x', '0deg');
  card.style.setProperty('--tilt-y', '0deg');
}
function setActive(card) {
  if (card === activeCard) return;
  if (activeCard) releaseCard(activeCard);
  activeCard = card;
  if (card) card.classList.add(card.classList.contains('node') ? 'node-live' : 'tilt-live');
}
function paintActive() {
  paintFrame = 0;
  if (!activeCard) return;
  const rect = activeCard.getBoundingClientRect();
  if (pointerX < rect.left - EDGE || pointerX > rect.right + EDGE || pointerY < rect.top - EDGE || pointerY > rect.bottom + EDGE) {
    setActive(null);
    return;
  }
  const x = pointerX - rect.left;
  const y = pointerY - rect.top;
  activeCard.style.setProperty('--mx', x.toFixed(0) + 'px');
  activeCard.style.setProperty('--my', y.toFixed(0) + 'px');
  if (activeCard.classList.contains('tilt-card')) {
    activeCard.style.setProperty('--tilt-x', ((clamp(y / rect.height) - .5) * -2 * TILT_X).toFixed(2) + 'deg');
    activeCard.style.setProperty('--tilt-y', ((clamp(x / rect.width) - .5) * 2 * TILT_Y).toFixed(2) + 'deg');
  }
}
[...tiltCards, ...nodeCards].forEach(card => card.addEventListener('pointerenter', event => {
  if (!canHover(event)) return;
  pointerX = event.clientX;
  pointerY = event.clientY;
  setActive(card);
  paintActive();
}));
document.addEventListener('pointermove', event => {
  if (!activeCard) return;
  if (!canHover(event)) { setActive(null); return; }
  pointerX = event.clientX;
  pointerY = event.clientY;
  if (!paintFrame) paintFrame = requestAnimationFrame(paintActive);
}, {passive:true});
document.documentElement.addEventListener('pointerleave', () => setActive(null));
window.addEventListener('scroll', () => {
  if (activeCard && !paintFrame) paintFrame = requestAnimationFrame(paintActive);
}, {passive:true});
window.addEventListener('blur', () => setActive(null));
document.querySelectorAll('.button').forEach(button => {
  let frame = 0;
  let pointer = null;
  button.addEventListener('pointermove', event => {
    if (!canHover(event)) return;
    pointer = {x:event.clientX, y:event.clientY};
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (lightMotion || effectsPaused || reducedMotion.matches) return;
      const rect = button.getBoundingClientRect();
      button.style.setProperty('--button-x', ((pointer.x - rect.left - rect.width / 2) * .045).toFixed(1) + 'px');
      button.style.setProperty('--button-y', ((pointer.y - rect.top - rect.height / 2) * .09).toFixed(1) + 'px');
    });
  });
  button.addEventListener('pointerleave', () => {
    cancelAnimationFrame(frame);
    frame = 0;
    button.style.setProperty('--button-x', '0px');
    button.style.setProperty('--button-y', '0px');
  });
});
const heroArt = document.querySelector('.hero-art');
const logoLayer = document.querySelector('.logo-parallax');
let logoFrame = 0;
let logoPointer = null;
heroArt.addEventListener('pointermove', event => {
  if (!canHover(event)) return;
  logoPointer = {x:event.clientX, y:event.clientY};
  if (logoFrame) return;
  logoFrame = requestAnimationFrame(() => {
    logoFrame = 0;
    if (lightMotion || effectsPaused || reducedMotion.matches) return;
    const rect = heroArt.getBoundingClientRect();
    logoLayer.style.setProperty('--logo-rx', ((logoPointer.y - rect.top - rect.height / 2) * -.025).toFixed(1) + 'deg');
    logoLayer.style.setProperty('--logo-ry', ((logoPointer.x - rect.left - rect.width / 2) * .025).toFixed(1) + 'deg');
  });
});
heroArt.addEventListener('pointerleave', () => {
  cancelAnimationFrame(logoFrame);
  logoFrame = 0;
  logoLayer.style.setProperty('--logo-rx', '0deg');
  logoLayer.style.setProperty('--logo-ry', '0deg');
});

// Manifesto fixado pela própria estrutura CSS, sem bibliotecas externas.
const manifesto = document.getElementById('manifesto');
const manifestoStage = manifesto.querySelector('.manifesto-stage');
const manifestoWords = manifesto.querySelectorAll('.manifesto-word');
const processGrid = document.querySelector('.process-grid');
const hero = document.querySelector('.hero');
let manifestoPaintedProgress = -1;
// Remove a trava da atualização anterior, inclusive para quem já viu a seção.
root.classList.remove('has-read-manifesto');
try { localStorage.removeItem('nexo-manifesto-seen'); } catch (error) {}
try { sessionStorage.removeItem('nexo-manifesto-seen'); } catch (error) {}
function manifestoPhase(value, start, end) {
  const phase = clamp((value - start) / (end - start));
  return phase * phase * (3 - 2 * phase);
}
let scrollFrame = 0;
let lastScrollPaint = 0;
let scrollSamples = 0;
let slowScrollSamples = 0;
const scrollValues = new WeakMap();
function paintValue(element, property, value) {
  let values = scrollValues.get(element);
  if (!values) { values = new Map(); scrollValues.set(element, values); }
  const next = String(value);
  if (values.get(property) === next) return;
  values.set(property, next);
  element.style.setProperty(property, next);
}
function updateScroll(timestamp) {
  scrollFrame = 0;
  if (document.hidden || root.classList.contains('pf-open')) { lastScrollPaint = 0; return; }
  const interval = timestamp - lastScrollPaint;
  // Só avalia cadência quando a roda produz quadros contínuos. Gestos espaçados
  // não significam um aparelho lento e não devem desligar os efeitos da marca.
  if (!lightMotion && root.classList.contains('is-smooth-scrolling') && lastScrollPaint && interval >= 8 && interval < 100) {
    scrollSamples++;
    if (interval > 30) slowScrollSamples++;
    if (scrollSamples >= 24) {
      if (slowScrollSamples >= 10) enableLightMotion();
      scrollSamples = slowScrollSamples = 0;
    }
  } else scrollSamples = slowScrollSamples = 0;
  lastScrollPaint = timestamp;
  // Todas as medidas vêm antes de qualquer escrita: evita recalcular o layout a cada palavra.
  const viewport = window.innerHeight;
  const scrollRange = root.scrollHeight - viewport;
  const scrollY = window.scrollY;
  const motionEnabled = !reducedMotion.matches && !effectsPaused;
  const heroRect = motionEnabled && finePointer.matches && !lightMotion ? hero.getBoundingClientRect() : null;
  const rect = manifesto.getBoundingClientRect();
  const stageHeight = manifestoStage.offsetHeight || viewport;
  const stickyTop = parseFloat(window.getComputedStyle(manifestoStage).top) || 0;
  const processRect = processGrid.getBoundingClientRect();
  paintValue(root, '--scroll', (scrollRange > 0 ? clamp(scrollY / scrollRange) : 0).toFixed(4));
  header.classList.toggle('scrolled', scrollY > 22);
  paintValue(heroArt, '--hero-parallax', heroRect ? (clamp(-heroRect.top, 0, heroRect.height) * .065).toFixed(1) + 'px' : '0px');
  if (manifestoPaintedProgress < 0 || (rect.bottom >= 0 && rect.top <= viewport)) {
    // Cada estado depende da posição atual: descer revela, subir recolhe.
    // A altura real do palco mantém a sequência estável quando a barra do celular recolhe.
    const progress = motionEnabled ? clamp((stickyTop - rect.top) / Math.max(1, rect.height - stageHeight)) : 1;
    if (progress !== manifestoPaintedProgress) {
      manifestoPaintedProgress = progress;
      const textProgress = clamp((progress - .12) / .72) * manifestoWords.length;
      manifestoWords.forEach((word, index) => {
        const on = manifestoPhase(textProgress - index, 0, 1);
        paintValue(word, '--word-opacity', (.07 + on * .93).toFixed(3));
        paintValue(word, '--word-y', '0px');
      });
      // A inicial acende primeiro; o halo cresce durante a leitura das palavras.
      const glow = manifestoPhase(progress, 0, .85);
      paintValue(manifesto, '--emblem-glow', glow.toFixed(3));
      paintValue(manifesto, '--manifesto-glow', (.02 + glow * .98).toFixed(3));
      paintValue(manifesto, '--emblem-opacity', (.05 + manifestoPhase(progress, 0, .23) * .95).toFixed(3));
      paintValue(manifesto, '--emblem-scale', '1');
      paintValue(manifesto, '--sub-opacity', (.07 + manifestoPhase(progress, .78, .95) * .93).toFixed(3));
    }
  }
  paintValue(processGrid, '--rail-progress', (reducedMotion.matches ? 1 : clamp((viewport * .8 - processRect.top) / Math.max(100, processRect.height + viewport * .15))).toFixed(4));
}
function requestScroll() {
  if (!scrollFrame) scrollFrame = requestAnimationFrame(updateScroll);
}
window.addEventListener('scroll', requestScroll, {passive:true});
window.addEventListener('resize', requestScroll, {passive:true});
window.addEventListener('load', requestScroll, {once:true});
if (document.fonts) document.fonts.ready.then(requestScroll);
if (typeof ResizeObserver === 'function') {
  const manifestoSizeObserver = new ResizeObserver(requestScroll);
  manifestoSizeObserver.observe(manifestoStage);
  manifestoSizeObserver.observe(manifesto);
}
requestScroll();

// A roda do mouse mantém a distância nativa e ganha uma desaceleração curta.
// A página continua usando a rolagem real: sticky, âncoras e portfólios são preservados.
(() => {
  const RESPONSE_MS = 135;
  let frame = 0;
  let target = window.scrollY;
  let writtenY = window.scrollY;
  let lastTime = 0;
  let scrollLimit = Math.max(0, root.scrollHeight - window.innerHeight);
  const measureScrollLimit = () => { scrollLimit = Math.max(0, root.scrollHeight - window.innerHeight); };
  const maxScroll = () => scrollLimit;
  const allowed = () => finePointer.matches && !reducedMotion.matches && !effectsPaused && !lightMotion
    && !document.hidden
    && !root.classList.contains('pf-open') && !document.querySelector('dialog[open]');

  function stop() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    lastTime = 0;
    target = writtenY = window.scrollY;
    root.classList.remove('is-smooth-scrolling');
  }

  function tick(now) {
    frame = 0;
    if (!allowed()) { stop(); return; }
    const elapsed = lastTime ? clamp(now - lastTime, 1, 50) : 1000 / 60;
    lastTime = now;
    target = clamp(target, 0, maxScroll());
    const current = window.scrollY;
    const next = current + (target - current) * (1 - Math.exp(-elapsed / RESPONSE_MS));
    const done = Math.abs(target - next) < .5;
    window.scrollTo({top:done ? target : next, behavior:'instant'});
    writtenY = window.scrollY;
    if (done) stop();
    else frame = requestAnimationFrame(tick);
  }

  function nestedScroll(event) {
    const elements = typeof event.composedPath === 'function' ? event.composedPath() : [event.target];
    for (const element of elements) {
      if (!(element instanceof Element)) continue;
      if (element === root || element === document.body) break;
      if (element.matches('input, textarea, select, [contenteditable]:not([contenteditable="false"]), [data-native-scroll]')) return true;
      if (element.scrollHeight > element.clientHeight + 1) {
        const overflow = window.getComputedStyle(element).overflowY;
        if (/auto|scroll|overlay/.test(overflow)) return true;
      }
    }
    return false;
  }

  window.addEventListener('wheel', event => {
    if (event.defaultPrevented || !event.cancelable || event.ctrlKey || event.metaKey || event.shiftKey
      || !event.deltaY || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;
    if (!allowed() || nestedScroll(event)) { stop(); return; }
    const delta = event.deltaY * (event.deltaMode === 1 ? 20 : event.deltaMode === 2 ? window.innerHeight : 1);
    const current = window.scrollY;
    // Uma inversão de direção responde imediatamente, sem continuar a descida anterior.
    const base = !frame || Math.sign(delta) !== Math.sign(target - current) ? current : target;
    const nextTarget = clamp(base + delta, 0, maxScroll());
    if (Math.abs(nextTarget - current) < .5) { stop(); return; }
    event.preventDefault();
    target = nextTarget;
    root.classList.add('is-smooth-scrolling');
    if (!frame) { lastTime = 0; frame = requestAnimationFrame(tick); }
  }, {passive:false});

  // Teclado, toque, barra de rolagem e links continuam com o comportamento nativo.
  window.addEventListener('scroll', () => {
    if (frame && Math.abs(window.scrollY - writtenY) > 2) stop();
  }, {passive:true});
  document.addEventListener('pointerdown', stop, {passive:true});
  document.addEventListener('touchstart', stop, {passive:true});
  document.addEventListener('keydown', event => {
    if (['ArrowUp','ArrowDown','PageUp','PageDown','Home','End',' '].includes(event.key)) stop();
  });
  document.addEventListener('click', event => {
    if (event.target.closest?.('a[href^="#"]')) stop();
  });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  window.addEventListener('resize', stop, {passive:true});
  window.addEventListener('resize', measureScrollLimit, {passive:true});
  window.addEventListener('load', measureScrollLimit, {once:true});
  if (document.fonts) document.fonts.ready.then(measureScrollLimit);
  if (typeof ResizeObserver === 'function') new ResizeObserver(measureScrollLimit).observe(document.body);
  document.addEventListener('nexo:motionprofile', stop);
  document.addEventListener('nexo:portfoliochange', stop);
  window.addEventListener('hashchange', stop);
  window.addEventListener('popstate', stop);
  reducedMotion.addEventListener('change', stop);
  finePointer.addEventListener('change', stop);
})();

// Partículas azuis e prateadas: desenho leve, até 30 quadros por segundo.
const canvas = document.getElementById('particles');
const context = canvas.getContext('2d');
let particleFrame = 0;
let particleTimer = 0;
let particleWidth = 0;
let particleHeight = 0;
let particleScale = 0;
let lastPaint = 0;
// O brilho e a revelação seguem no ritmo da rolagem; só o fundo custa menos no toque.
const PARTICLE_INTERVAL_MS = finePointer.matches ? 33 : 50;
const particles = Array.from({length: finePointer.matches ? 38 : 14}, (_, index) => ({
  x:Math.random(), y:Math.random(), depth:.25 + Math.random() * .75,
  radius:.5 + Math.random() * 1.25, phase:Math.random() * Math.PI * 2,
  silver:index % 4 === 0
}));
function sizeParticles() {
  particleWidth = window.innerWidth;
  particleHeight = window.innerHeight;
  const pixelRatio = Math.min(window.devicePixelRatio || 1, finePointer.matches ? 1.5 : 1);
  const width = Math.round(particleWidth * pixelRatio);
  const height = Math.round(particleHeight * pixelRatio);
  if (canvas.width === width && canvas.height === height && particleScale === pixelRatio) return;
  particleScale = pixelRatio;
  canvas.width = width;
  canvas.height = height;
  if (context) context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
}
function paintParticles(timestamp) {
  particleFrame = 0;
  if (!context || reducedMotion.matches || effectsPaused || document.hidden || lightMotion || root.classList.contains('pf-open')) return;
  {
    const delta = Math.min(60, timestamp - (lastPaint || timestamp));
    lastPaint = timestamp;
    context.clearRect(0, 0, particleWidth, particleHeight);
    particles.forEach(particle => {
      particle.y -= .000012 * particle.depth * delta;
      if (particle.y < -.03) { particle.y = 1.03; particle.x = Math.random(); }
      const opacity = (.2 + Math.sin(timestamp * .0006 + particle.phase) * .13) * particle.depth;
      const x = particle.x * particleWidth;
      const y = particle.y * particleHeight;
      context.beginPath();
      context.arc(x, y, particle.radius * particle.depth, 0, Math.PI * 2);
      context.fillStyle = particle.silver ? 'rgba(206,233,255,' + opacity + ')' : 'rgba(39,155,255,' + opacity + ')';
      context.fill();
    });
  }
  // Não mantém um callback a 60 Hz para desenhar um fundo a 20–30 Hz.
  particleTimer = setTimeout(() => {
    particleTimer = 0;
    particleFrame = requestAnimationFrame(paintParticles);
  }, PARTICLE_INTERVAL_MS);
}
function syncMotion() {
  root.classList.toggle('motion-paused', effectsPaused);
  root.classList.toggle('tab-hidden', document.hidden);
  motionToggle.hidden = reducedMotion.matches;
  if (reducedMotion.matches || effectsPaused || document.hidden || lightMotion || root.classList.contains('pf-open')) {
    cancelAnimationFrame(particleFrame);
    clearTimeout(particleTimer);
    particleFrame = 0;
    particleTimer = 0;
    if ((reducedMotion.matches || lightMotion) && context) context.clearRect(0, 0, particleWidth, particleHeight);
  } else if (context && !particleFrame && !particleTimer) {
    lastPaint = 0;
    particleFrame = requestAnimationFrame(paintParticles);
  }
  requestScroll();
}
motionToggle.addEventListener('click', () => {
  effectsPaused = !effectsPaused;
  motionToggle.setAttribute('aria-pressed', String(effectsPaused));
  motionToggle.innerHTML = effectsPaused ? 'Ativar efeitos <span aria-hidden="true">▷</span>' : 'Pausar efeitos <span aria-hidden="true">Ⅱ</span>';
  syncMotion();
});
reducedMotion.addEventListener('change', syncMotion);
document.addEventListener('visibilitychange', syncMotion);
document.addEventListener('nexo:portfoliochange', syncMotion);
document.addEventListener('nexo:motionprofile', () => { setActive(null); syncMotion(); });
window.addEventListener('resize', sizeParticles, {passive:true});
sizeParticles();
syncMotion();

// No toque, o atalho também sai do caminho quando o CTA ou o contato do rodapé aparecem.
const floating = document.querySelector('.floating');
const visibleContactZones = new Set();
let briefHasFocus = Boolean(document.activeElement?.closest?.('#brief'));
function syncFloating() {
  const contactVisible = [...visibleContactZones].some(zone => zone.id === 'proximo-passo' || !finePointer.matches);
  floating.classList.toggle('is-hidden', contactVisible || briefHasFocus);
}
const contactObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) visibleContactZones.add(entry.target);
    else visibleContactZones.delete(entry.target);
  });
  syncFloating();
}, {threshold:.08});
document.querySelectorAll('#proximo-passo, [data-final-contact], .footer-contact').forEach(zone => contactObserver.observe(zone));
finePointer.addEventListener('change', syncFloating);
syncFloating();

// Contexto opcional abaixo do CTA. Os planos e serviços têm links próprios.
const brief = document.getElementById('brief');
const fronts = [...brief.querySelectorAll('input[name="service"]')];
brief.addEventListener('focusin', () => {
  briefHasFocus = true;
  syncFloating();
});
brief.addEventListener('focusout', event => {
  if (!brief.contains(event.relatedTarget)) {
    briefHasFocus = false;
    syncFloating();
  }
});
brief.addEventListener('submit', event => {
  event.preventDefault();
  if (!brief.reportValidity()) return;
  const selected = fronts.filter(input => input.checked).map(input => input.value);
  const company = document.getElementById('company-name').value.trim();
  const note = document.getElementById('project-note').value.trim();
  const origin = selected.length ? selected.join(' + ') : 'Contato geral';
  const lines = [
    '[Site · ' + origin + ']',
    'Oi, Pedro! Tudo bem? Conheci a Nexo Studio e gostaria de conversar sobre minha empresa.',
    company ? 'Empresa: ' + company : '',
    selected.length ? 'Tenho interesse em: ' + selected.join(', ') + '.' : 'Gostaria de ajuda para entender quais frentes fazem sentido para minha marca.',
    note ? 'Sobre meu projeto: ' + note : ''
  ].filter(Boolean);
  window.location.assign('https://wa.me/5511933596263?text=' + encodeURIComponent(lines.join('\n\n')));
});
