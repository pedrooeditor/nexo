# Nexo Studio

Site institucional responsivo da Nexo Studio, desenvolvido com HTML, CSS e JavaScript puro. Sem instalação de dependências, compilação ou backend.

## Visualizar

Abra `index.html` no navegador ou sirva esta pasta com qualquer servidor estático. Todos os caminhos dos arquivos são relativos, compatíveis com subdiretórios como `/nexo/`.

## Arquivos

- `index.html`: conteúdo, metadados, navegação, serviços e formulário.
- `styles.css`: identidade visual, layouts responsivos e animações.
- `script.js`: interações, navegação móvel e resumo para o WhatsApp.
- `favicon.svg`: símbolo vetorial do site.
- `.nojekyll`: permite servir os arquivos diretamente no GitHub Pages.

## Contato

Os links levam a **+55 (11) 93359-6263**, no formato internacional `5511933596263`. O formulário cria um rascunho no WhatsApp com os serviços selecionados e o texto opcional. Não envia a mensagem automaticamente, não armazena dados e não depende de um servidor.

## Identidade e conteúdo

Preto/grafite, azul metálico e detalhes prateados. O monograma N é uma interpretação vetorial criada para este site a partir da direção visual informada. As cenas de serviços são composições ilustrativas em CSS, não cases ou trabalhos de clientes. Não há preços, depoimentos, resultados ou clientes fictícios.

Fontes: DM Sans e Manrope via Google Fonts, com alternativas locais. Caso o serviço externo esteja indisponível, o site continua funcionando com as fontes de sistema. O itálico editorial usa Georgia.

## Publicação no GitHub Pages

No GitHub: **Settings → Pages → Deploy from a branch → main → /(root) → Save**. A URL padrão, depois de ativar o Pages, será `https://pedrooeditor.github.io/nexo/`. O envio do código ao repositório não ativa o Pages automaticamente.

Também pode ser hospedado em qualquer serviço de arquivos estáticos, sem comando de build.

## Acessibilidade

- Navegação semântica, link para pular conteúdo e foco visível.
- Menu móvel com estado acessível e fechamento por Escape.
- Controles de serviços e etapas utilizáveis por teclado.
- Respeito a `prefers-reduced-motion`.
- Conteúdo principal e links diretos de contato disponíveis mesmo sem JavaScript.

## Personalizar

As cores estão nas variáveis de `:root` em `styles.css`. Os textos das etapas e legendas interativas ficam em `script.js`; o restante está em `index.html`. Para trocar o WhatsApp, atualize todas as ocorrências de `5511933596263` e o número exibido no HTML.
