/*
 * Nexo Studio — conteúdo do portfólio.
 * Vídeos e projetos de páginas publicados, com prévias para futuros trabalhos.
 * Ao receber os trabalhos, substitua os itens de cada frente e marque demo:false.
 * Mídia: { type:'video'|'image'|'file', src:'assets/portfolio/...', poster:'...', alt:'...' }.
 * Para sites, use cover:'assets/portfolio/capa.webp' e websiteUrl:'https://...'.
 * Para uma sequência de imagens, use gallery:[{src:'...', alt:'...'}, ...].
 * Preserve os ids para manter os links de cada projeto funcionando.
 */
'use strict';
window.NEXO_PORTFOLIO = {
  categories: [
    { id:'motion', number:'01', name:'Vídeos e motion design', label:'Edição de vídeo', short:'Vídeos', icon:'▷',
      headline:'Histórias em movimento.',
      intro:'Ritmo, narrativa e direção visual. Escolha um vídeo na galeria e veja a edição de perto.',
      signature:'RITMO. NARRATIVA. PERSONALIDADE.' },
    { id:'web', number:'02', name:'Sites e landing pages', label:'Criação de páginas', short:'Páginas', icon:'▣',
      headline:'Páginas para apresentar sua empresa.',
      intro:'Explore os exemplos e clique em um projeto para visitar o site.',
      signature:'IDENTIDADE. EXPERIÊNCIA. DIREÇÃO.' }
  ],
  projects: [
    { id:'ritmo-narrativa', category:'motion', title:'Exemplo de edição 1', format:'Vídeo vertical · Edição',
      tags:['Vídeo','Edição','Narrativa'], demo:false, visual:'motion',
      description:'Exemplo de vídeo vertical editado para publicação em redes sociais.',
      cover:'assets/portfolio/exemplo-viral-1-capa-v1.webp',
      media:{ type:'video', src:'assets/portfolio/exemplo-viral-1-web-v1.mp4', poster:'assets/portfolio/exemplo-viral-1-capa-v1.webp', width:720, height:1280, duration:70.820998 } },
    { id:'marca-movimento', category:'motion', title:'Exemplo de edição 2', format:'Vídeo vertical · Edição',
      tags:['Vídeo','Edição','Narrativa'], demo:false, visual:'motion',
      description:'Exemplo de vídeo vertical editado para publicação em redes sociais.',
      cover:'assets/portfolio/exemplo-viral-2-capa-v1.webp',
      media:{ type:'video', src:'assets/portfolio/exemplo-viral-2-web-v1.mp4', poster:'assets/portfolio/exemplo-viral-2-capa-v1.webp', width:720, height:1280, duration:70.217007 } },
    { id:'nova-aco-armado', category:'web', title:'Exemplo 1', format:'Site institucional · Construção',
      tags:['Site institucional','Catálogo','Orçamento'], demo:false,
      cover:'assets/portfolio/nova-aco-projeto.webp',
      description:'Site institucional com apresentação da empresa, produtos de ferragem armada e contato para orçamento.',
      approach:'Navegação por seções, apresentação dos produtos e acesso ao orçamento pelo WhatsApp.',
      websiteUrl:'https://novaacoarmado.com.br/',
      media:{ type:'image', src:'assets/portfolio/nova-aco-projeto.webp', alt:'Imagem do primeiro exemplo, com ferragens armadas em uma obra.' } },
    { id:'pagina-exemplo-2', category:'web', title:'Exemplo 2', format:'Loja virtual · Beleza',
      tags:['Loja virtual','Catálogo','Compra online'], demo:false,
      cover:'assets/portfolio/exemplo-2-capa.svg',
      description:'Loja virtual de perfumaria e cosméticos, com catálogo de produtos, sacola de compras e acompanhamento de pedidos.',
      approach:'Apresentação dos produtos, busca por fragrâncias e acesso à consultora virtual.',
      websiteUrl:'https://herscosmeticos.com.br/',
      media:{ type:'image', src:'assets/portfolio/exemplo-2-capa.svg', alt:'Ilustração do segundo exemplo, com catálogo digital e frascos de perfume.' } },
    { id:'site-experiencia', category:'web', title:'Um site, uma experiência', format:'Site institucional',
      tags:['Site','Interface','Responsivo'], demo:true, visual:'web',
      description:'Uma prévia do espaço para sites: apresentação ampla, contexto e acesso ao projeto publicado quando estiver disponível.',
      approach:'A página pode ser apresentada por capturas de tela, com suas versões para computador e celular.' },
    { id:'pagina-objetivo', category:'web', title:'Uma página, um objetivo', format:'Landing page',
      tags:['Landing page','Direção','Design'], demo:true, visual:'landing',
      description:'Uma prévia de apresentação para landing pages, com uma capa e o percurso visual da página.',
      approach:'O espaço permite mostrar a hierarquia da informação e o caminho até o contato.' }
  ]
};
