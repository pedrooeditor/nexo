/* Login tokens are transferred once, then kept only in memory. */
(() => {
  'use strict';
  const cfg=window.NEXO_ANALYTICS||{},HANDOFF='nexo.admin.handoff',OWNER='nexo.analytics.owner';
  const root=document.getElementById('dashboard'),loading=document.getElementById('session-loading');
  const page=document.body.dataset.page;
  try{localStorage.setItem(OWNER,'1');}catch(_){}
  async function request(name,args){
    if(!cfg.supabaseUrl||!cfg.publishableKey)throw new Error('A conexão do painel não está configurada.');
    const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),20000);
    try{
      const response=await fetch(cfg.supabaseUrl+'/rest/v1/rpc/'+name,{method:'POST',
        headers:{apikey:cfg.publishableKey,'Content-Type':'application/json'},body:JSON.stringify(args),
        cache:'no-store',credentials:'omit',referrerPolicy:'no-referrer',signal:controller.signal});
      const data=await response.json().catch(()=>null);
      if(!response.ok){const error=new Error(data?.code==='42501'?'Sua sessão expirou. Entre novamente.':'Não foi possível carregar os dados. Tente novamente.');error.status=response.status;error.code=data?.code;throw error;}
      return data;
    }catch(error){if(error.name==='AbortError')throw new Error('A conexão demorou mais que o esperado. Tente novamente.');throw error;}
    finally{clearTimeout(timer);}
  }
  function forgetHandoff(){try{sessionStorage.removeItem(HANDOFF);}catch(_){}}
  if(page==='login'){
    forgetHandoff();const form=document.getElementById('login-form'),status=document.getElementById('login-status');
    if(new URLSearchParams(location.search).get('expired')==='1')status.textContent='Entre novamente para continuar. A sessão é encerrada ao recarregar.';
    const toggle=document.getElementById('toggle-password'),password=document.getElementById('password');
    toggle.addEventListener('click',()=>{const visible=password.type==='password';password.type=visible?'text':'password';toggle.textContent=visible?'Ocultar':'Mostrar';toggle.setAttribute('aria-label',visible?'Ocultar senha':'Mostrar senha');toggle.setAttribute('aria-pressed',String(visible));});
    form.addEventListener('submit',async event=>{
      event.preventDefault();const button=form.querySelector('[type="submit"]');button.disabled=true;status.textContent='Verificando acesso…';
      try{
        const data=await request('nexo_login',{p_username:form.elements.username.value.trim(),p_password:password.value});
        if(!data?.ok||!data.token){status.textContent=data?.locked?'Muitas tentativas. Aguarde 15 minutos e tente novamente.':'Usuário ou senha inválidos.';password.value='';password.focus();return;}
        try{sessionStorage.setItem(HANDOFF,JSON.stringify({token:data.token,username:data.username,expires:Date.now()+20000}));}
        catch(_){request('nexo_logout',{p_token:data.token}).catch(()=>{});throw new Error('Permita o armazenamento desta aba para concluir o login.');}
        password.value='';location.replace('painel.html');
      }catch(error){status.textContent=error.message||'Não foi possível entrar. Tente novamente.';}
      finally{button.disabled=false;}
    });return;
  }
  let handoff=null;
  try{handoff=JSON.parse(sessionStorage.getItem(HANDOFF)||'null');}catch(_){}
  forgetHandoff();
  if(!handoff?.token||handoff.expires<Date.now()) {location.replace('./?expired=1');return;}
  let token=handoff.token;const username=handoff.username;handoff=null;
  function endSession(reason=''){
    if(!token)return;const old=token;token='';forgetHandoff();if(root)root.hidden=true;
    fetch(cfg.supabaseUrl+'/rest/v1/rpc/nexo_logout',{method:'POST',headers:{apikey:cfg.publishableKey,'Content-Type':'application/json'},body:JSON.stringify({p_token:old}),keepalive:true,credentials:'omit',referrerPolicy:'no-referrer'}).catch(()=>{});
    if(reason)location.replace('./?expired=1');
  }
  window.NexoAdmin=Object.freeze({
    username,
    async rpc(name,args={}){
      if(!token)throw new Error('Sua sessão expirou. Entre novamente.');
      try{return await request(name,{...args,p_token:token});}
      catch(error){if(error.code==='42501')endSession('expired');throw error;}
    },
    logout(){endSession();location.replace('./');},
    async excludeThisBrowser(){
      let visitor='';try{localStorage.setItem(OWNER,'1');if(localStorage.getItem(OWNER)!=='1')throw new Error('storage');visitor=localStorage.getItem('nexo.analytics.visitor')||'';}catch(_){throw new Error('Não foi possível salvar a exclusão neste navegador.');}
      if(/^[a-f0-9-]{36}$/i.test(visitor))await this.rpc('nexo_exclude_visitor',{p_visitor_id:visitor});
      return true;
    }
  });
  document.getElementById('logout').addEventListener('click',()=>window.NexoAdmin.logout());
  window.addEventListener('pagehide',()=>endSession(),{once:true});
  window.addEventListener('pageshow',event=>{if(event.persisted)location.replace('./?expired=1');});
  if(loading)loading.hidden=true;
  if(root)root.hidden=false;
})();
