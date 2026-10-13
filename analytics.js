/* Nexo Studio — visitas, origem, abertura de portfólios e intenção de contato. */
(() => {
  'use strict';
  const measurementId = String(window.NEXO_ANALYTICS?.measurementId || '').trim();
  if (!/^G-[A-Z0-9]{6,20}$/.test(measurementId)) return;

  function pageLocation() {
    const url = new URL(window.location.href);
    const campaign = new URLSearchParams();
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(key => {
      const value = url.searchParams.get(key);
      if (value) campaign.set(key, value.slice(0, 120));
    });
    return url.origin + url.pathname + (campaign.size ? '?' + campaign.toString() : '');
  }
  function referrerOrigin() {
    try { return document.referrer ? new URL(document.referrer).origin + '/' : ''; }
    catch (error) { return ''; }
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    send_page_view: true,
    page_title: document.title,
    page_location: pageLocation(),
    page_referrer: referrerOrigin(),
    allow_google_signals: false,
    allow_ad_personalization_signals: false
  });

  const tag = document.createElement('script');
  tag.async = true;
  tag.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(measurementId);
  document.head.appendChild(tag);

  function track(name, parameters) {
    window.gtag('event', name, { send_to: measurementId, ...parameters });
  }
  const plans = {
    'Plano Presença': 'presenca',
    'Ecossistema Nexo': 'ecossistema',
    'Plano Sites e páginas': 'sites'
  };
  let lastPortfolio = '';
  function trackPortfolio(event) {
    const supplied = event?.detail?.category;
    const route = window.location.hash.match(/^#portfolio\/(motion|web)(?:\/[a-z0-9-]+)?$/);
    const category = typeof supplied === 'string' ? supplied : document.querySelector('#nexo-portfolio')?.open && route ? route[1] : '';
    if (category && category !== lastPortfolio) track('portfolio_open', { portfolio_category: category });
    lastPortfolio = category;
  }
  document.addEventListener('click', event => {
    const link = event.target?.closest?.('a[href]');
    if (link) {
      let url;
      try { url = new URL(link.getAttribute('href'), window.location.href); }
      catch (error) { url = null; }
      if (url?.hostname === 'wa.me' && url.pathname === '/5511933596263') {
        const section = link.closest('section')?.id;
        const source = link.classList.contains('floating') ? 'floating' : link.closest('header') ? 'header' : link.closest('footer') ? 'footer' : section || 'portfolio';
        const parameters = { source_section: source };
        const plan = plans[link.dataset.package];
        if (plan) parameters.plan_name = plan;
        track('whatsapp_click', parameters);
      }
    }
  }, { capture: true, passive: true });
  document.addEventListener('submit', event => {
    if (event.target?.id === 'brief') track('whatsapp_click', { source_section: 'brief' });
  }, { capture: true, passive: true });
  // Conta apenas aberturas reais, inclusive por teclado e pelo histórico.
  document.addEventListener('nexo:portfolioview', trackPortfolio);
  trackPortfolio();
})();
