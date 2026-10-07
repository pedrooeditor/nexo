/*
 * Nexo Studio — conteúdo do portfólio.
 * Vídeos publicados e prévias de apresentação dos projetos de páginas.
 * Ao receber os trabalhos, substitua os itens de cada frente e marque demo:false.
 * Mídia: { type:'video'|'image'|'file', src:'assets/portfolio/...', poster:'...', alt:'...' }.
 * Para sites, use cover:'assets/portfolio/capa.webp' e websiteUrl:'https://...'.
 * Para uma sequência de imagens, use gallery:[{src:'...', alt:'...'}, ...].
 * Preserve os ids para manter os links de cada projeto funcionando.
 */
'use strict';
window.NEXO_PORTFOLIO = {
  categories: [
    { id:'motion', number:'01', name:'Motion Designer', label:'Edição de vídeo', short:'Vídeos', icon:'▷',
      headline:'Histórias em movimento.',
      intro:'Ritmo, narrativa e direção visual. Escolha um vídeo na galeria e veja a edição de perto.',
      signature:'RITMO. NARRATIVA. PERSONALIDADE.' },
    { id:'web', number:'02', name:'Pages Builder', label:'Criação de páginas', short:'Páginas', icon:'▣',
      headline:'Páginas para entrar. E ficar.',
      intro:'Um espaço para explorar sites e landing pages. Veja a apresentação em detalhe antes de visitar cada projeto.',
      signature:'IDENTIDADE. EXPERIÊNCIA. DIREÇÃO.' }
  ],
  projects: [
    { id:'ritmo-narrativa', category:'motion', title:'Exemplo Viral 1', format:'Vídeo vertical · Edição',
      tags:['Vídeo','Edição','Narrativa'], demo:false, visual:'motion',
      description:'Um projeto de edição de vídeo para redes sociais.',
      media:{ type:'video', src:'https://www.dropbox.com/scl/fi/s2m6w7j9r8uvov74ia9ep/Exemplo-Viral-1.mp4?rlkey=d46w751mcjbcwgi7rws4n7srk&raw=1', poster:'assets/portfolio/exemplo-viral-1-cover.webp', width:2160, height:3840, duration:70.820998 } },
    { id:'marca-movimento', category:'motion', title:'Exemplo Viral 2', format:'Vídeo vertical · Edição',
      tags:['Vídeo','Edição','Narrativa'], demo:false, visual:'motion',
      description:'Um projeto de edição de vídeo para redes sociais.',
      media:{ type:'video', src:'https://www.dropbox.com/scl/fi/81nvqvfy39bjjb8d3s1w3/Exemplo-Viral-2.mp4?rlkey=ym0ubkpzwa5vvpittbjkki9da&raw=1', poster:'assets/portfolio/exemplo-viral-2-cover.webp', width:2160, height:3840, duration:70.217007 } },
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
