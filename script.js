'use strict';

// Keep the page readable when JavaScript is unavailable.
document.documentElement.classList.add('js');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const motionToggle = document.querySelector('.motion-toggle');
motionToggle.addEventListener('click', () => {
  const paused = document.documentElement.classList.toggle('motion-paused');
  motionToggle.setAttribute('aria-pressed', String(paused));
  motionToggle.innerHTML = paused ? 'Ativar efeitos <span aria-hidden="true">▷</span>' : 'Pausar efeitos <span aria-hidden="true">Ⅱ</span>';
});
const menuToggle = document.querySelector('.menu-toggle');
const mobileNav = document.querySelector('#mobile-nav');
function closeMenu(restoreFocus = false) {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Abrir menu');
  mobileNav.hidden = true;
  if (restoreFocus) menuToggle.focus();
}
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  mobileNav.hidden = !open;
});
mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => closeMenu()));
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !mobileNav.hidden) closeMenu(true);
});
document.addEventListener('click', event => {
  if (!mobileNav.hidden && !mobileNav.contains(event.target) && !menuToggle.contains(event.target)) closeMenu();
});
const compactLayout = window.matchMedia('(max-width: 980px)');
compactLayout.addEventListener('change', event => { if (!event.matches) closeMenu(); });

// Etapas do ecossistema: [rótulo, slogan, descrição, passagem para a próxima frente, índice do serviço]
const steps = [
  ['CONEXÃO 01 — MOTION DESIGNER · PEDRO', 'O primeiro segundo decide. A gente faz ele valer.', 'Vídeos e peças em movimento que param a rolagem e dão à sua marca uma linguagem própria.', 'Entrega para o Social Media: os cortes e vídeos do mês, prontos para o feed.', 0],
  ['CONEXÃO 02 — SOCIAL MEDIA · KAUÃ', 'Quem é lembrado é escolhido.', 'Planejamento e conteúdo consistente mantêm sua marca presente para as pessoas certas.', 'Entrega para o Pages Builder: quem se interessou, levado até a página certa.', 1],
  ['CONEXÃO 03 — PAGES BUILDER · BRENO', 'Uma página. Um caminho. Uma decisão.', 'Landing pages que apresentam seu valor com clareza e levam ao próximo passo: falar com você.', 'Entrega para o Especialista em X1: o cliente chega ao WhatsApp sabendo o que quer.', 2],
  ['CONEXÃO 04 — ESPECIALISTA EM X1 · PEDRO', 'Onde a conversa vira venda.', 'Atendimento individual no WhatsApp, do primeiro contato ao fechamento.', 'Fecha o ciclo: as dúvidas e objeções das conversas voltam como pauta para o próximo vídeo.', 3]
];
let selectedStep = 0;
document.querySelectorAll('.connection-node').forEach(button => {
  button.addEventListener('click', () => {
    selectedStep = Number(button.dataset.step);
    document.querySelectorAll('.connection-node').forEach(node => {
      const active = node === button;
      node.classList.toggle('active', active);
      node.setAttribute('aria-pressed', String(active));
    });
    const [label, slogan, description, handoff] = steps[selectedStep];
    document.querySelector('#step-label').textContent = label;
    document.querySelector('#step-slogan').textContent = slogan;
    document.querySelector('#step-description').textContent = description;
    document.querySelector('#step-handoff').textContent = handoff;
  });
});
const captions = ['FRAME 01 / MOTION DESIGNER', 'FRAME 02 / SOCIAL MEDIA', 'FRAME 03 / PAGES BUILDER', 'FRAME 04 / ESPECIALISTA EM X1'];
const serviceVisual = document.querySelector('.service-visual');
const servicesLayout = document.querySelector('.services-layout');
function positionServiceVisual() {
  const destination = compactLayout.matches ? document.querySelector('.service-item.active') : servicesLayout;
  if (serviceVisual.parentElement !== destination) destination.append(serviceVisual);
}
compactLayout.addEventListener('change', positionServiceVisual);
positionServiceVisual();
function selectService(index) {
  document.querySelectorAll('.service-trigger').forEach(button => {
    const active = Number(button.dataset.service) === index;
    button.setAttribute('aria-expanded', String(active));
    button.closest('.service-item').classList.toggle('active', active);
    document.getElementById(button.getAttribute('aria-controls')).hidden = !active;
    button.querySelector('.service-plus').textContent = active ? '−' : '+';
  });
  document.querySelector('.service-visual').dataset.scene = String(index);
  document.querySelector('#scene-caption').textContent = captions[index];
  positionServiceVisual();
}
document.querySelectorAll('.service-trigger').forEach(button => button.addEventListener('click', () => {
  selectService(Number(button.dataset.service));
  // Collapsing the previous scene can move a tapped heading above the viewport.
  if (compactLayout.matches) requestAnimationFrame(() => {
    const headerBottom = document.querySelector('.header').getBoundingClientRect().bottom;
    if (button.getBoundingClientRect().top < headerBottom) button.scrollIntoView({ block: 'start', behavior: 'instant' });
  });
}));
document.querySelector('#step-link').addEventListener('click', () => selectService(steps[selectedStep][4]));

// No form data is stored or sent to a server. WhatsApp opens with a draft.
const form = document.querySelector('#brief-form');
const fronts = [...form.querySelectorAll('input[name="service"]')];
const packages = [...form.querySelectorAll('input[name="package"]')];
const packageFronts = {
  'Pacote Presença': 'Motion Designer + Social Media',
  'Pacote Conversão': 'Pages Builder + Especialista em X1',
  'Ecossistema Nexo': 'as quatro frentes'
};
// Uma combinação substitui as frentes avulsas, e vice-versa.
packages.forEach(input => input.addEventListener('change', () => {
  if (!input.checked) return;
  packages.forEach(other => { if (other !== input) other.checked = false; });
  fronts.forEach(front => { front.checked = false; });
}));
fronts.forEach(input => input.addEventListener('change', () => {
  if (input.checked) packages.forEach(pack => { pack.checked = false; });
}));
// Os botões "Quero esse pacote" já deixam a combinação marcada no formulário.
document.querySelectorAll('[data-package]').forEach(link => link.addEventListener('click', () => {
  const target = packages.find(input => input.value === link.dataset.package);
  if (!target) return;
  target.checked = true;
  target.dispatchEvent(new Event('change'));
}));
form.addEventListener('submit', event => {
  event.preventDefault();
  const pack = packages.find(input => input.checked);
  const selected = fronts.filter(input => input.checked).map(input => input.value);
  const company = form.elements.company.value.trim();
  const segment = form.elements.segment.value.trim();
  const note = form.elements.note.value.trim();
  // A etiqueta de origem ajuda o atendimento a saber, antes de responder, quem do time envolver.
  const origin = pack ? pack.value : selected.length ? selected.join(' + ') : 'Contato geral';
  let message = '[Site · ' + origin + ']\n\nOlá, Nexo Studio! Quero conectar minha marca à próxima fase.';
  if (company) message += '\n\nEmpresa: ' + company;
  if (segment) message += (company ? '\n' : '\n\n') + 'Segmento: ' + segment;
  if (pack) message += '\n\nTenho interesse no ' + pack.value + ' (' + packageFronts[pack.value] + ').';
  else if (selected.length) message += '\n\nTenho interesse em: ' + selected.join(', ') + '.';
  else message += '\n\nGostaria de ajuda para entender quais frentes fazem sentido para minha marca.';
  if (note) message += '\n\nSobre meu projeto: ' + note;
  const url = 'https://wa.me/5511933596263?text=' + encodeURIComponent(message);
  // Same-tab navigation works reliably with popup blockers and mobile WhatsApp.
  window.location.assign(url);
});

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } });
  }, { threshold: .08 });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
} else document.querySelectorAll('.reveal').forEach(element => element.classList.add('visible'));

// Stop continuous decorative animations outside the viewport.
if ('IntersectionObserver' in window) {
  const animationObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.target.classList.toggle('offscreen-animation', !entry.isIntersecting));
  }, { rootMargin: '80px' });
  document.querySelectorAll('.hero-art, .ticker, .service-visual').forEach(element => animationObserver.observe(element));
  const contactObserver = new IntersectionObserver(entries => {
    document.querySelector('.floating-contact').classList.toggle('contact-in-view', entries[0].isIntersecting);
  });
  contactObserver.observe(document.querySelector('#contato'));
}
document.addEventListener('visibilitychange', () => {
  document.documentElement.classList.toggle('page-inactive', document.hidden);
});
form.addEventListener('focusin', () => document.querySelector('.floating-contact').classList.add('keyboard-open'));
form.addEventListener('focusout', event => {
  if (!form.contains(event.relatedTarget)) document.querySelector('.floating-contact').classList.remove('keyboard-open');
});

const progress = document.querySelector('.scroll-progress');
let scrollQueued = false;
function updateScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = 'scaleX(' + (max > 0 ? window.scrollY / max : 0) + ')';
  scrollQueued = false;
}
window.addEventListener('scroll', () => {
  if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateScroll); }
}, { passive: true });
window.addEventListener('resize', updateScroll, { passive: true });
updateScroll();

const heroArt = document.querySelector('.hero-art');
const finePointer = window.matchMedia('(pointer: fine)');
heroArt.addEventListener('pointermove', event => {
  if (reducedMotion.matches || !finePointer.matches || document.documentElement.classList.contains('motion-paused')) return;
  const rect = heroArt.getBoundingClientRect();
  heroArt.style.setProperty('--ry', ((event.clientX - rect.left) / rect.width - .5) * 22 + 'deg');
  heroArt.style.setProperty('--rx', -((event.clientY - rect.top) / rect.height - .5) * 16 + 'deg');
});
heroArt.addEventListener('pointerleave', () => {
  heroArt.style.setProperty('--rx', '0deg');
  heroArt.style.setProperty('--ry', '0deg');
});
document.querySelector('#year').textContent = String(new Date().getFullYear());
