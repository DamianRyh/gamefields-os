
/* Panna Cage 90 — unified CAD r2 product imagery */
const c90Assets={default:"https://www.gamefields.eu/wp-content/uploads/2026/10/Panna-Cage-90-CAD-r2-—-default.webp",hover:"https://www.gamefields.eu/wp-content/uploads/2026/10/Panna-Cage-90-CAD-r2-—-hover.webp",detail:"https://www.gamefields.eu/wp-content/uploads/2026/10/Panna-Cage-90-CAD-r2-—-detail-goal.webp"};
data.models['circle-cage-1']=c90Assets.default;
data.modelMedia['circle-cage-1']={poster:c90Assets.default,images:[{url:c90Assets.default},{url:c90Assets.hover},{url:c90Assets.detail}],videos:[]};
function cage90Media(hero=false){
 const wrap=node('div',{className:'gh-model-media'+(hero?' gh-hero-media':'')});wrap.dataset.modelMedia='circle-cage-1';wrap.dataset.revision='C90-CAD-2';
 const img=node('img',{src:c90Assets.default,alt:'Panna Cage 90 — konstrukcja CAD r2, siatka i stalowe profile',className:'gh-media-poster'+(hero?' gh-hero-image':'')});img.decoding='async';img.loading=hero?'eager':'lazy';img.width=1400;img.height=1000;
 const toggle=node('button',{type:'button',className:'gh-media-toggle'},'Zobacz kolor ↗');toggle.dataset.modelMediaToggle='';toggle.setAttribute('aria-label','Panna Cage 90: pokaż kolor konstrukcji');toggle.setAttribute('aria-pressed','false');let pinned=false;
 const show=active=>{img.src=active?c90Assets.hover:c90Assets.default;wrap.classList.toggle('is-color',active);toggle.textContent=active?'Pokaż konstrukcję ↙':'Zobacz kolor ↗';toggle.setAttribute('aria-pressed',String(pinned))};
 wrap.addEventListener('pointerenter',()=>show(true));wrap.addEventListener('pointerleave',()=>show(pinned));wrap.addEventListener('focusin',()=>show(true));wrap.addEventListener('focusout',e=>{if(!wrap.contains(e.relatedTarget))show(pinned)});
 toggle.addEventListener('click',()=>{pinned=!pinned;show(pinned)});wrap.append(img,toggle);return wrap;
}
const beforeC90Media=modelMedia,beforeC90Bind=bindModelMedia;
modelMedia=function(key,hero=false){return key==='circle-cage-1'?cage90Media(hero):beforeC90Media(key,hero)};
bindModelMedia=function(wrap){if(wrap.dataset.modelMedia==='circle-cage-1')wrap.replaceWith(cage90Media(wrap.classList.contains('gh-hero-media')));else beforeC90Bind(wrap)};
queueMicrotask(()=>{root.querySelectorAll('.gh-product').forEach(card=>{if(!card.querySelector('[data-detail="circle-cage-1"]'))return;const img=card.querySelector('img');if(img)img.replaceWith(cage90Media())})});
