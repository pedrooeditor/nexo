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

/* ------------------------------------------------------------------
   Tela de abertura (só a logo, sem barra de carregamento)
   1. O brilho azul atrás da logo cresce conforme a página carrega (--pl, de 0 a 1).
   2. Ao terminar, acontece a faísca azul (.is-sparking).
   3. Logo depois a tela some com fade e o site aparece (.is-entered).
   Mantém a mesma sequência, com menos espera no celular e nos retornos da sessão.
   O <head> tem uma rede de segurança: depois de 8 s o site aparece de qualquer jeito.
------------------------------------------------------------------- */
const MIN_PRELOADER_MS = root.classList.contains('is-returning') ? 900 : window.matchMedia('(max-width: 760px)').matches ? 1500 : 2600;
const SPARK_MS = 620;            // da faísca até a tela começar a sumir
const preloader = document.querySelector('.preloader');
function enterSite() {
  root.classList.remove('is-loading');
  root.classList.add('is-entered');
  try { sessionStorage.setItem('nexo-intro-seen', '1'); } catch (error) {}
  if (preloader) setTimeout(() => preloader.remove(), 1500);
}
function exitPreloader() {
  if (root.classList.contains('is-entered') || root.classList.contains('is-sparking')) return;
  root.classList.add('is-sparking');
  setTimeout(enterSite, SPARK_MS);
}
if (!preloader || !root.classList.contains('is-loading')) {
  // Sem abertura (movimento reduzido, por exemplo): o site já aparece.
  enterSite();
} else {
  let pageLoaded = document.readyState === 'complete';
  if (!pageLoaded) window.addEventListener('load', () => { pageLoaded = true; }, { once: true });
  // performance.now() conta desde a navegação: baixar o script não reinicia a espera.
  const startedAt = 0;
  let shown = 0;
  let last = startedAt;
  const easeInOut = t => .5 - Math.cos(Math.PI * t) / 2;
  (function tick(now) {
    if (root.classList.contains('is-entered')) return;
    const elapsed = now - startedAt;
    const dt = Math.min(64, now - last);
    last = now;
    // Enquanto a página carrega, o brilho avança até ~90%. Quando termina, vai a 100%.
    const waiting = .9 * (1 - Math.exp(-elapsed / 950));
    const ceiling = easeInOut(clamp(elapsed / MIN_PRELOADER_MS));
    const target = Math.min(pageLoaded ? 1 : waiting, ceiling);
    shown += (target - shown) * (1 - Math.exp(-dt / 110));
    const value = pageLoaded && elapsed >= MIN_PRELOADER_MS && shown > .996 ? 1 : shown;
    preloader.style.setProperty('--pl', value.toFixed(4));
    if (value >= 1) { exitPreloader(); return; }
    requestAnimationFrame(tick);
  })(startedAt);
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
const revealElements = document.querySelectorAll('.section-label, .section-heading, .problem-grid article, .node, .connection-detail, .data-loop, .service-card, .process-grid li, .package-grid article, .faq>div, .contact-grid>div, .brief');
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
  if (element.matches('.problem-grid article, .node, .service-card, .process-grid li, .package-grid article')) {
    element.style.setProperty('--reveal-delay', ((index % 3) * 70) + 'ms');
  }
  revealObserver.observe(element);
});
root.classList.add('has-motion');

// Movimentos contínuos param quando a seção sai da tela.
const zoneObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => entry.target.classList.toggle('in-view', entry.isIntersecting));
}, {rootMargin:'100px 0px'});
document.querySelectorAll('.hero-art, .service-card, .connection, .footer-large, .metal, .ticker, .button.primary, .data-loop>span:first-child').forEach(element => {
  element.classList.add('motion-zone');
  zoneObserver.observe(element);
});

// Etapas do ecossistema: a seleção é do visitante.
const steps = [
  ['01 / MOTION DESIGNER', 'O primeiro segundo decide. A gente faz ele valer.', 'Ritmo, narrativa e personalidade. O Motion Designer entrega para o Social Media os cortes e vídeos do mês, prontos para o feed.'],
  ['02 / SOCIAL MEDIA', 'Quem é lembrado é escolhido.', 'Planejamento e conteúdo com uma linguagem consistente. O Social Media leva quem se interessou até a página certa, dando continuidade à mensagem da sua marca.'],
  ['03 / PAGES BUILDER', 'Uma página. Um caminho. Uma decisão.', 'A página continua a história e organiza a oferta. O próximo passo leva o interessado ao Especialista em X1, pelo WhatsApp, com mais clareza sobre o que sua marca oferece.'],
  ['04 / ESPECIALISTA EM X1', 'Onde a conversa vira venda.', 'Atendimento individual no WhatsApp, do primeiro contato ao fechamento. As dúvidas e objeções das conversas voltam como pauta para os próximos vídeos: o ciclo recomeça.']
];
const connectionDetail = document.getElementById('connection-detail');
document.querySelectorAll('.node').forEach(node => node.addEventListener('click', () => {
  document.querySelectorAll('.node').forEach(other => {
    const active = other === node;
    other.classList.toggle('active', active);
    other.setAttribute('aria-pressed', String(active));
  });
  const step = steps[Number(node.dataset.step)];
  document.getElementById('step-label').textContent = step[0];
  document.getElementById('step-title').textContent = step[1];
  document.getElementById('step-copy').textContent = step[2];
  connectionDetail.classList.remove('switching');
  void connectionDetail.offsetWidth;
  connectionDetail.classList.add('switching');
}));

// Caixas: luz que acompanha o cursor + inclinação leve para o lado do cursor (01, 03 e 05).
// Etapas do ecossistema (02): luz e uma leve saltada. Quem manda é o JavaScript, com uma folga de 10 px
// na borda: assim a caixa não fica tremendo quando sobe e o cursor passa a encostar na beirada.
const TILT_X = 5.5;   // graus de inclinação para cima/baixo
const TILT_Y = 7.5;   // graus de inclinação para os lados
const EDGE = 10;      // folga da borda, em px
const tiltCards = [...document.querySelectorAll('.problem-grid article, .service-card, .package-grid article')];
const nodeCards = [...document.querySelectorAll('.node')];
tiltCards.forEach(card => card.classList.add('tilt-card'));
const canHover = event => event.pointerType !== 'touch' && finePointer.matches && !reducedMotion.matches && !effectsPaused;
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
  const x = pointerX - rect.left;
  const y = pointerY - rect.top;
  activeCard.style.setProperty('--mx', x.toFixed(0) + 'px');
  activeCard.style.setProperty('--my', y.toFixed(0) + 'px');
  if (activeCard.classList.contains('tilt-card')) {
    activeCard.style.setProperty('--tilt-x', ((clamp(y / rect.height) - .5) * -2 * TILT_X).toFixed(2) + 'deg');
    activeCard.style.setProperty('--tilt-y', ((clamp(x / rect.width) - .5) * 2 * TILT_Y).toFixed(2) + 'deg');
  }
}
function pointerInside(card) {
  const rect = card.getBoundingClientRect();
  return pointerX >= rect.left - EDGE && pointerX <= rect.right + EDGE && pointerY >= rect.top - EDGE && pointerY <= rect.bottom + EDGE;
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
  if (!pointerInside(activeCard)) { setActive(null); return; }
  if (!paintFrame) paintFrame = requestAnimationFrame(paintActive);
}, {passive:true});
document.documentElement.addEventListener('pointerleave', () => setActive(null));
window.addEventListener('scroll', () => {
  if (activeCard && !pointerInside(activeCard)) setActive(null);
}, {passive:true});
window.addEventListener('blur', () => setActive(null));
document.querySelectorAll('.button').forEach(button => {
  button.addEventListener('pointermove', event => {
    if (!finePointer.matches || reducedMotion.matches || effectsPaused) return;
    const rect = button.getBoundingClientRect();
    const x = (event.clientX - rect.left - rect.width / 2) * .045;
    const y = (event.clientY - rect.top - rect.height / 2) * .09;
    button.style.setProperty('--button-x', x.toFixed(1) + 'px');
    button.style.setProperty('--button-y', y.toFixed(1) + 'px');
  });
  button.addEventListener('pointerleave', () => {
    button.style.setProperty('--button-x', '0px');
    button.style.setProperty('--button-y', '0px');
  });
});
const heroArt = document.querySelector('.hero-art');
const logoLayer = document.querySelector('.logo-parallax');
heroArt.addEventListener('pointermove', event => {
  if (!finePointer.matches || reducedMotion.matches || effectsPaused) return;
  const rect = heroArt.getBoundingClientRect();
  logoLayer.style.setProperty('--logo-rx', ((event.clientY - rect.top - rect.height / 2) * -.025).toFixed(1) + 'deg');
  logoLayer.style.setProperty('--logo-ry', ((event.clientX - rect.left - rect.width / 2) * .025).toFixed(1) + 'deg');
});
heroArt.addEventListener('pointerleave', () => {
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
function updateScroll() {
  scrollFrame = 0;
  const viewport = window.innerHeight;
  const scrollRange = root.scrollHeight - viewport;
  root.style.setProperty('--scroll', scrollRange > 0 ? clamp(window.scrollY / scrollRange) : 0);
  header.classList.toggle('scrolled', window.scrollY > 22);
  const motionEnabled = !reducedMotion.matches && !effectsPaused;
  if (motionEnabled && finePointer.matches) {
    const heroRect = hero.getBoundingClientRect();
    heroArt.style.setProperty('--hero-parallax', (clamp(-heroRect.top, 0, heroRect.height) * .065).toFixed(1) + 'px');
  } else {
    heroArt.style.setProperty('--hero-parallax', '0px');
  }
  const rect = manifesto.getBoundingClientRect();
  if (manifestoPaintedProgress < 0 || (rect.bottom >= 0 && rect.top <= viewport)) {
    // Cada estado depende da posição atual: descer revela, subir recolhe.
    // A altura real do palco mantém a sequência estável quando a barra do celular recolhe.
    const stageHeight = manifestoStage.offsetHeight || viewport;
    const progress = motionEnabled ? clamp(-rect.top / Math.max(1, rect.height - stageHeight)) : 1;
    if (progress !== manifestoPaintedProgress) {
      manifestoPaintedProgress = progress;
      const textProgress = clamp((progress - .12) / .72) * manifestoWords.length;
      manifestoWords.forEach((word, index) => {
        const on = manifestoPhase(textProgress - index, 0, 1);
        word.style.setProperty('--word-opacity', (.07 + on * .93).toFixed(3));
        word.style.setProperty('--word-y', '0px');
      });
      // A inicial acende primeiro; o halo cresce durante a leitura das palavras.
      const glow = manifestoPhase(progress, 0, .85);
      manifesto.style.setProperty('--emblem-glow', glow.toFixed(3));
      manifesto.style.setProperty('--manifesto-glow', (.02 + glow * .98).toFixed(3));
      manifesto.style.setProperty('--emblem-opacity', (.05 + manifestoPhase(progress, 0, .23) * .95).toFixed(3));
      manifesto.style.setProperty('--emblem-scale', '1');
      manifesto.style.setProperty('--sub-opacity', (.07 + manifestoPhase(progress, .78, .95) * .93).toFixed(3));
    }
  }
  const processRect = processGrid.getBoundingClientRect();
  processGrid.style.setProperty('--rail-progress', reducedMotion.matches ? 1 : clamp((viewport * .8 - processRect.top) / Math.max(100, processRect.height + viewport * .15)));
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
  const RESPONSE_MS = 110;
  let frame = 0;
  let target = window.scrollY;
  let writtenY = window.scrollY;
  let lastTime = 0;
  const maxScroll = () => Math.max(0, root.scrollHeight - window.innerHeight);
  const allowed = () => finePointer.matches && !reducedMotion.matches && !effectsPaused
    && !document.hidden && !root.classList.contains('is-loading')
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
  window.addEventListener('hashchange', stop);
  window.addEventListener('popstate', stop);
  reducedMotion.addEventListener('change', stop);
  finePointer.addEventListener('change', stop);
})();

// Partículas azuis e prateadas: desenho leve, até 30 quadros por segundo.
const canvas = document.getElementById('particles');
const context = canvas.getContext('2d');
let particleFrame = 0;
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
  if (!context || reducedMotion.matches || effectsPaused || document.hidden) {
    particleFrame = 0;
    return;
  }
  if (!root.classList.contains('pf-open') && timestamp - lastPaint >= PARTICLE_INTERVAL_MS) {
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
  particleFrame = requestAnimationFrame(paintParticles);
}
function syncMotion() {
  root.classList.toggle('motion-paused', effectsPaused);
  root.classList.toggle('tab-hidden', document.hidden);
  motionToggle.hidden = reducedMotion.matches;
  if (reducedMotion.matches || effectsPaused || document.hidden) {
    cancelAnimationFrame(particleFrame);
    particleFrame = 0;
    if (reducedMotion.matches && context) context.clearRect(0, 0, particleWidth, particleHeight);
  } else if (!particleFrame) {
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
window.addEventListener('resize', sizeParticles, {passive:true});
sizeParticles();
syncMotion();

// O atalho sai do caminho quando o formulário está visível.
const floating = document.querySelector('.floating');
const contactObserver = new IntersectionObserver(entries => {
  floating.classList.toggle('is-hidden', entries[0].isIntersecting);
}, {threshold:.08});
contactObserver.observe(document.getElementById('contato'));

// Seleção de frentes e pacotes preservada da versão mais recente do projeto.
const brief = document.getElementById('brief');
const fronts = [...brief.querySelectorAll('input[name="service"]')];
const packages = [...brief.querySelectorAll('input[name="package"]')];
const packageFronts = {
  'Pacote Presença':'Motion Designer + Social Media',
  'Pacote Conversão':'Pages Builder + Especialista em X1',
  'Ecossistema Nexo':'as quatro frentes'
};
packages.forEach(input => input.addEventListener('change', () => {
  if (!input.checked) return;
  packages.forEach(other => { if (other !== input) other.checked = false; });
  fronts.forEach(front => { front.checked = false; });
}));
fronts.forEach(input => input.addEventListener('change', () => {
  if (input.checked) packages.forEach(pack => { pack.checked = false; });
}));
document.querySelectorAll('[data-package]').forEach(link => link.addEventListener('click', () => {
  const target = packages.find(input => input.value === link.dataset.package);
  if (!target) return;
  target.checked = true;
  target.dispatchEvent(new Event('change'));
}));
document.querySelectorAll('[data-interest]').forEach(link => link.addEventListener('click', () => {
  const target = fronts.find(input => input.value === link.dataset.interest);
  if (!target) return;
  target.checked = true;
  target.dispatchEvent(new Event('change'));
}));
brief.addEventListener('focusin', () => floating.classList.add('is-hidden'));
brief.addEventListener('focusout', event => {
  if (!brief.contains(event.relatedTarget)) {
    floating.classList.toggle('is-hidden', document.getElementById('contato').getBoundingClientRect().top < window.innerHeight);
  }
});
brief.addEventListener('submit', event => {
  event.preventDefault();
  if (!brief.reportValidity()) return;
  const pack = packages.find(input => input.checked);
  const selected = fronts.filter(input => input.checked).map(input => input.value);
  const company = document.getElementById('company-name').value.trim();
  const segment = document.getElementById('company-segment').value.trim();
  const note = document.getElementById('project-note').value.trim();
  const origin = pack ? pack.value : selected.length ? selected.join(' + ') : 'Contato geral';
  const lines = [
    '[Site · ' + origin + ']',
    'Olá, Nexo Studio! Quero conectar minha marca à próxima fase.',
    company ? 'Empresa: ' + company : '',
    segment ? 'Segmento: ' + segment : '',
    pack ? 'Tenho interesse no ' + pack.value + ' (' + packageFronts[pack.value] + ').' : selected.length ? 'Tenho interesse em: ' + selected.join(', ') + '.' : 'Gostaria de ajuda para entender quais frentes fazem sentido para minha marca.',
    note ? 'Sobre meu projeto: ' + note : ''
  ].filter(Boolean);
  window.location.assign('https://wa.me/5511933596263?text=' + encodeURIComponent(lines.join('\n\n')));
});
