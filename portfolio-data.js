/*
 * Nexo Studio — conteúdo do portfólio.
 * Vídeos e projetos de páginas publicados.
 * Adicione trabalhos reais à frente correspondente preservando os links existentes.
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
    { id:'ritmo-narrativa', category:'motion', title:'A luta por trás da luta', format:'Reels · Narrativa',
      tags:['Vídeo','Edição','Narrativa'], demo:false, visual:'motion',
      description:'Edição em formato vertical de uma fala sobre a luta por trás da luta, preparada para redes sociais.',
      objective:'Apresentar uma mensagem em vídeo vertical para as redes sociais.',
      approach:'Edição da fala e legendas na tela, mantendo o foco na mensagem do vídeo.',
      cover:'assets/portfolio/exemplo-viral-1-capa-v1.webp',
      media:{ type:'video', src:'assets/portfolio/exemplo-viral-1-web-v1.mp4', poster:'assets/portfolio/exemplo-viral-1-capa-v1.webp', width:720, height:1280, duration:70.820998 } },
    { id:'marca-movimento', category:'motion', title:'Edição para Reels', format:'Reels · Edição de vídeo',
      tags:['Vídeo','Edição','Narrativa'], demo:false, visual:'motion',
      description:'Vídeo editado em formato vertical para publicação nas redes sociais.',
      objective:'Preparar o conteúdo em formato vertical para publicação nas redes sociais.',
      cover:'assets/portfolio/exemplo-viral-2-capa-v1.webp',
      media:{ type:'video', src:'assets/portfolio/exemplo-viral-2-web-v1.mp4', poster:'assets/portfolio/exemplo-viral-2-capa-v1.webp', width:720, height:1280, duration:70.217007 } },
    { id:'nova-aco-armado', category:'web', title:'Site para construção civil', format:'Site institucional · Construção',
      tags:['Site institucional','Catálogo','Orçamento'], demo:false,
      cover:'assets/portfolio/exemplo-1-site-v1.webp',
      description:'Site institucional com apresentação da empresa, produtos de ferragem armada e contato para orçamento.',
      objective:'Apresentar soluções de ferragem armada e facilitar pedidos de orçamento.',
      approach:'Navegação por seções, apresentação dos produtos e acesso ao orçamento pelo WhatsApp.',
      websiteUrl:'https://novaacoarmado.com.br/',
      media:{ type:'image', src:'assets/portfolio/exemplo-1-site-v1.webp', alt:'Site de construção civil com apresentação dos produtos e botão para solicitar orçamento.', width:1899, height:976 } },
    { id:'pagina-exemplo-2', category:'web', title:'Loja virtual de perfumaria', format:'Loja virtual · Beleza',
      tags:['Loja virtual','Catálogo','Compra online'], demo:false,
      cover:'assets/portfolio/exemplo-2-site-v1.webp',
      description:'Loja virtual de perfumaria e cosméticos, com catálogo de produtos, sacola de compras e acompanhamento de pedidos.',
      objective:'Apresentar o catálogo de perfumaria e cosméticos e permitir a compra online.',
      approach:'Apresentação dos produtos, busca por fragrâncias e acesso à consultora virtual.',
      websiteUrl:'https://herscosmeticos.com.br/',
      media:{ type:'image', src:'assets/portfolio/exemplo-2-site-v1.webp', alt:'Loja virtual de perfumaria com apresentação do produto e botão para adicionar à sacola.', width:1902, height:973 } }
  ]
};
