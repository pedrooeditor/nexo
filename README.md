# Nexo Studio

Site institucional responsivo da Nexo Studio, desenvolvido com HTML, CSS e JavaScript puro. Sem instalação de dependências, compilação ou backend.

## Visualizar

Abra `index.html` no navegador ou sirva esta pasta com qualquer servidor estático. Todos os caminhos dos arquivos são relativos, compatíveis com subdiretórios como `/nexo/`.

## Arquivos

- `index.html`: conteúdo, metadados, navegação, serviços e formulário.
- `styles.css`: estrutura, layouts responsivos e animações.
- `identity.css`: acabamento visual baseado na logo oficial: metal, azul elétrico e preto.
- `assets/nexo-logo.webp`: logo original fornecida pelo usuário, otimizada para WebP sem alterar a composição.
- `script.js`: interações, navegação móvel e resumo para o WhatsApp.
- O ícone do navegador usa a mesma logo original em WebP.
- `.nojekyll`: permite servir os arquivos diretamente no GitHub Pages.

## Contato

Os links levam a **+55 (11) 93359-6263**, no formato internacional `5511933596263`. O formulário cria um rascunho no WhatsApp com os serviços selecionados e o texto opcional. Não envia a mensagem automaticamente, não armazena dados e não depende de um servidor.

## Identidade e conteúdo

Preto/grafite, azul metálico e detalhes prateados. A logo original é usada na abertura, no cabeçalho e no rodapé. As aplicações menores usam janelas SVG para enquadrar a imagem original sem redesenhá-la. As cenas de serviços são composições ilustrativas em CSS, não cases ou trabalhos de clientes. Não há preços, depoimentos, resultados ou clientes fictícios.

Fontes: DM Sans e Manrope via Google Fonts, com alternativas locais. Caso o serviço externo esteja indisponível, o site continua funcionando com as fontes de sistema. Os títulos usam letras geométricas com acabamento metálico, sem o itálico editorial da primeira versão.

## Publicação no GitHub Pages

No GitHub: **Settings → Pages → Deploy from a branch → main → /(root) → Save**. A URL padrão, depois de ativar o Pages, será `https://pedrooeditor.github.io/nexo/`. O envio do código ao repositório não ativa o Pages automaticamente.

Também pode ser hospedado em qualquer serviço de arquivos estáticos, sem comando de build.

## Acessibilidade

- Navegação semântica, link para pular conteúdo e foco visível.
- Menu móvel com estado acessível e fechamento por Escape.
- Controles de serviços e etapas utilizáveis por teclado.
- Respeito a `prefers-reduced-motion` e botão para pausar efeitos.
- Conteúdo principal e links diretos de contato disponíveis mesmo sem JavaScript.

## Personalizar

As cores base estão em `styles.css` e as cores e tratamentos da logo estão em `identity.css`. Os textos das etapas e legendas interativas ficam em `script.js`; o restante está em `index.html`. Para trocar o WhatsApp, atualize todas as ocorrências de `5511933596263` e o número exibido no HTML.
