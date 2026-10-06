/*
 * Nexo Studio — conteúdo do portfólio.
 * Esta primeira versão contém somente PRÉVIAS DE APRESENTAÇÃO, sem clientes ou resultados.
 * Ao receber os trabalhos, substitua os itens de cada frente e marque demo:false.
 * Mídia: { type:'video'|'image'|'file', src:'assets/portfolio/...', poster:'...', alt:'...' }.
 * Para sites, use cover:'assets/portfolio/capa.webp' e websiteUrl:'https://...'.
 * Para uma sequência de imagens, use gallery:[{src:'...', alt:'...'}, ...].
 * Preserve os ids para manter os links de cada projeto funcionando.
 */
'use strict';
window.NEXO_PORTFOLIO = {
  categories: [
    { id:'motion', number:'01', name:'Motion Designer', short:'Conteúdo', icon:'▷',
      headline:'Ideias que ganham movimento.',
      intro:'Um espaço para explorar ritmo, narrativa e direção visual. Entre em uma prévia e veja tudo de perto.',
      signature:'RITMO. NARRATIVA. PERSONALIDADE.' },
    { id:'social', number:'02', name:'Social Media', short:'Social', icon:'✳',
      headline:'Uma marca. Muitas conexões.',
      intro:'Um espaço para conteúdo, identidade e presença nas redes. Explore como cada entrega pode se conectar.',
      signature:'PRESENÇA. IDENTIDADE. CONEXÃO.' },
    { id:'web', number:'03', name:'Pages Builder', short:'Web', icon:'▣',
      headline:'Páginas para entrar. E ficar.',
      intro:'Um espaço para explorar sites e landing pages. Veja a apresentação em detalhe antes de visitar cada projeto.',
      signature:'IDENTIDADE. EXPERIÊNCIA. DIREÇÃO.' },
    { id:'x1', number:'04', name:'Especialista em X1', short:'Conversão', icon:'⌁',
      headline:'A próxima fase começa na conversa.',
      intro:'Um espaço para apresentar jornadas, materiais e processos de atendimento. Explore cada etapa de perto.',
      signature:'ESCUTA. CONTINUIDADE. PRÓXIMO PASSO.' }
  ],
  projects: [
    { id:'ritmo-narrativa', category:'motion', title:'Ritmo & narrativa', format:'Vídeo e edição',
      tags:['Reels','Edição','Narrativa'], demo:true, visual:'motion',
      description:'Uma prévia visual do espaço dedicado a vídeos: capa em destaque, reprodução com controles e informações ao lado.',
      approach:'Cortes, legendas, áudio e movimento podem ser apresentados juntos, mantendo o vídeo como protagonista.' },
    { id:'marca-movimento', category:'motion', title:'Marca em movimento', format:'Motion design',
      tags:['Motion','Tipografia','Identidade'], demo:true, visual:'brand',
      description:'Uma prévia do espaço para animações, com uma composição da própria Nexo em movimento.',
      approach:'A apresentação valoriza a animação, a direção visual e os detalhes da peça.' },
    { id:'presenca-direcao', category:'social', title:'Presença com direção', format:'Conteúdo para redes',
      tags:['Conteúdo','Feed','Direção visual'], demo:true, visual:'social',
      description:'Uma prévia do espaço para apresentar conjuntos de publicações e sua linguagem visual.',
      approach:'As peças podem ser vistas individualmente ou como parte de uma sequência, acompanhadas do contexto do trabalho.' },
    { id:'identidade-feed', category:'social', title:'Do feed à marca', format:'Identidade nas redes',
      tags:['Identidade','Planejamento','Social'], demo:true, visual:'identity',
      description:'Uma prévia de apresentação para identidade, planejamento e materiais de uma marca nas redes.',
      approach:'A galeria pode reunir peças, aplicações e documentos para mostrar a consistência entre as entregas.' },
    { id:'site-experiencia', category:'web', title:'Um site, uma experiência', format:'Site institucional',
      tags:['Site','Interface','Responsivo'], demo:true, visual:'web',
      description:'Uma prévia do espaço para sites: apresentação ampla, contexto e acesso ao projeto publicado quando estiver disponível.',
      approach:'A página pode ser apresentada por capturas de tela, com suas versões para computador e celular.' },
    { id:'pagina-objetivo', category:'web', title:'Uma página, um objetivo', format:'Landing page',
      tags:['Landing page','Direção','Design'], demo:true, visual:'landing',
      description:'Uma prévia de apresentação para landing pages, com uma capa e o percurso visual da página.',
      approach:'O espaço permite mostrar a hierarquia da informação e o caminho até o contato.' },
    { id:'primeira-conversa', category:'x1', title:'Do primeiro contato ao próximo passo', format:'Jornada de atendimento',
      tags:['Atendimento','Jornada','X1'], demo:true, visual:'chat',
      description:'Uma prévia do espaço para apresentar o processo de atendimento e a continuidade das conversas.',
      approach:'Materiais e jornadas podem ser apresentados de forma visual, sem expor dados pessoais de contatos.' },
    { id:'conversa-continua', category:'x1', title:'O caminho da conversa', format:'Processo comercial',
      tags:['Follow-up','Organização','Processo'], demo:true, visual:'journey',
      description:'Uma prévia de apresentação para processos, acompanhamento e materiais de apoio comercial.',
      approach:'O espaço pode reunir documentos e representações das etapas de atendimento, com contexto ao lado.' }
  ]
};
