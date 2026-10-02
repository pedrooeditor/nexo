# Nexo Studio

Site institucional da Nexo Studio em HTML, CSS e JavaScript puros. A identidade usa a logo original, preto/grafite, azul metálico e prata. Não exige instalação, compilação ou backend.

Site: https://pedrooeditor.github.io/nexo/

## Arquivos utilizados

- `index.html`: conteúdo, navegação, serviços, FAQ, formulário e metadados.
- `styles.css`: identidade visual, layout, componentes e regras responsivas. As cores estão em `:root`; os ajustes para celular ficam nas regras `@media` ao final do arquivo.
- `script.js`: menu móvel, seleção das etapas do ecossistema, escolha de interesse e preparação da mensagem para o WhatsApp.
- `assets/nexo-logo.webp`: logo original da Nexo Studio.
- `.nojekyll`: entrega direta dos arquivos no GitHub Pages.

Os arquivos `identity.css`, `responsive.css` e `ecossistema.css` pertencem à versão anterior e não são carregados pela página atual. O estilo ativo está em `styles.css`.

## Conteúdo

Posicionamento: **Da atenção à venda. Tudo conectado.**

O ecossistema conecta quatro frentes:

1. Conteúdo e vídeo: atrair.
2. Social media: conectar.
3. Sites e landing pages: converter.
4. Atendimento comercial no WhatsApp: conversar.

Dados e CRM organizam o acompanhamento e alimentam a melhoria das próximas entregas. As parcerias são Presença, Conversão e Ecossistema Nexo, com escopo e investimento definidos na proposta. A página não exibe e-mail, perfis de profissionais, preços, depoimentos ou resultados não comprovados.

## Contato

WhatsApp: **+55 (11) 93359-6263** (`5511933596263`).

O formulário prepara uma mensagem com nome, marca opcional, interesse e objetivo opcional, incluindo uma etiqueta de origem para o atendimento. A mensagem abre no WhatsApp para o visitante revisar e enviar. O site não envia mensagens automaticamente nem armazena os dados do formulário.

## Visualizar e publicar

Abra `index.html` ou sirva a pasta com um servidor estático. Os caminhos dos arquivos são relativos e funcionam em `/nexo/`.

O GitHub Pages usa a branch `main` e a pasta raiz. A publicação acompanha os commits conforme a configuração do repositório. O endereço canônico e os metadados apontam para `https://pedrooeditor.github.io/nexo/`.

## Acessibilidade e responsividade

- Conteúdo semântico, link para pular para o conteúdo e foco visível.
- Menu móvel com estado acessível e fechamento por Escape.
- Etapas do ecossistema selecionáveis por teclado e anúncio da descrição atualizada.
- FAQ com controles nativos `details` e `summary`.
- Rótulos de formulário, validação do nome e campos de tamanho adequado para toque.
- Layouts para desktop, tablet e celular, com fontes de sistema como alternativa ao Google Fonts.
- Respeito a `prefers-reduced-motion`.
- Conteúdo e contato direto disponíveis sem JavaScript. Nesse caso, o formulário é ocultado.

## Personalizar

Edite `styles.css` para alterar cores e aparência. Os textos das quatro etapas estão em `script.js`; os demais textos estão em `index.html`.

Para trocar o WhatsApp, atualize `5511933596263` nos arquivos HTML e JavaScript e o número exibido no HTML. Para mudar a hospedagem, atualize o canonical, `og:url` e a URL no JSON-LD.
