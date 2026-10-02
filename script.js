'use strict';

// Keep the page readable when JavaScript is unavailable.
document.documentElement.classList.add('js');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
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
window.matchMedia('(min-width: 761px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

const steps = [
  ['CONEXÃO 01 — AUDIOVISUAL', 'O primeiro segundo importa. Criamos vídeos e peças visuais que despertam interesse e dão à sua marca uma linguagem própria.', 0],
  ['CONEXÃO 02 — SOCIAL MEDIA', 'Interesse vira proximidade. Planejamento e conteúdo consistente conectam sua marca às pessoas certas e mantêm a conversa acontecendo.', 2],
  ['CONEXÃO 03 — SITES & LANDING PAGES', 'Cada clique precisa de um destino. Criamos experiências digitais que apresentam seu valor e facilitam o próximo passo: falar com você.', 1],
  ['CONEXÃO 04 — WHATSAPP & COMERCIAL', 'Boas conversas abrem possibilidades. Estruturamos o atendimento e o acompanhamento de interessados para que as oportunidades tenham continuidade.', 3]
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
    document.querySelector('#step-label').textContent = steps[selectedStep][0];
    document.querySelector('#step-description').textContent = steps[selectedStep][1];
  });
});
const captions = ['FRAME 01 / IDEIAS EM MOVIMENTO', 'FRAME 02 / EXPERIÊNCIAS DIGITAIS', 'FRAME 03 / PRESENÇA COM INTENÇÃO', 'FRAME 04 / CONVERSAS QUE CONECTAM'];
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
}
document.querySelectorAll('.service-trigger').forEach(button => button.addEventListener('click', () => selectService(Number(button.dataset.service))));
document.querySelector('#step-link').addEventListener('click', () => selectService(steps[selectedStep][2]));

// No form data is stored or sent to a server. WhatsApp opens with a draft.
const form = document.querySelector('#brief-form');
const choices = [...form.querySelectorAll('input[name="service"]')];
const completeChoice = choices.find(input => input.value === 'Ecossistema completo');
choices.forEach(input => input.addEventListener('change', () => {
  if (input === completeChoice && input.checked) choices.forEach(other => { if (other !== input) other.checked = false; });
  else if (input.checked) completeChoice.checked = false;
}));
form.addEventListener('submit', event => {
  event.preventDefault();
  const selected = choices.filter(input => input.checked).map(input => input.value);
  const note = form.elements.note.value.trim();
  let message = 'Olá, Nexo Studio! Quero conectar minha marca à próxima fase.';
  message += selected.length ? '\n\nTenho interesse em: ' + selected.join(', ') + '.' : '\n\nGostaria de ajuda para entender quais soluções fazem sentido para minha marca.';
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
  if (reducedMotion.matches || !finePointer.matches) return;
  const rect = heroArt.getBoundingClientRect();
  heroArt.style.setProperty('--ry', ((event.clientX - rect.left) / rect.width - .5) * 22 + 'deg');
  heroArt.style.setProperty('--rx', -((event.clientY - rect.top) / rect.height - .5) * 16 + 'deg');
});
heroArt.addEventListener('pointerleave', () => {
  heroArt.style.setProperty('--rx', '0deg');
  heroArt.style.setProperty('--ry', '0deg');
});
document.querySelector('#year').textContent = String(new Date().getFullYear());
