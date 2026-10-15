/* Nexo Studio — first-party events. No form text, IPs or complete URLs. */
(() => {
  'use strict';
  const cfg=window.NEXO_ANALYTICS||{};
  const KEYS={owner:'nexo.analytics.owner',optout:'nexo.analytics.optout',visitor:'nexo.analytics.visitor',session:'nexo.analytics.session'};
  const read=key=>{try{return localStorage.getItem(key);}catch(_){return null;}};
  const write=(key,value)=>{try{localStorage.setItem(key,value);}catch(_){}};
  const remove=key=>{try{localStorage.removeItem(key);}catch(_){}};
  const uuid=()=>{
    if(crypto.randomUUID)return crypto.randomUUID();
    const b=crypto.getRandomValues(new Uint8Array(16));b[6]=b[6]&15|64;b[8]=b[8]&63|128;
    const h=[...b].map(v=>v.toString(16).padStart(2,'0')).join('');
    return h.slice(0,8)+'-'+h.slice(8,12)+'-'+h.slice(12,16)+'-'+h.slice(16,20)+'-'+h.slice(20);
  };
  let stopped=false;
  window.NexoMetrics=Object.freeze({
    disable(){stopped=true;write(KEYS.optout,'1');remove(KEYS.visitor);remove(KEYS.session);},
    enable(){remove(KEYS.optout);location.reload();},isDisabled(){return read(KEYS.optout)==='1';}
  });
  if(!cfg.supabaseUrl||!cfg.publishableKey||!['nexostud.com.br','www.nexostud.com.br'].includes(location.hostname)
    ||!['/','/index.html'].includes(location.pathname)||read(KEYS.owner)==='1'||read(KEYS.optout)==='1'
    ||navigator.doNotTrack==='1'||window.doNotTrack==='1'||navigator.globalPrivacyControl===true
    ||navigator.webdriver||/bot|crawler|spider|headless|preview|lighthouse|pagespeed/i.test(navigator.userAgent))return;
  const validId=value=>/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(value||'');
  let visitor=read(KEYS.visitor);if(!validId(visitor)){visitor=uuid();write(KEYS.visitor,visitor);}
  let session;try{session=JSON.parse(read(KEYS.session)||'null');}catch(_){}
  if(!validId(session?.id)||Date.now()-Number(session?.last||0)>1800000)session={id:uuid(),last:Date.now()};
  let view=uuid(),active=0,depth=0,lastInput=Date.now(),lastTick=performance.now(),lastCategory='',lastProject='';
  let queue=[],sending=false,nextAttempt=0,failures=0;
  const sectionSeen=new Set(),scrollSeen=new Set(),videos=new Set(),videoStates=new WeakMap();
  const url=new URL(location.href);
  const clean=value=>String(value||'').replace(/[<>\u0000-\u001f]/g,'').slice(0,100);
  let referrer='';try{referrer=new URL(document.referrer).hostname;}catch(_){}
  const ownHost=['nexostud.com.br','www.nexostud.com.br'];
  const source=clean(url.searchParams.get('utm_source'))||(/google\./i.test(referrer)?'google':/bing\./i.test(referrer)?'bing':
    /instagram\.com$/i.test(referrer)?'instagram':/facebook\.com$|fb\.com$/i.test(referrer)?'facebook':
    /tiktok\.com$/i.test(referrer)?'tiktok':/whatsapp\.com$|wa\.me$/i.test(referrer)?'whatsapp':referrer&&!ownHost.includes(referrer)?referrer:'direto');
  const ua=navigator.userAgent;
  const device=/iPad|Tablet/i.test(ua)||(/Macintosh/.test(ua)&&navigator.maxTouchPoints>1)?'tablet':/Mobi|Android|iPhone/i.test(ua)?'mobile':'desktop';
  const browser=/Edg\//.test(ua)?'Edge':/OPR\//.test(ua)?'Opera':/Firefox\//.test(ua)?'Firefox':/Chrome\//.test(ua)?'Chrome':/Safari\//.test(ua)?'Safari':'Outros';
  const os=/Android/.test(ua)?'Android':/iPhone|iPad/.test(ua)||device==='tablet'&&/Macintosh/.test(ua)?'iOS / iPadOS':/Windows/.test(ua)?'Windows':/Macintosh/.test(ua)?'macOS':/Linux/.test(ua)?'Linux':'Outros';
  const common={page_path:location.pathname,source,referrer_host:referrer&&!ownHost.includes(referrer)?referrer:null,
    utm_medium:clean(url.searchParams.get('utm_medium'))||null,utm_campaign:clean(url.searchParams.get('utm_campaign'))||null,device,browser,os};
  const disabled=()=>stopped||read(KEYS.owner)==='1'||read(KEYS.optout)==='1';
  function persist(){session.last=Date.now();write(KEYS.session,JSON.stringify(session));}
  function touch(){
    const now=Date.now();if(now-session.last>1800000){
      flush();session={id:uuid(),last:now};view=uuid();active=0;depth=0;sectionSeen.clear();scrollSeen.clear();lastCategory='';lastProject='';
      enqueue('page_view');portfolio();
    }lastInput=now;persist();
  }
  function enqueue(name,extra={}){
    if(disabled()){queue=[];return;}
    const item={id:uuid(),name,active_seconds:Math.floor(active),scroll_depth:depth,...extra};
    if(name==='engagement'||name==='video_watch'){
      const old=queue.findIndex(e=>e.name===name&&e.context_id===item.context_id);if(old>=0)queue.splice(old,1);
    }if(queue.length<72)queue.push(item);
  }
  function flush(keepalive=false){
    if(disabled()){queue=[];return;}
    if(!queue.length||sending&&!keepalive||Date.now()<nextAttempt&&!keepalive)return;
    const batch=queue.splice(0,24),payload={...common,visitor_id:visitor,session_id:session.id,view_id:view,events:batch};sending=true;
    fetch(cfg.supabaseUrl+'/rest/v1/rpc/nexo_collect',{
      method:'POST',headers:{apikey:cfg.publishableKey,'Content-Type':'application/json'},
      body:JSON.stringify({p_payload:payload}),keepalive,credentials:'omit',referrerPolicy:'no-referrer'
    }).then(response=>{if(!response.ok)throw new Error('collection unavailable');failures=0;nextAttempt=0;})
      .catch(()=>{failures++;nextAttempt=Date.now()+Math.min(120000,5000*2**Math.min(failures,5));if(failures<=3&&!disabled())queue=batch.concat(queue).slice(0,72);})
      .finally(()=>{sending=false;});
  }
  function route(){const m=location.hash.match(/^#portfolio\/(motion|web)(?:\/([a-z0-9-]+))?$/);return m?{category:m[1],project:m[2]||''}:{category:'',project:''};}
  function portfolio(event){
    const r=route(),s=event?.detail;
    const category=typeof s?.category==='string'?s.category:document.querySelector('#nexo-portfolio')?.open?r.category:'';
    const project=category?(typeof s?.project==='string'?s.project:r.project):'';
    if(category&&category!==lastCategory)enqueue('portfolio_open',{category});
    if(project&&project!==lastProject)enqueue('project_open',{category,project});
    lastCategory=category;lastProject=project;document.querySelectorAll('#nexo-portfolio video').forEach(stateForVideo);if(category)flush();
  }
  function stateForVideo(video){
    if(videoStates.has(video))return videoStates.get(video);
    const project=route().project;if(!project)return null;
    const state={video,project,context_id:uuid(),played:false,complete:false,watch:0,progress:0,last:performance.now(),lastWatch:0,milestones:new Set()};
    videoStates.set(video,state);videos.add(state);return state;
  }
  function watchSnapshot(s){if(s.played)enqueue('video_watch',{project:s.project,category:'motion',context_id:s.context_id,progress:s.progress,watch_seconds:Math.floor(s.watch)});}
  function tickVideo(s,now){
    const v=s.video,elapsed=Math.min(6,Math.max(0,(now-s.last)/1000));s.last=now;
    if(v.isConnected&&!v.paused&&!v.ended&&!v.seeking&&v.readyState>=2&&!document.hidden)s.watch+=elapsed;
    if(Number.isFinite(v.duration)&&v.duration>0)s.progress=Math.max(s.progress,Math.min(100,Math.floor(v.currentTime/v.duration*100)));
    for(const mark of [25,50,75])if(s.played&&s.progress>=mark&&!s.milestones.has(mark)){
      s.milestones.add(mark);enqueue('video_progress',{project:s.project,category:'motion',context_id:s.context_id,progress:mark,watch_seconds:Math.floor(s.watch)});
    }
    if(s.played&&Math.floor(s.watch)-s.lastWatch>=10){s.lastWatch=Math.floor(s.watch);watchSnapshot(s);}
    if(!v.isConnected){watchSnapshot(s);videos.delete(s);}
  }
  ['play','pause','ended','error'].forEach(type=>document.addEventListener(type,event=>{
    const v=event.target;if(!(v instanceof HTMLVideoElement)||!v.closest('#nexo-portfolio'))return;
    touch();const s=stateForVideo(v);if(!s)return;tickVideo(s,performance.now());
    const extra={project:s.project,category:'motion',context_id:s.context_id,progress:s.progress,watch_seconds:Math.floor(s.watch)};
    if(type==='play'&&!s.played){s.played=true;enqueue('video_play',extra);}
    if(type==='ended'&&!s.complete){s.complete=true;enqueue('video_complete',{...extra,progress:100});}
    if(type==='error')enqueue('video_error',extra);
    if(type==='pause'||type==='ended')watchSnapshot(s);flush();
  },{capture:true,passive:true}));
  function sectionOf(el){return el.closest('.floating')?'floating':el.closest('header')?'header':el.closest('footer')?'footer':el.closest('#nexo-portfolio')?'portfolio':el.closest('section')?.id||'site';}
  document.addEventListener('click',event=>{
    touch();const el=event.target?.closest?.('a[href],button');if(!el)return;const section=sectionOf(el);
    if(el.matches('.service-toggle')&&el.getAttribute('aria-expanded')!=='true')enqueue('service_open',{section:'servicos',action:el.id.replace('service-','').replace('-toggle','')});
    if(el.tagName!=='A')return;let target;try{target=new URL(el.getAttribute('href'),location.href);}catch(_){return;}
    if(!['http:','https:'].includes(target.protocol))return;
    if(target.hostname==='wa.me'&&target.pathname==='/5511933596263'){
      const plans={'Plano Presença':'presenca','Ecossistema Nexo':'ecossistema','Plano Sites e páginas':'sites'};
      enqueue('whatsapp_click',{section,action:plans[el.dataset.package]||section,project:lastProject||null,category:lastCategory||null,target_host:'wa.me'});flush(true);return;
    }
    const project=(window.NEXO_PORTFOLIO?.projects||[]).find(p=>{try{return p.websiteUrl&&new URL(p.websiteUrl).hostname===target.hostname;}catch(_){return false;}});
    if(project&&el.closest('#nexo-portfolio'))enqueue('project_open',{category:project.category,project:project.id});
    enqueue('link_click',{section,action:project?.id||target.hash.replace('#','').slice(0,80)||target.hostname,target_host:target.hostname});
    if(target.hostname!==location.hostname)flush(true);
  },{capture:true,passive:true});
  document.addEventListener('submit',event=>{
    if(event.target?.id!=='brief')return;touch();enqueue('brief_submit',{section:'proximo-passo'});
    enqueue('whatsapp_click',{section:'brief',action:'brief',target_host:'wa.me'});flush(true);
  },{capture:true,passive:true});
  document.addEventListener('toggle',event=>{
    if(!event.target.open)return;if(event.target.matches('.optional-brief'))enqueue('brief_open',{section:'proximo-passo'});
    else if(event.target.closest('#faq'))enqueue('faq_open',{section:'faq',action:'pergunta-'+[...document.querySelectorAll('#faq details')].indexOf(event.target)});
  },{capture:true,passive:true});
  let pendingScroll=false;
  window.addEventListener('scroll',()=>{
    touch();if(pendingScroll||document.querySelector('#nexo-portfolio')?.open)return;pendingScroll=true;
    requestAnimationFrame(()=>{pendingScroll=false;const total=document.documentElement.scrollHeight-innerHeight;
      depth=Math.max(depth,total>0?Math.min(100,Math.round(scrollY/total*100)):100);
      for(const mark of [25,50,75,100])if(depth>=mark&&!scrollSeen.has(mark)){scrollSeen.add(mark);enqueue('scroll',{progress:mark,scroll_depth:depth});}
    });
  },{passive:true});
  if('IntersectionObserver' in window){const observer=new IntersectionObserver(entries=>{
    for(const e of entries)if(e.isIntersecting&&e.intersectionRect.height>=Math.min(120,e.boundingClientRect.height*.3)&&!sectionSeen.has(e.target.id)){
      sectionSeen.add(e.target.id);enqueue('section_view',{section:e.target.id});
    }
  },{threshold:[0,.1,.3,.5,.8]});document.querySelectorAll('main > section[id],#conteudo > section[id]').forEach(el=>observer.observe(el));}
  ['pointerdown','keydown','touchstart'].forEach(type=>window.addEventListener(type,touch,{passive:true}));
  document.addEventListener('nexo:portfolioview',portfolio);
  function snapshot(){enqueue('engagement');videos.forEach(s=>{tickVideo(s,performance.now());watchSnapshot(s);});}
  document.addEventListener('visibilitychange',()=>{if(document.hidden){snapshot();flush(true);}else{lastTick=performance.now();touch();}});
  window.addEventListener('pagehide',()=>{snapshot();flush(true);},{passive:true});
  window.addEventListener('storage',event=>{if(event.key===KEYS.owner||event.key===KEYS.optout)if(disabled())queue=[];});
  setInterval(()=>{const now=performance.now(),elapsed=Math.min(6,Math.max(0,(now-lastTick)/1000));lastTick=now;
    const watching=[...videos].some(s=>s.video.isConnected&&!s.video.paused&&!s.video.ended);
    if(!document.hidden&&(Date.now()-lastInput<60000||watching)&&!disabled()){active+=elapsed;persist();}videos.forEach(s=>tickVideo(s,now));
  },5000);
  setInterval(()=>{if(!document.hidden&&!disabled()&&(Date.now()-lastInput<60000||[...videos].some(s=>s.video.isConnected&&!s.video.paused&&!s.video.ended))){enqueue('engagement');flush();}},15000);
  persist();enqueue('page_view');portfolio();flush();
})();
