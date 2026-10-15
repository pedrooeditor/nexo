(() => {
  'use strict';
  const api=window.NexoMetrics,button=document.getElementById('privacy-toggle'),status=document.getElementById('privacy-status');
  if(!api){button.disabled=true;status.textContent='Não foi possível carregar suas preferências.';return;}
  const signal=navigator.doNotTrack==='1'||window.doNotTrack==='1'||navigator.globalPrivacyControl===true;
  function render(){
    const off=api.isDisabled();button.textContent=off?'Permitir medição neste navegador':'Desativar medição neste navegador';
    status.textContent=signal?'Seu navegador solicita que a medição não seja feita. Esse sinal é respeitado.':off?'Medição desativada neste navegador.':'Você pode optar por não participar da medição.';
  }
  button.addEventListener('click',()=>{if(api.isDisabled())api.enable();else{api.disable();render();if(!api.isDisabled())status.textContent='Não foi possível salvar a preferência. Confira as permissões de armazenamento do navegador.';}});render();
})();
