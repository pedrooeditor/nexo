# Nexo Studio

Site institucional responsivo da Nexo Studio, desenvolvido com HTML, CSS e JavaScript puro. Sem instalação de dependências, compilação ou backend.

## Visualizar

Abra `index.html` no navegador ou sirva esta pasta com qualquer servidor estático. Todos os caminhos dos arquivos são relativos, compatíveis com subdiretórios como `/nexo/`.

## Arquivos

- `index.html`: conteúdo, metadados, tela de abertura, navegação, seções e formulário.
- `styles.css`: estrutura, layouts responsivos e animações.
- `identity.css`: acabamento visual baseado na logo oficial: metal, azul elétrico e preto.
- `responsive.css`: layout fluido compartilhado, tipografia legível, navegação fixa e ajustes para toque.
- `ecossistema.css`: peças compartilhadas (tipografia, lista das frentes, campos do formulário, bloco de contato) e ajustes de acessibilidade. Usa apenas a paleta de `identity.css`.
- `experiencia.css`: a experiência de rolagem — tela de abertura (preloader), entrada do topo, frase que se revela palavra por palavra, linha do tempo do ciclo, pacotes, FAQ e rodapé. Carregado por último.
- `assets/nexo-logo.webp`: logo original fornecida pelo usuário, otimizada para WebP sem alterar a composição.
- `script.js`: tela de abertura, efeitos de rolagem, navegação móvel, frentes e resumo para o WhatsApp.
- O ícone do navegador usa a mesma logo original em WebP.
- `.nojekyll`: permite servir os arquivos diretamente no GitHub Pages.

## Contato

Os links levam a **+55 (11) 93359-6263**, no formato internacional `5511933596263`. O formulário cria um rascunho no WhatsApp com as frentes ou o pacote selecionado, nome da empresa, segmento e o texto opcional. Toda mensagem começa com uma etiqueta de origem, como `[Site · Pacote Presença]` ou `[Site · Menu]`, para o atendimento saber de onde o contato veio. Não envia a mensagem automaticamente, não armazena dados e não depende de um servidor.

## Identidade e conteúdo

Preto/grafite, azul metálico e detalhes prateados. A logo original é usada na abertura, no cabeçalho e no rodapé. As aplicações menores usam janelas SVG para enquadrar a imagem original sem redesenhá-la. As cenas de serviços são composições ilustrativas em CSS, não cases ou trabalhos de clientes. Não há preços, depoimentos, resultados ou clientes fictícios.

Fontes: DM Sans e Manrope via Google Fonts, com alternativas locais. Caso o serviço externo esteja indisponível, o site continua funcionando com as fontes de sistema. Os títulos usam letras geométricas com acabamento metálico, sem o itálico editorial da primeira versão.

## Publicação no GitHub Pages

Site publicado: https://pedrooeditor.github.io/nexo/

No GitHub: **Settings → Pages → Deploy from a branch → main → /(root) → Save**. A URL padrão, depois de ativar o Pages, será `https://pedrooeditor.github.io/nexo/`. O envio do código ao repositório não ativa o Pages automaticamente.

Também pode ser hospedado em qualquer serviço de arquivos estáticos, sem comando de build.

## Acessibilidade

- Navegação semântica, link para pular conteúdo e foco visível.
- Menu móvel com estado acessível e fechamento por Escape.
- Controles de serviços e etapas utilizáveis por teclado.
- Respeito a `prefers-reduced-motion` e botão para pausar efeitos.
- Conteúdo principal e links diretos de contato disponíveis mesmo sem JavaScript.

## Personalizar

As cores base estão em `styles.css` e as cores e tratamentos da logo estão em `identity.css`. Os textos ficam em `index.html`; só as legendas das cenas das frentes ficam em `script.js` (lista `captions`). Para trocar o WhatsApp, atualize todas as ocorrências de `5511933596263` e o número exibido no HTML.

## Experiência de rolagem

- **Tela de abertura:** a logo aparece com brilho azul e uma linha de carregamento; o topo do site entra em seguida. Fica no mínimo 1,8 s e sai assim que a página termina de carregar (limite de segurança de 5 s, definido no `<head>`). Quem usa "reduzir movimento" no sistema não vê a abertura.
- **Frase que se revela:** na seção "Cada frente alimenta a próxima. Tudo se conecta, sempre." a página fica fixa e as palavras acendem conforme a pessoa rola. Há um aviso bem pequeno, "role para baixo", que some assim que o efeito começa. Para mudar a frase, edite as palavras dentro dos `<span class="word">` em `index.html`; para mudar a duração do efeito, altere `height` de `.statement-pin` em `experiencia.css` (padrão `300svh`).
- **O ciclo:** a linha do tempo vai se preenchendo e cada etapa acende quando a linha chega nela.
- **Sem efeitos:** com "reduzir movimento", com o botão "Pausar efeitos" ou sem JavaScript, tudo aparece já visível e legível.

Seções e âncoras: `#problema`, `#essencia`, `#ciclo`, `#frentes`, `#pacotes`, `#processo`, `#faq`, `#contato`. A antiga seção de profissionais foi removida; o Pedro continua aparecendo como ponto de contato em "Como funciona" e em "Próximo passo".

## Experiência responsiva

- A abertura usa CSS Grid e altura determinada pelo conteúdo. A composição tem duas colunas no desktop e uma sequência vertical no celular, sem coordenadas fixas para a logo.
- Até 980 px, o menu compacto fica disponível durante a rolagem e a cena do serviço é movida para o item ativo. Acima disso, a cena aparece ao lado da lista. A seleção e o formulário são preservados ao redimensionar ou girar a tela.
- Até 640 px, textos principais têm 16 px, controles importantes oferecem pelo menos 44 px de altura e o campo de mensagem usa 16 px para evitar o zoom de foco em navegadores móveis.
- O atalho flutuante do WhatsApp desaparece quando a seção de contato está visível ou o formulário está em uso. Espaçamentos respeitam as áreas seguras do dispositivo.
- Animações decorativas pausam fora da tela e quando a página fica em segundo plano. O botão de pausa e a preferência do sistema por movimento reduzido continuam funcionando.
- As fontes iniciam o carregamento pelo HTML com conexões antecipadas, sem a dependência de um `@import` em CSS. A logo continua sendo um único WebP de aproximadamente 49 KB.

Validação no navegador: 320×568, 360×800, 390×844, 430×932, 600×900, 768×1024, 844×390, 980×800, 1024×768, 1440×900 e 1920×1080. Conferidos transbordamento, separação entre logo e texto, dimensões dos controles, menu, troca de serviços, seleção do formulário, continuidade ao redimensionar e pausa de animações. Sem erros de JavaScript observados.

## Ecossistema

Quatro frentes, sempre na mesma ordem, nome e ícone:

1. ▷ Motion Designer: Atrair
2. ✳ Social Media: Conectar
3. ↗ Pages Builder: Converter
4. ⌁ Especialista em X1: Conversar

O ciclo: as dúvidas que aparecem no X1 voltam como pauta para novos vídeos. Pacotes: Presença (Motion Designer + Social Media), Conversão (Pages Builder + Especialista em X1) e Ecossistema Nexo (as quatro frentes). Os botões "Quero esse pacote" já deixam a combinação marcada no formulário.
