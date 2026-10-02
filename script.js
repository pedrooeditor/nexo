'use strict';

const root = document.documentElement;
// Keep the page readable when JavaScript is unavailable.
root.classList.add('js');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

/* ------------------------------------------------------------------
   Tela de abertura: logo brilhando, depois o topo do site entra.
   Fica no mínimo 1,8 s na tela e sai assim que a página termina de carregar.
------------------------------------------------------------------- */
const MIN_PRELOADER_MS = 1800;
function finishLoading() {
  if (root.classList.contains('is-entered')) return;
  root.classList.remove('is-loading');
  root.classList.add('is-entered');
}
function scheduleFinish() {
  if (!root.classList.contains('is-loading')) { finishLoading(); return; }
  // performance.now() conta desde que a página começou a abrir.
  setTimeout(finishLoading, Math.max(0, MIN_PRELOADER_MS - performance.now()));
}
if (document.readyState === 'complete') scheduleFinish();
else window.addEventListener('load', scheduleFinish, { once: true });

/* ------------------------------------------------------------------
   Pausar efeitos
------------------------------------------------------------------- */
const motionToggle = document.querySelector('.motion-toggle');
motionToggle.addEventListener('click', () => {
  const paused = root.classList.toggle('motion-paused');
  motionToggle.setAttribute('aria-pressed', String(paused));
  motionToggle.innerHTML = paused ? 'Ativar efeitos <span aria-hidden="true">▷</span>' : 'Pausar efeitos <span aria-hidden="true">Ⅱ</span>';
  queueScroll();
});

/* ------------------------------------------------------------------
   Menu do celular
------------------------------------------------------------------- */
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

/* ------------------------------------------------------------------
   As quatro frentes (lista com cena ao lado)
------------------------------------------------------------------- */
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

/* ------------------------------------------------------------------
   Formulário: nada é guardado nem enviado a um servidor.
   O WhatsApp abre com a mensagem pronta.
------------------------------------------------------------------- */
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

/* ------------------------------------------------------------------
   Entrada suave dos blocos e pausa das animações fora da tela
------------------------------------------------------------------- */
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } });
  }, { threshold: .08 });
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
} else document.querySelectorAll('.reveal').forEach(element => element.classList.add('visible'));

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
  root.classList.toggle('page-inactive', document.hidden);
});
form.addEventListener('focusin', () => document.querySelector('.floating-contact').classList.add('keyboard-open'));
form.addEventListener('focusout', event => {
  if (!form.contains(event.relatedTarget)) document.querySelector('.floating-contact').classList.remove('keyboard-open');
});

/* ------------------------------------------------------------------
   Efeitos ligados à rolagem (uma única atualização por quadro):
   1. barra de progresso no topo
   2. frase que se revela palavra por palavra
   3. linha do ciclo que vai se preenchendo
------------------------------------------------------------------- */
const progress = document.querySelector('.scroll-progress');
const statement = document.querySelector('.statement');
const statementWords = [...document.querySelectorAll('.statement .word')];
const cycleSteps = document.querySelector('.cycle-steps');
const cycleItems = [...document.querySelectorAll('.cycle-step')];

function updateStatement() {
  const rect = statement.getBoundingClientRect();
  const distance = rect.height - window.innerHeight;
  // 0 quando a seção chega ao topo, 1 quando termina de rolar.
  const p = distance > 0 ? clamp(-rect.top / distance, 0, 1) : 1;
  const count = statementWords.length;
  // Cada palavra acende numa faixa própria, com uma sobreposição pequena entre elas.
  const usable = .86;
  const slot = usable / count;
  statementWords.forEach((word, index) => {
    const start = index * slot;
    word.style.setProperty('--o', clamp((p - start) / (slot * 1.7), 0, 1).toFixed(3));
  });
  statement.style.setProperty('--p', p.toFixed(3));
  statement.classList.toggle('is-started', p > .05);
}

function updateCycle() {
  const rect = cycleSteps.getBoundingClientRect();
  const line = clamp((window.innerHeight * .62 - rect.top) / rect.height, 0, 1);
  cycleSteps.style.setProperty('--line', line.toFixed(3));
  // Uma etapa fica "acesa" quando a linha já passou por ela.
  cycleItems.forEach(item => {
    const itemRect = item.getBoundingClientRect();
    item.classList.toggle('is-lit', itemRect.top + itemRect.height * .35 < window.innerHeight * .62);
  });
}

let scrollQueued = false;
function updateScroll() {
  const max = root.scrollHeight - window.innerHeight;
  progress.style.transform = 'scaleX(' + (max > 0 ? window.scrollY / max : 0) + ')';
  updateStatement();
  updateCycle();
  scrollQueued = false;
}
function queueScroll() {
  if (!scrollQueued) { scrollQueued = true; requestAnimationFrame(updateScroll); }
}
window.addEventListener('scroll', queueScroll, { passive: true });
window.addEventListener('resize', queueScroll, { passive: true });
updateScroll();

/* ------------------------------------------------------------------
   Logo do topo acompanha o ponteiro (só com mouse)
------------------------------------------------------------------- */
const heroArt = document.querySelector('.hero-art');
const finePointer = window.matchMedia('(pointer: fine)');
heroArt.addEventListener('pointermove', event => {
  if (reducedMotion.matches || !finePointer.matches || root.classList.contains('motion-paused')) return;
  const rect = heroArt.getBoundingClientRect();
  heroArt.style.setProperty('--ry', ((event.clientX - rect.left) / rect.width - .5) * 22 + 'deg');
  heroArt.style.setProperty('--rx', -((event.clientY - rect.top) / rect.height - .5) * 16 + 'deg');
});
heroArt.addEventListener('pointerleave', () => {
  heroArt.style.setProperty('--rx', '0deg');
  heroArt.style.setProperty('--ry', '0deg');
});
document.querySelector('#year').textContent = String(new Date().getFullYear());
