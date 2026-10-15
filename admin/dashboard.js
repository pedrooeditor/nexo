(() => {
  'use strict';
  const api=window.NexoAdmin;if(!api)return;
  const $=id=>document.getElementById(id),nf=new Intl.NumberFormat('pt-BR');
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const num=value=>nf.format(Number(value)||0);
  const percent=value=>new Intl.NumberFormat('pt-BR',{maximumFractionDigits:1}).format(Number(value)||0)+'%';
  const duration=value=>{const s=Math.max(0,Math.round(Number(value)||0));return s<60?s+'s':s<3600?Math.floor(s/60)+'min '+String(s%60).padStart(2,'0')+'s':Math.floor(s/3600)+'h '+Math.floor(s%3600/60)+'min';};
  const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  const shift=(day,amount)=>{const d=new Date(day+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+amount);return d.toISOString().slice(0,10);};
  const date=value=>new Date(String(value).slice(0,10)+'T12:00:00Z').toLocaleDateString('pt-BR',{timeZone:'America/Sao_Paulo'});
  const time=value=>new Date(value).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'});
  const labels={
    direto:'Direto / sem origem',google:'Google',bing:'Bing',instagram:'Instagram',facebook:'Facebook',whatsapp:'WhatsApp',tiktok:'TikTok',
    mobile:'Celular',desktop:'Computador',tablet:'Tablet',motion:'Edição de vídeo',web:'Sites e páginas',
    'ritmo-narrativa':'A luta por trás da luta','marca-movimento':'Edição para Reels','nova-aco-armado':'Site para construção civil','pagina-exemplo-2':'Loja virtual de perfumaria',
    'inicio':'Início',header:'Cabeçalho',footer:'Rodapé',floating:'Botão flutuante',trabalhos:'Trabalhos',servicos:'Serviços',manifesto:'Conexão Nexo',equipe:'Equipe',clientes:'Feedbacks',parcerias:'Planos',processo:'Como funciona',faq:'Dúvidas',
    'proximo-passo':'Convite final',brief:'Formulário opcional',portfolio:'Portfólio',site:'Site',presenca:'Plano Presença',ecossistema:'Ecossistema Nexo',sites:'Sites e páginas',
    page_view:'Página aberta',engagement:'Tempo ativo',scroll:'Rolagem',section_view:'Seção vista',portfolio_open:'Portfólio aberto',project_open:'Projeto aberto',
    link_click:'Link clicado',whatsapp_click:'Clique no WhatsApp',video_play:'Vídeo iniciado',video_progress:'Progresso do vídeo',video_watch:'Tempo assistido',video_complete:'Vídeo chegou ao fim',video_error:'Erro no vídeo',brief_open:'Formulário aberto',brief_submit:'Formulário enviado ao WhatsApp',service_open:'Serviço expandido',faq_open:'Pergunta expandida'
  };
  const label=value=>labels[value]||value||'—';
  const empty=(message='Sem registros neste período.')=>'<p class="empty-copy">'+esc(message)+'</p>';
  let report=null,busy=false,requestId=0,startedDate=null;
  $('start-date').value=shift(today(),-6);$('end-date').value=today();$('end-date').max=today();$('start-date').max=today();
  function selectedRange(){
    const end=today(),value=$('period').value;
    if(value==='custom')return{start:$('start-date').value,end:$('end-date').value};
    if(value==='today')return{start:end,end};
    if(value==='all')return{start:startedDate||end,end};
    return{start:shift(end,1-Number(value)),end};
  }
  function table(target,columns,rows,message){
    const el=$(target);if(!el)return;
    if(!rows?.length){el.innerHTML=empty(message);return;}
    el.innerHTML='<table><thead><tr>'+columns.map(c=>'<th scope="col"'+(c.numeric?' class="num"':'')+'>'+esc(c.title)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+columns.map(c=>'<td'+(c.numeric?' class="num"':'')+'>'+esc(c.render?c.render(row[c.key],row):row[c.key]??'—')+'</td>').join('')+'</tr>').join('')+'</tbody></table>';
  }
  function bars(target,rows,key,count='sessions',extra){
    const el=$(target);if(!el)return;if(!rows?.length){el.innerHTML=empty();return;}
    const total=rows.reduce((s,r)=>s+(Number(r[count])||0),0),max=Math.max(1,...rows.map(r=>Number(r[count])||0));
    el.innerHTML=rows.map(r=>'<div class="bar-item"><div class="bar-item-head"><span>'+esc(label(r[key]))+'</span><strong>'+num(r[count])+'</strong></div><div class="bar-track"><div class="bar-fill" data-bar="'+Math.round(100*(Number(r[count])||0)/max)+'"></div></div><small>'+percent(100*(Number(r[count])||0)/Math.max(1,total))+(extra?' · '+esc(extra(r)):'')+'</small></div>').join('');
    el.querySelectorAll('[data-bar]').forEach(el=>{el.style.width=el.dataset.bar+'%';});
  }
  function lineChart(){
    const rows=report?.daily||[],metric=$('chart-metric').value,root=$('daily-chart');
    if(!rows.length){root.innerHTML=empty('Não há dias medidos neste recorte.');root.setAttribute('aria-label','Sem dias medidos no período');return;}
    const width=Math.max(260,Math.min(900,root.clientWidth||720)),height=260,left=39,right=18,top=18,bottom=37,w=width-left-right,h=height-top-bottom;
    const max=Math.max(4,Math.ceil(Math.max(...rows.map(r=>Number(r[metric])||0))/4)*4);
    const x=i=>left+(rows.length===1?w/2:i*w/(rows.length-1)),y=value=>top+h-(Number(value)||0)*h/max;
    const points=rows.map((r,i)=>x(i)+','+y(r[metric])).join(' '),title={visitors:'Visitantes',sessions:'Visitas',contacts:'Visitas com clique no WhatsApp'}[metric];
    const ticks=Array.from({length:5},(_,i)=>{const value=max*i/4,yy=y(value);return'<line x1="'+left+'" y1="'+yy+'" x2="'+(width-right)+'" y2="'+yy+'" class="chart-grid"/><text x="'+(left-9)+'" y="'+(yy+4)+'" text-anchor="end" class="chart-axis">'+num(value)+'</text>';}).join('');
    const labelCount=width<420?3:6;
    const indices=[...new Set(Array.from({length:labelCount},(_,i)=>Math.round((rows.length-1)*i/(labelCount-1))))];
    const dates=indices.map(i=>'<text x="'+x(i)+'" y="'+(height-10)+'" text-anchor="middle" class="chart-axis">'+esc(rows[i].day.slice(8,10)+'/'+rows[i].day.slice(5,7))+'</text>').join('');
    root.innerHTML='<svg viewBox="0 0 '+width+' '+height+'" role="img" aria-label="'+esc(title)+' por dia"><title>'+esc(title)+' por dia</title>'+ticks+dates+'<polyline points="'+points+'" class="chart-line"/>'+rows.map((r,i)=>'<circle cx="'+x(i)+'" cy="'+y(r[metric])+'" r="'+(rows.length>90?2:3.5)+'" class="chart-point" tabindex="0"><title>'+esc(date(r.day)+': '+num(r[metric])+' '+title.toLowerCase())+'</title></circle>').join('')+'</svg>';
    root.setAttribute('aria-label',title+' de '+date(rows[0].day)+' a '+date(rows[rows.length-1].day));
    table('daily-table',[{key:'day',title:'Dia',render:date},{key:'visitors',title:'Visitantes',numeric:true,render:num},{key:'sessions',title:'Visitas',numeric:true,render:num},{key:'views',title:'Visualizações',numeric:true,render:num},{key:'contacts',title:'WhatsApp',numeric:true,render:num}],rows);
  }
  function render(data){
    report=data;startedDate=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date(data.collection_started_at));
    const o=data.overview||{};
    document.querySelectorAll('[data-kpi]').forEach(el=>{const value=o[el.dataset.kpi];el.textContent=el.dataset.format==='duration'?duration(value):el.dataset.format==='percent'?percent(value):num(value);});
    $('contact-rate').textContent=percent(o.contact_rate)+' das visitas clicaram para conversar';
    $('connection-status').textContent='Coleta configurada';$('last-update').textContent='Atualizado '+time(data.generated_at);
    $('range-copy').textContent=date(data.range.start)+' — '+date(data.range.end)+(data.range.device?' · '+label(data.range.device):'')+(data.range.source?' · '+label(data.range.source):'');
    $('history-notice').textContent='Medição iniciada em '+time(data.collection_started_at)+'. Acessos anteriores sem registro são indisponíveis. Seus navegadores marcados ficam fora dos números.';
    $('history-method').textContent='Coleta iniciada em '+time(data.collection_started_at)+'. Não há estimativa nem reconstrução de visitas anteriores sem registro.';
    $('no-data').hidden=Number(o.sessions)>0;
    const currentSource=$('source').value;
    $('source').innerHTML='<option value="">Todas</option>'+(data.source_options||[]).sort().map(source=>'<option value="'+esc(source)+'">'+esc(label(source))+'</option>').join('');
    $('source').value=currentSource;
    bars('sources-chart',data.sources,'source','sessions',r=>num(r.contacts)+' visitas com contato');
    bars('devices-chart',data.devices,'device','sessions',r=>num(r.contacts)+' visitas com contato');
    bars('browsers-chart',data.browsers,'browser');
    bars('returning-chart',[{name:'Novos no período',visitors:o.new_visitors||0},{name:'Já haviam visitado',visitors:o.returning_visitors||0}],'name','visitors');
    bars('sections-chart',data.sections,'section');bars('portfolios',data.portfolios,'category','sessions',r=>num(r.opens)+' aberturas');
    $('scroll-summary').textContent=num(o.scroll_75_sessions)+' visitas chegaram a 75% da página.';
    const j=data.journey||{},steps=[['01','Visitas',j.visits,'Navegações registradas'],['02','Abriram um portfólio',j.portfolio,'Dentro dessas visitas'],['03','Depois clicaram no WhatsApp',j.portfolio_contact,'Na mesma visita, após abrir a galeria']];
    $('journey').innerHTML=steps.map(s=>'<div class="journey-step"><span>'+s[0]+'</span><div><strong>'+s[1]+'</strong><small>'+s[3]+'</small></div><b>'+num(s[2])+'</b></div>').join('');
    $('direct-contacts').textContent=num(j.direct_contact)+' visitas clicaram no WhatsApp sem abrir um portfólio.';
    table('projects-table',[{key:'project',title:'Projeto',render:label},{key:'opens',title:'Aberturas',numeric:true,render:num},{key:'sessions',title:'Visitas',numeric:true,render:num}],data.projects);
    table('videos-table',[{key:'project',title:'Vídeo',render:label},{key:'plays',title:'Inícios',numeric:true,render:num},{key:'reached_25',title:'25%',numeric:true,render:num},{key:'reached_50',title:'50%',numeric:true,render:num},{key:'reached_75',title:'75%',numeric:true,render:num},{key:'completed',title:'Até o fim',numeric:true,render:num},{key:'avg_watch_seconds',title:'Tempo médio',numeric:true,render:duration},{key:'completed',title:'Conclusão',numeric:true,render:(v,r)=>percent(100*(Number(v)||0)/Math.max(1,Number(r.plays)||0))},{key:'errors',title:'Erros',numeric:true,render:num}],data.videos,'A retenção aparecerá depois das primeiras reproduções.');
    $('video-total').textContent=num(data.events?.video_plays)+' vídeos iniciados · '+num(data.events?.video_errors)+' erros';
    $('whatsapp-total').textContent=num(o.whatsapp_clicks)+' cliques no total · '+num(o.whatsapp_sessions)+' visitas distintas';
    table('whatsapp-table',[{key:'section',title:'Local',render:label},{key:'action',title:'Plano / botão',render:label},{key:'clicks',title:'Cliques',numeric:true,render:num},{key:'sessions',title:'Visitas',numeric:true,render:num}],data.whatsapp_buttons);
    table('campaigns-table',[{key:'utm_campaign',title:'Campanha'},{key:'source',title:'Origem',render:label},{key:'utm_medium',title:'Meio'},{key:'sessions',title:'Visitas',numeric:true,render:num},{key:'contacts',title:'WhatsApp',numeric:true,render:num}],data.campaigns,'Use links identificados para distinguir grupos, parceiros e campanhas.');
    table('links-table',[{key:'action',title:'Link',render:label},{key:'section',title:'Local',render:label},{key:'clicks',title:'Cliques',numeric:true,render:num}],data.links);
    table('recent-table',[{key:'received_at',title:'Quando',render:time},{key:'event_name',title:'Ação',render:label},{key:'project',title:'Contexto',render:(v,r)=>label(v||r.section)},{key:'device',title:'Aparelho',render:label}],data.recent);
    const hours=Array.from({length:24},(_,hour)=>({hour,sessions:Number(data.hours?.find(r=>Number(r.hour)===hour)?.sessions)||0})),max=Math.max(1,...hours.map(h=>h.sessions));
    $('hours-chart').innerHTML=hours.map(r=>'<div class="hour-column" title="'+r.hour+'h: '+num(r.sessions)+' visitas"><i data-height="'+Math.max(1,100*r.sessions/max)+'"></i>'+(r.hour%4===0?'<span>'+r.hour+'h</span>':'')+'</div>').join('');
    $('hours-chart').querySelectorAll('[data-height]').forEach(el=>{el.style.height=el.dataset.height+'%';});lineChart();
  }
  async function load(){
    if(busy)return;const range=selectedRange();
    if(!range.start||!range.end||range.end<range.start){$('data-error').hidden=false;$('data-error').textContent='Confira as datas de início e fim.';return;}
    if(new Date(range.end)-new Date(range.start)>366*86400000){$('data-error').hidden=false;$('data-error').textContent='Selecione um período de até 367 dias por consulta.';return;}
    busy=true;const id=++requestId;$('refresh').disabled=true;$('export').disabled=true;$('data-error').hidden=true;$('connection-status').textContent='Atualizando…';
    try{
      const data=await api.rpc('nexo_report',{p_start:range.start,p_end:range.end,p_device:$('device').value,p_source:$('source').value});
      if(id===requestId)render(data);
    }catch(error){$('data-error').textContent=error.message||'Falha ao carregar. Tente atualizar.';$('data-error').hidden=false;$('connection-status').textContent='Conexão indisponível';}
    finally{busy=false;$('refresh').disabled=false;$('export').disabled=!report;}
  }
  $('filters').addEventListener('submit',event=>{event.preventDefault();load();});
  $('period').addEventListener('change',()=>{$('date-fields').hidden=$('period').value!=='custom';if($('period').value!=='custom')load();});
  ['device','source'].forEach(id=>$(id).addEventListener('change',load));$('chart-metric').addEventListener('change',lineChart);
  let resizeTimer;window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{if(report)lineChart();},150);},{passive:true});
  function csvCell(value){let s=String(value??'');if(typeof value==='string'&&/^[=+@\-\t\r]/.test(s))s="'"+s;return'"'+s.replace(/"/g,'""')+'"';}
  $('export').addEventListener('click',()=>{
    if(!report)return;const rows=[['bloco','dia','indicador','origem','aparelho','projeto','acao','valor','visitas','contatos','tempo_segundos']];
    for(const [key,value] of Object.entries(report.overview||{}))rows.push(['resumo','',key,'','','','',value,'','','']);
    for(const r of report.daily||[])for(const key of ['visitors','sessions','views','contacts'])rows.push(['diario',r.day,key,'','','','',r[key],'','','']);
    for(const r of report.sources||[])rows.push(['origem','','',r.source,'','','','',r.sessions,r.contacts,r.avg_active_seconds]);
    for(const r of report.devices||[])rows.push(['aparelho','','','',r.device,'','','',r.sessions,r.contacts,'']);
    for(const r of report.videos||[])for(const key of ['plays','reached_25','reached_50','reached_75','completed','avg_watch_seconds','errors'])rows.push(['video','',key,'','',r.project,'',r[key],'','','']);
    for(const r of report.projects||[])rows.push(['projeto','','aberturas','','',r.project,'',r.opens,r.sessions,'','']);
    for(const r of report.whatsapp_buttons||[])rows.push(['whatsapp','','cliques','','','',r.section+' / '+r.action,r.clicks,r.sessions,'','']);
    for(const r of report.sections||[])rows.push(['secao','','visitas','','','',r.section,r.sessions,'','','']);
    for(const r of report.campaigns||[])rows.push(['campanha','','',r.source,'','',r.utm_campaign,'',r.sessions,r.contacts,'']);
    for(const r of report.links||[])rows.push(['link','','cliques','','','',r.action,r.clicks,'','','']);
    const blob=new Blob(['\ufeff'+rows.map(row=>row.map(csvCell).join(';')).join('\r\n')],{type:'text/csv;charset=utf-8;'}),url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url;a.download='nexo-analytics-'+report.range.start+'-a-'+report.range.end+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  });
  async function exclude(){
    try{await api.excludeThisBrowser();$('owner-status').textContent='Exclusão ativada. Este navegador não gera novas visitas e os registros associados ao seu identificador são filtrados dos relatórios.';}
    catch(_){$('owner-status').textContent='Não foi possível confirmar a exclusão no servidor. A marcação local foi solicitada; tente novamente.';}
  }
  $('exclude-device').addEventListener('click',async()=>{await exclude();load();});
  const campaignTag=(value,max)=>value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase()
    .replace(/[^a-z0-9_-]+/g,'_').replace(/_+/g,'_').slice(0,max).replace(/^[_-]+|[_-]+$/g,'');
  function clearCampaign(){
    $('campaign-output').value='';$('campaign-output-wrap').hidden=true;$('campaign-status').textContent='';
  }
  ['campaign-source','campaign-name'].forEach(id=>$(id).addEventListener('input',clearCampaign));
  $('campaign-form').addEventListener('submit',event=>{
    event.preventDefault();clearCampaign();
    const source=campaignTag($('campaign-source').value,60),campaign=campaignTag($('campaign-name').value,80);
    if(!source||!campaign){
      $('campaign-status').textContent='Use pelo menos uma letra ou número em cada campo para identificar a divulgação.';
      $(source?'campaign-name':'campaign-source').focus();return;
    }
    $('campaign-source').value=source;$('campaign-name').value=campaign;
    const url=new URL('https://nexostud.com.br/');url.searchParams.set('utm_source',source);url.searchParams.set('utm_medium','divulgacao');url.searchParams.set('utm_campaign',campaign);
    $('campaign-output').value=url.href;$('campaign-output-wrap').hidden=false;
    $('campaign-status').textContent='Link pronto. Origem: '+source+' · Campanha: '+campaign+'. Acompanhe as visitas em Campanhas identificadas.';
  });
  $('copy-campaign').addEventListener('click',async()=>{
    if(!$('campaign-output').value)return;
    try{await navigator.clipboard.writeText($('campaign-output').value);$('campaign-status').textContent='Link copiado.';}
    catch(_){$('campaign-output').focus();$('campaign-output').select();$('campaign-status').textContent='Selecione e copie o link acima.';}
  });
  document.addEventListener('visibilitychange',()=>{if(!document.hidden&&!busy)load();});
  setInterval(()=>{if(!document.hidden&&!busy)load();},60000);
  exclude().then(load);
})();
