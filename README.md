# Nexo Studio

Site institucional da Nexo Studio em HTML, CSS e JavaScript puros. A identidade usa a logo original, preto profundo, azul elétrico e prata, com brilho e animações inspirados nas referências de movimento. Não exige instalação, compilação ou backend.

Site: https://nexostud.com.br/

## Arquivos utilizados

- `index.html`: conteúdo, tela de abertura, navegação, serviços, formulário, FAQ, rodapé e metadados.
- `styles.css`: identidade visual, layout, componentes e regras responsivas. As cores estão em `:root`; os ajustes para celular ficam nas regras `@media` ao final do arquivo.
- `script.js`: animações ligadas à rolagem, luz e inclinação das caixas, partículas, pausa de efeitos, menu móvel, desaceleração da roda do mouse e preparação da mensagem para o WhatsApp. A abertura tem um script independente no `<head>`.
- `assets/nexo-logo-clean.webp`: a logo **sem fundo** (transparente). É a que o site usa em todos os lugares: abertura, cabeçalho, topo, frase que se revela e rodapé.
- `assets/nexo-icon.png`: ícone da aba do navegador (o N sobre fundo escuro).
- `assets/nexo-logo.webp`: logo original da Nexo Studio, preservada como arquivo-fonte (o site não a carrega mais).
- `.nojekyll`: entrega direta dos arquivos no GitHub Pages.
- `CNAME`: domínio personalizado `nexostud.com.br` usado pelo GitHub Pages.

Os arquivos `identity.css`, `responsive.css`, `ecossistema.css` e `experiencia.css` pertencem a versões anteriores e **não são carregados** pela página atual. O estilo ativo está em `styles.css`. Eles podem ser apagados do repositório sem afetar o site.

## Conteúdo

Primeira tela: **Sua empresa tem valor. Sua presença digital precisa mostrar isso.**

Hierarquia: cabeçalho → primeira tela → trabalhos → serviços e conexão → equipe → planos → como funciona → dúvidas frequentes → convite final e contexto opcional → rodapé.

A identidade preserva o N com órbitas, o brilho azul, a abertura, as palavras reveladas pela rolagem, a inclinação das caixas e o movimento dos botões. O manifesto fica dentro de `#servicos`, com palco compacto e progressão reversível que considera a altura do cabeçalho.

O ecossistema conecta três serviços:

1. Vídeos e motion design.
2. Gestão de redes sociais.
3. Sites e landing pages.

Presença reúne vídeos e gestão das redes sociais; Sites e páginas é dedicado a sites e landing pages; Ecossistema Nexo combina os três serviços. A criação de site tem escopo de projeto, e a frequência das entregas de conteúdo é alinhada na parceria. O escopo e o investimento são definidos na proposta.

O acesso aos portfólios fica apenas em `#trabalhos`, logo após a primeira tela, com capas e capturas reais junto aos botões. Vídeos e sites abrem suas galerias; a seleção de social media está em preparação, com contato disponível sobre o serviço. Os trabalhos têm nomes descritivos e contexto, sem números de desempenho não informados. Há dois vídeos e dois sites publicados; não são exibidos projetos fictícios.

## Contato

WhatsApp: **+55 (11) 93359-6263** (`5511933596263`).

Os botões de serviços, planos e contato abrem diretamente o WhatsApp com uma mensagem específica para o Pedro, por meio de links nativos que também funcionam sem JavaScript. O contato dentro dos projetos do portfólio leva o nome do trabalho e do serviço na mensagem.

O formulário fica recolhido abaixo do botão principal do convite final. Nome da empresa, contexto e seleção de serviços são opcionais. Os planos têm seus próprios links diretos e não precisam ser selecionados novamente. A mensagem inclui a etiqueta de origem e abre no WhatsApp para o visitante revisar e enviar. O site não envia mensagens automaticamente nem armazena os dados do formulário.

## Visualizar e publicar

Abra `index.html` ou sirva a pasta com um servidor estático. Os caminhos dos arquivos são relativos e funcionam tanto em `/` quanto em `/nexo/`.

O GitHub Pages usa a branch `main` e a pasta raiz. A publicação acompanha os commits conforme a configuração do repositório. O endereço canônico e os metadados apontam para `https://nexostud.com.br/`.

### Domínio personalizado

O arquivo `CNAME` na raiz vincula `nexostud.com.br` à publicação da branch `main`. O DNS do domínio deve apontar para o GitHub Pages:

| Tipo | Nome | Valor |
| --- | --- | --- |
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | pedrooeditor.github.io |

O domínio só fica acessível após configurar e propagar esses registros no provedor DNS. Depois da emissão do certificado, ative **Enforce HTTPS** em **Settings → Pages**. Referência: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site

## Acessibilidade e responsividade

- Conteúdo semântico, link para pular para o conteúdo e foco visível.
- Menu móvel com estado acessível e fechamento por Escape.
- Planos no mobile com encaixe nativo, indicadores selecionáveis, teclado e anúncio do plano atual.
- FAQ com controles nativos `details` e `summary`.
- Rótulos de formulário, seleções por teclado e campos de tamanho adequado para toque.
- Layouts para desktop, tablet e celular, com fontes locais e alternativas de sistema.
- Respeito a `prefers-reduced-motion`.
- Botão para pausar os efeitos contínuos. Animações de cartões param fora da tela e partículas param quando a aba fica oculta.
- Conteúdo e contato direto disponíveis sem JavaScript. Nesse caso, o formulário é ocultado.

## Movimento e identidade

- Símbolo original entre três órbitas rotativas com pontos luminosos, flutuação e reação sutil ao ponteiro.
- Fundo preto com auroras azuis, grade discreta e partículas azuis e prateadas.
- Botões com gradiente azul/prata, reflexo em movimento e deslocamento leve com o cursor.
- Manifesto fixado durante parte da rolagem, com palavras acendendo em sequência.
- Entradas de seções e cartões em cascata; linha de processo preenchida pela rolagem.
- Capas de vídeo e capturas de site reais; composição ilustrativa para social media até chegar o portfólio.
- Brilho e inclinação nos cartões em dispositivos com ponteiro; composição própria para celular.

### Tela de abertura

Logo original, brilho azul crescente e faísca. A sequência é decorativa e não espera os vídeos ou o evento `load`: o código independente no `<head>` inicia a saída após 1 s, com fade de 300 ms. No perfil leve, a saída começa após 270 ms, com efeito simplificado. Qualquer interação encerra a abertura. Quem usa “reduzir movimento”, abre um link com âncora ou retorna na mesma sessão entra diretamente. A chave da sessão é `nexo-intro-v2-seen`.

### Frase “Cada etapa. Uma só direção.”

A logo (N sem fundo) fica acima da frase e ganha um brilho azul atrás que se intensifica continuamente conforme a pessoa rola. A variável `--emblem-glow` (0 a 1) é calculada em `script.js` e usada em `styles.css` (`.manifesto-logo`).

### Caixas

- **01 O desafio, 03 Nossas frentes e 05 Formas de trabalhar:** luz azul que acompanha o cursor, contorno brilhante e leve inclinação para o lado do cursor, com uma pequena subida. A força da inclinação está em `TILT_X` e `TILT_Y` no começo da seção "Caixas" de `script.js`.
- **02 O ecossistema:** as etapas dão uma leve saltada quando o cursor passa (ou quando recebem foco pelo teclado), com luz e brilho na borda.
- Os efeitos só aparecem com mouse/trackpad. No celular as caixas ficam paradas; com "reduzir movimento" ou "Pausar efeitos" também.

### Dúvidas frequentes e rodapé

- `#faq` vem antes do formulário opcional (`#contato`), seguido pelo CTA final direto ao WhatsApp.
- O rodapé tem descrição curta, três links de navegação e três linhas de contato: WhatsApp, Instagram `@nexostud` e voltar ao topo. A assinatura grande foi removida.

A logo é exibida a partir de `assets/nexo-logo-clean.webp` (recorte transparente da logo original), com janelas SVG para o símbolo e a assinatura. O recorte vem do arquivo raster original; se houver um arquivo vetorial (SVG, AI ou PDF) da logo, vale substituir para ficar ainda mais nítida em telas grandes. Os efeitos usam CSS e APIs nativas do navegador, sem bibliotecas de animação.

## Personalizar

Edite `styles.css` para alterar cores e aparência. Os serviços, links diretos e mensagens dos planos estão em `index.html`; as descrições dos planos usadas no formulário opcional estão em `script.js`. Os nomes e contextos dos trabalhos estão em `portfolio-data.js`. As âncoras anteriores `#problema`, `#essencia`, `#ciclo`, `#frentes` e `#pacotes` continuam disponíveis. A numeração vai de 01 a 08: 06 são as dúvidas, 07 é o formulário e 08 é o CTA final.

Para trocar o WhatsApp, atualize `5511933596263` nos arquivos HTML e JavaScript e o número exibido no HTML. Para mudar a hospedagem, atualize o canonical, `og:url` e a URL no JSON-LD.
