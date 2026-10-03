'use strict';

const root = document.documentElement;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const header = document.querySelector('.header');
const menu = document.querySelector('.menu');
const nav = document.getElementById('nav');
const motionToggle = document.querySelector('.effects-toggle');
let effectsPaused = false;

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
document.querySelectorAll('.hero-art, .service-card, .connection, .footer-large').forEach(element => {
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

// Brilho que acompanha o ponteiro e inclinação leve de cartões.
const tiltCards = document.querySelectorAll('.problem-grid article, .service-card, .package-grid article');
tiltCards.forEach(card => {
  card.classList.add('tilt-card');
  card.addEventListener('pointermove', event => {
    if (!finePointer.matches || reducedMotion.matches || effectsPaused) return;
    const rect = card.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    card.style.setProperty('--mx', x + 'px');
    card.style.setProperty('--my', y + 'px');
    card.style.setProperty('--tilt-x', ((y / rect.height - .5) * -4).toFixed(2) + 'deg');
    card.style.setProperty('--tilt-y', ((x / rect.width - .5) * 4).toFixed(2) + 'deg');
  });
  card.addEventListener('pointerleave', () => {
    card.style.setProperty('--tilt-x', '0deg');
    card.style.setProperty('--tilt-y', '0deg');
  });
});
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
const manifestoWords = manifesto.querySelectorAll('.manifesto-word');
const processGrid = document.querySelector('.process-grid');
const hero = document.querySelector('.hero');
const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));
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
  if (rect.bottom >= 0 && rect.top <= viewport) {
    const progress = motionEnabled ? clamp(-rect.top / Math.max(1, rect.height - viewport)) : 1;
    manifestoWords.forEach((word, index) => {
      const on = clamp(progress * (manifestoWords.length + 3) - index * .82);
      word.style.setProperty('--word-opacity', (.16 + on * .84).toFixed(3));
      word.style.setProperty('--word-y', (12 * (1 - on)).toFixed(1) + 'px');
    });
    manifesto.style.setProperty('--manifesto-glow', (.2 + clamp(progress * 3) * .8).toFixed(3));
    manifesto.style.setProperty('--emblem-opacity', (.3 + clamp(progress * 5) * .7).toFixed(3));
    manifesto.style.setProperty('--emblem-scale', (.82 + clamp(progress * 4) * .18).toFixed(3));
    manifesto.style.setProperty('--sub-opacity', (.2 + clamp((progress - .55) * 3) * .8).toFixed(3));
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
requestScroll();

// Partículas azuis e prateadas: desenho leve, até 30 quadros por segundo.
const canvas = document.getElementById('particles');
const context = canvas.getContext('2d');
let particleFrame = 0;
let particleWidth = 0;
let particleHeight = 0;
let lastPaint = 0;
const particles = Array.from({length: finePointer.matches ? 38 : 20}, (_, index) => ({
  x:Math.random(), y:Math.random(), depth:.25 + Math.random() * .75,
  radius:.5 + Math.random() * 1.25, phase:Math.random() * Math.PI * 2,
  silver:index % 4 === 0
}));
function sizeParticles() {
  particleWidth = window.innerWidth;
  particleHeight = window.innerHeight;
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 1.5);
  canvas.width = Math.round(particleWidth * pixelRatio);
  canvas.height = Math.round(particleHeight * pixelRatio);
  if (context) context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
}
function paintParticles(timestamp) {
  if (!context || reducedMotion.matches || effectsPaused || document.hidden) {
    particleFrame = 0;
    return;
  }
  if (timestamp - lastPaint >= 33) {
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
