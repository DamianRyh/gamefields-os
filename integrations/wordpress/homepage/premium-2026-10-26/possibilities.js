(function(){
const root=document.getElementById('gm-root'),dataEl=document.getElementById('gm-data');
if(!root||!dataEl)return;
const D=JSON.parse(dataEl.textContent);
const state={who:null,area:null,need:null,lat:null,lng:null};
const $=s=>root.querySelector(s);
const label=(group,id)=>(D[group].find(o=>o.id===id)||{}).label||'';
function el(tag,attrs,children){const n=document.createElement(tag);for(const k in attrs||{}){if(k==='text')n.textContent=attrs[k];else if(k==='class')n.className=attrs[k];else n.setAttribute(k,attrs[k]);}for(const c of children||[])if(c)n.appendChild(typeof c==='string'?document.createTextNode(c):c);return n;}

// Options
for(const group of ['who','area','need']){
 const box=root.querySelector('[data-options="'+group+'"]');
 for(const o of D[group]){
  const btn=el('button',{type:'button',class:'gm-opt','aria-pressed':'false','data-group':group,'data-id':o.id},[o.label]);
  if(o.hint)btn.appendChild(el('small',{text:o.hint}));
  btn.addEventListener('click',()=>{state[group]=state[group]===o.id?null:o.id;sync();render();});
  box.appendChild(btn);
 }
}
function sync(){root.querySelectorAll('.gm-opt').forEach(b=>b.setAttribute('aria-pressed',String(state[b.dataset.group]===b.dataset.id)));}

// Status badge
function badge(t){
 const k=t.timing.kind;
 if(k==='always')return el('span',{class:'gm-badge always',text:'Dostępne zawsze'});
 if(k==='check')return el('span',{class:'gm-badge check',text:'Sprawdź teraz'});
 if(k==='unconfirmed')return el('span',{class:'gm-badge',text:'Edycja do potwierdzenia'});
 if(t.timing.next)return el('span',{class:'gm-badge next',text:'Kolejny nabór: '+t.timing.next.replace(/^Orientacyjnie /,'ok. ')});
 return el('span',{class:'gm-badge',text:'Co roku'});
}
function fact(name,value){return el('div',{},[el('dt',{text:name}),el('dd',{text:value})]);}
function card(t){
 const facts=[fact('Kto składa',t.submits),fact('Kiedy',t.timing.text)];
 if(t.own&&t.own!=='—')facts.push(fact('Wkład własny',t.own));
 const det=el('details',{},[el('summary',{text:'Szczegóły i jak zacząć'}),el('dl',{class:'gm-facts'},facts),el('ol',{},t.steps.map(s=>el('li',{text:s})))]);
 if(t.source){const a=el('a',{href:t.source.url,text:t.source.label});if(/^https?:/.test(t.source.url)){a.target='_blank';a.rel='noopener';}det.appendChild(el('p',{class:'gm-source'},['Źródło: ',a]));}
 return el('article',{class:'gm-card','data-tool':t.id},[
  badge(t),el('h4',{text:t.name}),el('p',{text:t.short}),
  el('p',{class:'gm-amount'},[el('b',{text:'Ile: '}),t.amount]),
  el('p',{class:'gm-we'},[el('b',{text:'Co robimy za Ciebie: '}),t.weDo]),det]);
}
function matches(){
 return D.tools.filter(t=>t.who.includes(state.who)&&(!state.area||t.area.includes(state.area))&&(!state.need||t.need.includes(state.need)));
}
function render(){
 const out=$('#gm-results');out.textContent='';
 const cta=$('#gm-cta');
 if(!state.who){out.appendChild(el('p',{class:'gm-empty',text:'Zacznij od pytania 1 — pokażemy Ci wszystkie drogi, które pasują właśnie do Ciebie.'}));cta.hidden=true;writeUrl();return;}
 const list=matches();
 const sum=el('p',{class:'gm-summary'},['Mamy dla Ciebie ',el('span',{text:list.length+' '+(list.length===1?'drogę':list.length<5?'drogi':'dróg')}),'. Zacznij od pierwszej grupy.']);
 out.appendChild(sum);
 for(const lv of D.levels){
  const tools=list.filter(t=>t.level===lv.id);if(!tools.length)continue;
  out.appendChild(el('div',{class:'gm-level'},[el('div',{class:'gm-level-head'},[el('h3',{text:lv.title}),el('p',{text:lv.lead})]),el('div',{class:'gm-cards'},tools.map(card))]));
 }
 cta.hidden=false;writeUrl();
}

// Shareable URL
function writeUrl(){
 try{const u=new URL(location.href);for(const k of ['who','area','need'])state[k]?u.searchParams.set('gm_'+k,state[k]):u.searchParams.delete('gm_'+k);history.replaceState(null,'',u);}catch(e){}
}
function readUrl(){
 const p=new URLSearchParams(location.search);
 for(const k of ['who','area','need']){const v=p.get('gm_'+k);if(v&&D[k].some(o=>o.id===v))state[k]=v;}
}

// Map (Leaflet loaded only when asked)
let map=null,marker=null,L=null;
function loadLeaflet(){
 if(window.L)return Promise.resolve(window.L);
 return new Promise((res,rej)=>{
  const css=el('link',{rel:'stylesheet',href:'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',integrity:'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=',crossorigin:''});document.head.appendChild(css);
  const s=el('script',{src:'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js',integrity:'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=',crossorigin:''});
  s.onload=()=>res(window.L);s.onerror=rej;document.head.appendChild(s);
 });
}
function setPin(lat,lng,zoom){
 state.lat=+lat.toFixed(5);state.lng=+lng.toFixed(5);
 $('#gm-coords').textContent='Zaznaczone: '+state.lat+', '+state.lng;
 if(!map)return;
 if(!marker)marker=L.marker([lat,lng],{draggable:true,icon:L.divIcon({html:'<div class="gm-pin"></div>',className:'',iconSize:[28,28],iconAnchor:[14,28]})}).addTo(map).on('dragend',e=>{const p=e.target.getLatLng();setPin(p.lat,p.lng);});
 else marker.setLatLng([lat,lng]);
 if(zoom)map.setView([lat,lng],zoom);
}
function startMap(){
 const box=$('#gm-map'),btn=$('#gm-map-start');
 if(map)return Promise.resolve();
 btn.textContent='Ładuję mapę…';btn.disabled=true;
 return loadLeaflet().then(lib=>{
  L=lib;btn.remove();
  map=L.map(box,{scrollWheelZoom:false}).setView([52.07,19.48],6);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'}).addTo(map);
  map.on('click',e=>setPin(e.latlng.lat,e.latlng.lng));
  if(state.lat!=null)setPin(state.lat,state.lng,15);
 }).catch(()=>{btn.textContent='Mapa niedostępna — wpisz miejsce poniżej';});
}
$('#gm-map-start').addEventListener('click',startMap);
$('#gm-locate').addEventListener('click',()=>{
 const out=$('#gm-coords');
 if(!navigator.geolocation){out.textContent='Twoja przeglądarka nie udostępnia lokalizacji — zaznacz miejsce na mapie.';return;}
 out.textContent='Szukam Twojej lokalizacji…';
 navigator.geolocation.getCurrentPosition(p=>startMap().then(()=>setPin(p.coords.latitude,p.coords.longitude,16)),()=>{out.textContent='Nie udało się pobrać lokalizacji — zaznacz miejsce na mapie.';},{enableHighAccuracy:true,timeout:10000});
});

// Plan text → contact form
function planText(){
 const place=$('#gm-place-name').value.trim();
 const lines=['MAPA MOŻLIWOŚCI — mój plan','Kim jestem: '+label('who',state.who)];
 if(state.area)lines.push('Teren: '+label('area',state.area));
 if(state.need)lines.push('Chcę: '+label('need',state.need));
 if(place)lines.push('Miejsce: '+place);
 if(state.lat!=null)lines.push('Na mapie: '+state.lat+', '+state.lng+' (https://www.openstreetmap.org/?mlat='+state.lat+'&mlon='+state.lng+'#map=17/'+state.lat+'/'+state.lng+')');
 lines.push('Drogi, które mnie interesują: '+matches().map(t=>t.name).join('; '));
 return lines.join('\n');
}
$('#gm-send').addEventListener('click',()=>{
 const page=document.getElementById('gf-culture')||document,field=page.querySelector('[name="project-details"]'),contact=page.querySelector('#kontakt');
 if(field){
  const text=planText(),rest=field.value.replace(/MAPA MOŻLIWOŚCI — mój plan[\s\S]*?(\n\n|$)/,'').trim();
  field.value=text+(rest?'\n\n'+rest:'');field.dispatchEvent(new Event('input',{bubbles:true}));
  const att=page.querySelector('#gc-attached');if(att){att.textContent='Twój plan z Mapy możliwości jest dołączony. Wpisz e-mail i wyślij — odezwiemy się z wizualizacją i kosztem.';att.hidden=false;}
 }
 if(contact){contact.scrollIntoView({behavior:'smooth'});const mail=page.querySelector('[name="your-email"]');if(mail)setTimeout(()=>mail.focus({preventScroll:true}),400);}
 else location.href='mailto:info@gamefields.eu?subject='+encodeURIComponent('Mapa możliwości — mój plan')+'&body='+encodeURIComponent(planText());
});
$('#gm-share').addEventListener('click',()=>{
 const s=$('#gm-share-status'),url=location.href;
 const done=()=>{s.textContent='Link skopiowany — wyślij go znajomym.';};
 if(navigator.share&&matchMedia('(pointer:coarse)').matches){navigator.share({title:'Zróbmy tu boisko',url}).catch(()=>{});return;}
 if(navigator.clipboard)navigator.clipboard.writeText(url).then(done,()=>{s.textContent=url;});else s.textContent=url;
});

$('#gm-note').textContent='Informacje sprawdzone '+D.verifiedAt.split('-').reverse().join('.')+'. Kwoty i terminy pochodzą z naborów 2026 — przed złożeniem wniosku zawsze sprawdź regulamin aktualnej edycji. Pomagamy przygotować materiały, ale wniosek składa uprawniona osoba lub organizacja.';
readUrl();sync();render();
})();
