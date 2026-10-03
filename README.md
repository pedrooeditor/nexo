# Nexo Studio

Site institucional da Nexo Studio em HTML, CSS e JavaScript puros. A identidade usa a logo original, preto profundo, azul elétrico e prata, com brilho e animações inspirados nas referências de movimento. Não exige instalação, compilação ou backend.

Site: https://pedrooeditor.github.io/nexo/

## Arquivos utilizados

- `index.html`: conteúdo, navegação, serviços, FAQ, formulário e metadados.
- `styles.css`: identidade visual, layout, componentes e regras responsivas. As cores estão em `:root`; os ajustes para celular ficam nas regras `@media` ao final do arquivo.
- `script.js`: animações ligadas à rolagem, partículas, pausa de efeitos, menu móvel, seleção das etapas do ecossistema e preparação da mensagem para o WhatsApp.
- `assets/nexo-logo.webp`: logo original da Nexo Studio.
- `.nojekyll`: entrega direta dos arquivos no GitHub Pages.

Os arquivos `identity.css`, `responsive.css`, `ecossistema.css` e `experiencia.css` pertencem à versão anterior e não são carregados pela página atual. O estilo ativo está em `styles.css`.

## Conteúdo

Posicionamento: **Da atenção à venda. Tudo conectado.**

O ecossistema conecta quatro frentes:

1. ▷ Motion Designer: atrair.
2. ✳ Social Media: conectar.
3. ↗ Pages Builder: converter.
4. ⌁ Especialista em X1: conversar.

Dados e CRM organizam o acompanhamento e alimentam a melhoria das próximas entregas. As parcerias são Presença, Conversão e Ecossistema Nexo, com escopo e investimento definidos na proposta. A página não exibe e-mail, perfis de profissionais, preços, depoimentos ou resultados não comprovados.

## Contato

WhatsApp: **+55 (11) 93359-6263** (`5511933596263`).

O formulário permite selecionar uma ou mais frentes ou um pacote. A escolha de um pacote substitui as frentes avulsas, e vice-versa. Os botões de serviços e pacotes já deixam a escolha marcada. Empresa, segmento e ideia inicial são opcionais. A mensagem inclui a etiqueta de origem e abre no WhatsApp para o visitante revisar e enviar. O site não envia mensagens automaticamente nem armazena os dados do formulário.

## Visualizar e publicar

Abra `index.html` ou sirva a pasta com um servidor estático. Os caminhos dos arquivos são relativos e funcionam em `/nexo/`.

O GitHub Pages usa a branch `main` e a pasta raiz. A publicação acompanha os commits conforme a configuração do repositório. O endereço canônico e os metadados apontam para `https://pedrooeditor.github.io/nexo/`.

## Acessibilidade e responsividade

- Conteúdo semântico, link para pular para o conteúdo e foco visível.
- Menu móvel com estado acessível e fechamento por Escape.
- Etapas do ecossistema selecionáveis por teclado e anúncio da descrição atualizada.
- FAQ com controles nativos `details` e `summary`.
- Rótulos de formulário, seleções por teclado e campos de tamanho adequado para toque.
- Layouts para desktop, tablet e celular, com fontes de sistema como alternativa ao Google Fonts.
- Respeito a `prefers-reduced-motion`.
- Botão para pausar os efeitos contínuos. Animações de cartões param fora da tela e partículas param quando a aba fica oculta.
- Conteúdo e contato direto disponíveis sem JavaScript. Nesse caso, o formulário é ocultado.

## Movimento e identidade

- Símbolo original entre três órbitas rotativas com pontos luminosos, flutuação e reação sutil ao ponteiro.
- Fundo preto com auroras azuis, grade discreta e partículas azuis e prateadas.
- Botões com gradiente azul/prata e reflexo em movimento; faixa de palavras contínua.
- Manifesto fixado durante parte da rolagem, com palavras acendendo em sequência.
- Entradas de seções e cartões em cascata; linha de processo preenchida pela rolagem.
- Prévia animada para cada serviço: vídeo, conteúdo social, site e conversa.
- Brilho e inclinação nos cartões em dispositivos com ponteiro; composição própria para celular.

A logo é exibida a partir de `assets/nexo-logo.webp`, com recortes de visualização em SVG para o símbolo e a assinatura. O arquivo original é preservado. Os efeitos usam CSS e APIs nativas do navegador, sem bibliotecas de animação.

## Personalizar

Edite `styles.css` para alterar cores e aparência. Os textos das quatro etapas interativas estão em `script.js`; os demais textos estão em `index.html`. As âncoras anteriores `#problema`, `#essencia`, `#ciclo`, `#frentes` e `#pacotes` continuam disponíveis.

Para trocar o WhatsApp, atualize `5511933596263` nos arquivos HTML e JavaScript e o número exibido no HTML. Para mudar a hospedagem, atualize o canonical, `og:url` e a URL no JSON-LD.
