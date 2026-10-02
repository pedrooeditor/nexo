'use strict';

const menu = document.querySelector('.menu');
const nav = document.getElementById('nav');
function closeMenu(){ nav.classList.remove('open'); menu.setAttribute('aria-expanded','false'); menu.setAttribute('aria-label','Abrir menu'); }
menu.addEventListener('click',()=>{const open = !nav.classList.contains('open');nav.classList.toggle('open',open);menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Fechar menu':'Abrir menu');});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&nav.classList.contains('open')){closeMenu();menu.focus();}});
const steps = [
  ['01 / CONTEÚDO','O primeiro segundo abre a conversa.','Edição e motion design dão ritmo à sua mensagem. Os vídeos entram no planejamento de conteúdo e levam o público ao próximo passo.'],
  ['02 / SOCIAL','Presença que aproxima.','Planejamento, publicações e uma linguagem consistente ajudam sua marca a construir relacionamento. O conteúdo conduz o interesse para a oferta certa.'],
  ['03 / WEB','Interesse encontra um caminho.','O site apresenta sua marca e organiza sua oferta. A landing page concentra a mensagem de uma campanha e facilita o próximo passo até o contato.'],
  ['04 / CONVERSÃO','A conversa precisa continuar.','O atendimento no WhatsApp acompanha quem demonstrou interesse. O CRM organiza os retornos, e as dúvidas dos clientes ajudam a melhorar o próximo conteúdo.']
];
document.querySelectorAll('.node').forEach(node=>node.addEventListener('click',()=>{document.querySelectorAll('.node').forEach(other=>{const active=other===node;other.classList.toggle('active',active);other.setAttribute('aria-pressed',String(active));});const step=steps[Number(node.dataset.step)];document.getElementById('step-label').textContent=step[0];document.getElementById('step-title').textContent=step[1];document.getElementById('step-copy').textContent=step[2];}));
document.querySelectorAll('[data-interest]').forEach(link=>link.addEventListener('click',()=>{document.getElementById('interest').value=link.dataset.interest;}));
document.getElementById('brief').addEventListener('submit',event=>{event.preventDefault();const form=event.currentTarget;if(!form.reportValidity())return;const name=form.elements.name.value.trim();if(!name){form.elements.name.setCustomValidity('Digite seu nome.');form.elements.name.reportValidity();return;}const company=form.elements.company.value.trim();const goal=form.elements.goal.value.trim();const lines=['[Site · Formulário · '+form.elements.interest.value+']','Olá, Nexo Studio! Meu nome é '+name+'.',company?'Minha marca: '+company+'.':'','Quero conversar sobre: '+form.elements.interest.value+'.',goal?'Meu objetivo: '+goal:''].filter(Boolean);const url='https://wa.me/5511933596263?text='+encodeURIComponent(lines.join('\n\n'));window.open(url,'_blank','noopener,noreferrer');});
document.getElementById('name').addEventListener('input',event=>event.target.setCustomValidity(''));
