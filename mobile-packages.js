/* Pacotes no mobile: arraste nativo, foco crescente e navegação acessível. */
(() => {
  'use strict';
  const grid = document.querySelector('.package-grid');
  if (!grid) return;
  const cards = [...grid.children].filter(element => element.tagName === 'ARTICLE');
  if (cards.length < 2) return;
  const mobile = window.matchMedia('(max-width:760px)');
  const reduced = window.matchMedia('(prefers-reduced-motion:reduce)');
  const originalGrid = ['id','role','aria-label','aria-roledescription','tabindex','data-native-scroll'].map(name => [name, grid.getAttribute(name)]);
  const originalCards = cards.map(card => ['role','aria-label','aria-roledescription'].map(name => [name, card.getAttribute(name)]));
  const names = cards.map(card => card.querySelector('h3')?.textContent.trim() || 'Pacote');
  const cachedValues = new WeakMap();
  let controls = null;
  let dots = [];
  let count = null;
  let status = null;
  // O pacote completo é o destaque inicial no celular, no centro dos três planos.
  let activeIndex = Math.max(0, cards.findIndex(card => card.classList.contains('package-featured')));
  let frame = 0;
  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const pad = number => String(number).padStart(2, '0');
  const canAnimate = () => !reduced.matches && !document.documentElement.classList.contains('motion-paused');

  function paint(card, property, value) {
    let values = cachedValues.get(card);
    if (!values) { values = new Map(); cachedValues.set(card, values); }
    if (values.get(property) === value) return;
    values.set(property, value);
    card.style.setProperty(property, value);
  }

  function select(index) {
    activeIndex = index;
    cards.forEach((card, i) => card.classList.toggle('is-package-current', i === index));
    dots.forEach((dot, i) => {
      if (i === index) dot.setAttribute('aria-current', 'true');
      else dot.removeAttribute('aria-current');
    });
    count.textContent = pad(index + 1);
    status.textContent = names[index] + ', pacote ' + (index + 1) + ' de ' + cards.length + '.';
  }

  function update() {
    frame = 0;
    if (!controls || !mobile.matches) return;
    const middle = grid.scrollLeft + grid.clientWidth / 2;
    // Medidas sem transform: o zoom não interfere no encaixe nem cria oscilações.
    const positions = cards.map(card => ({center:card.offsetLeft + card.offsetWidth / 2, width:card.offsetWidth}));
    let nearest = 0;
    positions.forEach((position, i) => {
      if (Math.abs(position.center - middle) < Math.abs(positions[nearest].center - middle)) nearest = i;
    });
    const animate = canAnimate();
    positions.forEach((position, i) => {
      const distance = (position.center - middle) / Math.max(1, position.width + 12);
      const focus = 1 - clamp(Math.abs(distance), 0, 1);
      const eased = focus * focus * (3 - 2 * focus);
      paint(cards[i], '--package-scale', (animate ? .93 + .07 * eased : 1).toFixed(4));
      paint(cards[i], '--package-opacity', (animate ? .7 + .3 * eased : 1).toFixed(3));
      paint(cards[i], '--package-origin', clamp(50 - distance * 50, 0, 100).toFixed(1) + '%');
    });
    if (!cards[nearest].classList.contains('is-package-current')) select(nearest);
  }

  function schedule() {
    if (controls && !frame) frame = requestAnimationFrame(update);
  }

  function goTo(index, animate = canAnimate()) {
    if (!controls) return;
    const target = cards[clamp(index, 0, cards.length - 1)];
    const left = target.offsetLeft + target.offsetWidth / 2 - grid.clientWidth / 2;
    grid.scrollTo({left:Math.max(0, left), behavior:animate ? 'smooth' : 'instant'});
    schedule();
  }

  function restore(element, attributes) {
    attributes.forEach(([name, value]) => value === null ? element.removeAttribute(name) : element.setAttribute(name, value));
  }

  function sync() {
    if (!mobile.matches) {
      if (!controls) return;
      cancelAnimationFrame(frame);
      frame = 0;
      controls.remove();
      controls = null;
      dots = [];
      grid.classList.remove('package-carousel');
      restore(grid, originalGrid);
      cards.forEach((card, i) => {
        card.classList.remove('is-package-current');
        ['--package-scale','--package-opacity','--package-origin'].forEach(property => card.style.removeProperty(property));
        cachedValues.delete(card);
        restore(card, originalCards[i]);
      });
      grid.scrollLeft = 0;
      return;
    }
    if (controls) { goTo(activeIndex, false); return; }
    grid.classList.add('package-carousel');
    grid.id = grid.id || 'nexo-packages';
    grid.setAttribute('role', 'region');
    grid.setAttribute('aria-label', 'Pacotes Nexo');
    grid.setAttribute('aria-roledescription', 'carrossel');
    grid.setAttribute('tabindex', '0');
    grid.setAttribute('data-native-scroll', '');
    cards.forEach((card, i) => {
      card.setAttribute('role', 'group');
      card.setAttribute('aria-roledescription', 'slide');
      card.setAttribute('aria-label', names[i] + ', ' + (i + 1) + ' de ' + cards.length);
    });
    controls = document.createElement('div');
    controls.className = 'package-carousel-nav';
    controls.innerHTML = '<span class="package-carousel-hint" aria-hidden="true">Deslize ↔</span><div class="package-carousel-dots" aria-label="Escolher pacote"></div><span class="package-carousel-count" aria-hidden="true"><strong>01</strong> / ' + pad(cards.length) + '</span><span class="package-carousel-status" role="status" aria-live="polite"></span>';
    grid.after(controls);
    count = controls.querySelector('strong');
    status = controls.querySelector('[role="status"]');
    dots = cards.map((card, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'package-carousel-dot';
      dot.setAttribute('aria-label', 'Mostrar pacote ' + names[i]);
      dot.setAttribute('aria-controls', grid.id);
      dot.addEventListener('click', () => goTo(i));
      controls.querySelector('.package-carousel-dots').append(dot);
      return dot;
    });
    select(activeIndex);
    goTo(activeIndex, false);
  }

  grid.addEventListener('scroll', schedule, {passive:true});
  grid.addEventListener('keydown', event => {
    if (!controls || event.target !== grid || event.altKey || event.ctrlKey || event.metaKey) return;
    const index = event.key === 'ArrowRight' ? activeIndex + 1 : event.key === 'ArrowLeft' ? activeIndex - 1 : event.key === 'Home' ? 0 : event.key === 'End' ? cards.length - 1 : null;
    if (index === null) return;
    event.preventDefault();
    goTo(index);
  });
  grid.addEventListener('focusin', event => {
    if (!controls) return;
    const index = cards.findIndex(card => card.contains(event.target));
    if (index >= 0 && index !== activeIndex) goTo(index);
  });
  mobile.addEventListener('change', sync);
  reduced.addEventListener('change', schedule);
  window.addEventListener('resize', () => { if (controls) goTo(activeIndex, false); }, {passive:true});
  document.querySelector('.effects-toggle')?.addEventListener('click', schedule);
  if (document.fonts) document.fonts.ready.then(() => { if (controls) goTo(activeIndex, false); });
  sync();
})();
