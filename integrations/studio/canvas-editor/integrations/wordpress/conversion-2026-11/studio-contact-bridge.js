(function(){
 const frame=document.getElementById('studio'),dialog=document.getElementById('gf-inquiry-dialog');
 if(!frame||!dialog)return;
 const origin='https://gamefields-studio.ryhfs90.chatgpt.site',field=dialog.querySelector('[name="project-details"]'),status=dialog.querySelector('[data-attachment-status]'),review=dialog.querySelector('[data-attachment-review]');
 function render(){const value=field.value.trim();review.textContent=value;status.textContent=value?'Projekt i orientacyjna kalkulacja są dołączone. Sprawdź parametry, uzupełnij kontakt i wyślij zapytanie.':'Nie ma dołączonej konfiguracji.';}
 dialog.querySelector('[data-close]').addEventListener('click',()=>{dialog.close();frame.focus()});
 dialog.querySelector('[data-clear]').addEventListener('click',()=>{field.value='';field.dispatchEvent(new Event('input',{bubbles:true}));render()});
 window.addEventListener('message',event=>{
  if(event.origin!==origin||event.source!==frame.contentWindow)return;
  const d=event.data;if(!d||d.type!=='gf-inquiry'||typeof d.summary!=='string'||d.summary.length>500000||typeof d.requestId!=='string'||d.requestId.length>100)return;
  const reply=type=>event.source.postMessage({type,requestId:d.requestId,summaryLength:field?.value.length},origin);
  try{const project=JSON.parse(d.summary);if(!project||typeof project!=='object'||Array.isArray(project)||!field)throw Error();field.value=d.summary;field.dispatchEvent(new Event('input',{bubbles:true}));render();if(!dialog.open)dialog.showModal();reply('gf-inquiry-attached');dialog.querySelector('[name="your-email"]')?.focus()}catch{reply('gf-inquiry-rejected')}
 });
})();
