/* =============================================================
   NEXO STUDIO — melhorias.js (opcional)
   -------------------------------------------------------------
   Correções de acessibilidade que o CSS sozinho não consegue
   fazer. Não muda nada no visual do site.

   Como usar: antes de </body>, DEPOIS do seu script principal:
   <script src="melhorias.js" defer></script>

   Cada correção roda isolada: se uma falhar, as outras e o
   resto do site continuam funcionando normalmente.
   ============================================================= */
(function () {
  'use strict';

  /* Símbolos decorativos usados no site (▷ ✳ ↗ ↓ ↑ ⌁ Ⅱ ✓ ●).
     Leitores de tela leem esses símbolos em voz alta
     ("seta para cima e para a direita"), o que atrapalha. */
  var CHARS = '▷▶✳↗↘↓↑⌁Ⅱ✓●';
  var TEM_SIMBOLO = new RegExp('[' + CHARS + '+−]');
  var SO_SIMBOLO = new RegExp('^[\\s' + CHARS + '+−]+$');
  // + e − só contam como ícone quando estão sozinhos no fim do texto
  // (ícone de abrir/fechar). Assim "+55" e "Estratégia + Conteúdo" ficam intactos.
  var SIMBOLOS = new RegExp('(^|[^0-9A-Za-zÀ-ÿ])([+−])\\s*$|([' + CHARS + ']+)', 'g');

  var INTERATIVOS = 'a[href], button, summary, [role="button"], [role="tab"]';
  var IGNORAR = 'script, style, noscript, textarea, input, select, option, code, pre, svg, [aria-hidden="true"]';
  var FOCAVEIS = 'a[href], button, input, select, textarea, summary, [tabindex]';

  function seguro(fn) {
    try { fn(); } catch (e) { /* nunca quebra o site */ }
  }

  function limpar(texto) {
    return texto.replace(SIMBOLOS, '$1').replace(/\s+/g, ' ').trim();
  }

  /* 1. Logo sem nome
     O link do logo (#inicio) não tem texto: leitores de tela anunciam
     "link, #inicio". Aqui ele passa a se chamar "Nexo Studio". */
  function rotularLogo() {
    document.querySelectorAll('a[href="#inicio"]').forEach(function (a) {
      if (a.getAttribute('aria-label') || a.textContent.trim()) return;
      if (a.querySelector('img[alt]:not([alt=""]), [aria-label]')) return;
      a.setAttribute('aria-label', 'Nexo Studio, voltar ao início');
    });
  }

  /* 2. Faixa de texto em movimento ("Ideias que conectam ✳ ...")
     O texto é repetido várias vezes. É escondido dos leitores de tela,
     continua visível normalmente. */
  function esconderLetreiros() {
    var alvos = [];
    document.querySelectorAll('[class*="marquee" i], [class*="ticker" i]').forEach(function (el) {
      alvos.push(el);
    });
    // Reserva: qualquer bloco sem links que repete ✳ quatro vezes ou mais
    document.querySelectorAll('body *').forEach(function (el) {
      if (el.matches('main, section, header, footer, h1, h2, h3, script, style')) return;
      if (contar(el) < 4) return;
      for (var i = 0; i < el.children.length; i++) {
        if (contar(el.children[i]) >= 4) return; // fica com o mais interno
      }
      if (el.querySelector(FOCAVEIS)) return;
      alvos.push(el);
    });
    alvos.forEach(function (el) {
      if (!el.closest('[aria-hidden="true"]') && !el.querySelector(FOCAVEIS)) {
        el.setAttribute('aria-hidden', 'true');
      }
    });
  }

  function contar(el) {
    return (el.textContent.match(/✳/g) || []).length;
  }

  /* 3. Botões e links com símbolos ("Vamos conversar ↗", "Audiovisual +")
     Recebem um nome limpo para leitores de tela. Se o texto do botão mudar
     (ex.: "Pausar efeitos" → "Retomar efeitos"), o nome é atualizado. */
  function rotularInterativos() {
    document.querySelectorAll(INTERATIVOS).forEach(function (el) {
      var nosso = el.hasAttribute('data-nx-rotulo');
      if (el.hasAttribute('aria-label') && !nosso) return; // já tem nome do autor
      if (el.closest('[aria-hidden="true"]')) return;
      var texto = el.textContent;
      if (!TEM_SIMBOLO.test(texto)) {
        if (nosso) { el.removeAttribute('aria-label'); el.removeAttribute('data-nx-rotulo'); }
        return;
      }
      var limpo = limpar(texto);
      if (!limpo || limpo === texto.trim()) return;
      if (el.getAttribute('aria-label') !== limpo) el.setAttribute('aria-label', limpo);
      el.setAttribute('data-nx-rotulo', '');
    });
  }

  /* 4. Símbolos soltos em textos comuns (fora de botões e links) */
  function esconderSimbolos() {
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (no) {
        if (!no.nodeValue || !TEM_SIMBOLO.test(no.nodeValue)) return NodeFilter.FILTER_SKIP;
        var pai = no.parentElement;
        if (!pai || pai.closest(IGNORAR) || pai.closest(INTERATIVOS)) return NodeFilter.FILTER_SKIP;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    var nos = [];
    while (walker.nextNode()) nos.push(walker.currentNode);
    nos.forEach(tratarTexto);
  }

  function tratarTexto(no) {
    var texto = no.nodeValue;
    var pai = no.parentElement;

    // Elemento que contém só o símbolo (ex.: <span>+</span>): esconde o elemento todo
    if (SO_SIMBOLO.test(texto) && pai.childNodes.length === 1 &&
        !pai.matches('h1, h2, h3, h4, h5, h6, p, li, body')) {
      pai.setAttribute('aria-hidden', 'true');
      return;
    }

    // Símbolo no meio de um texto: envolve só o símbolo
    var frag = document.createDocumentFragment();
    var ultimo = 0, mudou = false, m;
    SIMBOLOS.lastIndex = 0;
    while ((m = SIMBOLOS.exec(texto))) {
      var simbolo = m[2] || m[3];
      var inicio = m[2] ? m.index + m[1].length : m.index;
      if (inicio > ultimo) frag.appendChild(document.createTextNode(texto.slice(ultimo, inicio)));
      var span = document.createElement('span');
      span.setAttribute('aria-hidden', 'true');
      span.textContent = simbolo;
      frag.appendChild(span);
      ultimo = inicio + simbolo.length;
      mudou = true;
    }
    if (!mudou) return;
    if (ultimo < texto.length) frag.appendChild(document.createTextNode(texto.slice(ultimo)));
    pai.replaceChild(frag, no);
  }

  /* 5. Opções do formulário ("Audiovisual", "Sites & landing pages"...)
     Informa aos leitores de tela se a opção está marcada ou não.
     Só é ativado depois de confirmar, no primeiro clique, que o seu
     código marca a opção com uma classe (ex.: "active", "selected").
     Se não confirmar, não mexe em nada, para evitar informação errada. */
  function opcoesContato() {
    var contato = document.getElementById('contato');
    if (!contato) return;
    var ATIVO = /^(is-)?(active|selected|checked|on|ativo|ativa|selecionado|selecionada|marcado|marcada)$/i;
    var botoes = [].filter.call(contato.querySelectorAll('button'), function (b) {
      return b.getAttribute('type') !== 'submit' &&
        !b.hasAttribute('aria-pressed') && !b.hasAttribute('aria-expanded') &&
        !b.hasAttribute('role') && !/whatsapp|enviar/i.test(b.textContent);
    });
    if (!botoes.length) return;

    var ligado = function (b) {
      return [].some.call(b.classList, function (c) { return ATIVO.test(c); }) ||
        b.dataset.selected === 'true' || b.dataset.active === 'true';
    };
    var confirmado = false;

    // "Assinatura" do botão: suas classes sem as de estado (active, selected...)
    var assinatura = function (b) {
      return [].filter.call(b.classList, function (c) { return !ATIVO.test(c); }).sort().join(' ');
    };

    function ativar(modelo) {
      confirmado = true;
      var tipo = assinatura(modelo);
      botoes.forEach(function (b) {
        if (assinatura(b) !== tipo) return; // só botões do mesmo tipo das opções
        var atualizar = function () { b.setAttribute('aria-pressed', ligado(b) ? 'true' : 'false'); };
        atualizar();
        new MutationObserver(atualizar)
          .observe(b, { attributes: true, attributeFilter: ['class', 'data-selected', 'data-active'] });
      });
    }

    // Fase de captura: lê o estado ANTES do seu script reagir ao clique
    contato.addEventListener('click', function (e) {
      if (confirmado) return;
      var b = e.target.closest && e.target.closest('button');
      if (!b || botoes.indexOf(b) === -1) return;
      var antes = ligado(b);
      setTimeout(function () {
        if (!confirmado && ligado(b) !== antes) ativar(b);
      }, 0);
    }, true);
  }

  /* 6. Botão flutuante "Vamos conectar"
     Some enquanto a seção de contato está na tela, para não cobrir
     o formulário no celular. Volta ao sair da seção. */
  function ctaFlutuante() {
    var contato = document.getElementById('contato');
    if (!contato || !('IntersectionObserver' in window)) return;

    function marcarFlutuantes() {
      document.querySelectorAll('a[href*="wa.me"]').forEach(function (a) {
        var el = a;
        for (var i = 0; el && el !== document.body && i < 4; i++, el = el.parentElement) {
          if (getComputedStyle(el).position !== 'fixed') continue;
          var r = el.getBoundingClientRect();
          // Só o que fica na metade de baixo da tela (o menu do topo não entra)
          if (r.height > 0 && r.height < 200 && r.top > window.innerHeight * 0.5 && !contato.contains(el)) {
            el.classList.add('nx-cta-flutuante');
          }
          return;
        }
      });
      return document.querySelectorAll('.nx-cta-flutuante');
    }

    new IntersectionObserver(function (entradas) {
      var visivel = entradas[entradas.length - 1].isIntersecting;
      marcarFlutuantes().forEach(function (el) {
        el.classList.toggle('nx-cta-recolhido', visivel);
        if (visivel) el.setAttribute('aria-hidden', 'true');
        else el.removeAttribute('aria-hidden');
      });
    }, { rootMargin: '0px 0px -30% 0px', threshold: 0 }).observe(contato);
  }

  /* Execução */
  function rodar() {
    seguro(rotularLogo);
    seguro(esconderLetreiros);
    seguro(rotularInterativos);
    seguro(esconderSimbolos);
  }

  function iniciar() {
    rodar();
    seguro(opcoesContato);
    seguro(ctaFlutuante);

    // Mantém tudo certo se o seu script trocar textos depois
    // (ex.: o botão "Pausar efeitos")
    var agendado = null;
    seguro(function () {
      new MutationObserver(function () {
        clearTimeout(agendado);
        agendado = setTimeout(function () { seguro(rotularInterativos); seguro(esconderSimbolos); }, 150);
      }).observe(document.body, { childList: true, subtree: true, characterData: true });
    });

    window.addEventListener('load', rodar, { once: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', iniciar, { once: true });
  } else {
    iniciar();
  }
})();
