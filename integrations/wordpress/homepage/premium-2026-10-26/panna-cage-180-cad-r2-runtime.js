/* Panna Cage 180 — unified CAD r2 product imagery */
const c180Assets={default:"https://www.gamefields.eu/wp-content/uploads/2026/10/Panna-Cage-180-CAD-r2-default.webp",hover:"https://www.gamefields.eu/wp-content/uploads/2026/10/Panna-Cage-180-CAD-r2-hover.webp",detail:"https://www.gamefields.eu/wp-content/uploads/2026/10/Panna-Cage-180-CAD-r2-detail-goal.webp"};
data.models['circle-cage-2']=c180Assets.default;
data.modelMedia['circle-cage-2']={poster:c180Assets.default,images:[{url:c180Assets.default},{url:c180Assets.hover},{url:c180Assets.detail}],videos:[]};
function cage180Media(hero=false){
 const wrap=node('div',{className:'gh-model-media'+(hero?' gh-hero-media':'')});wrap.dataset.modelMedia='circle-cage-2';wrap.dataset.revision='C180-CAD-2';
 const img=node('img',{src:c180Assets.default,alt:'Panna Cage 180 — konstrukcja CAD r2, siatka i stalowe profile',className:'gh-media-poster'+(hero?' gh-hero-image':'')});img.decoding='async';img.loading=hero?'eager':'lazy';img.width=1400;img.height=1000;
 const toggle=node('button',{type:'button',className:'gh-media-toggle'},'Zobacz kolor ↗');toggle.dataset.modelMediaToggle='';toggle.setAttribute('aria-label','Panna Cage 180: pokaż kolor konstrukcji');toggle.setAttribute('aria-pressed','false');let pinned=false;
 const show=active=>{img.src=active?c180Assets.hover:c180Assets.default;wrap.classList.toggle('is-color',active);toggle.textContent=active?'Pokaż konstrukcję ↙':'Zobacz kolor ↗';toggle.setAttribute('aria-pressed',String(pinned))};
 wrap.addEventListener('pointerenter',()=>show(true));wrap.addEventListener('pointerleave',()=>show(pinned));wrap.addEventListener('focusin',()=>show(true));wrap.addEventListener('focusout',e=>{if(!wrap.contains(e.relatedTarget))show(pinned)});
 toggle.addEventListener('click',()=>{pinned=!pinned;show(pinned)});wrap.append(img,toggle);return wrap;
}
const beforeC180Media=modelMedia,beforeC180Bind=bindModelMedia;
modelMedia=function(key,hero=false){return key==='circle-cage-2'?cage180Media(hero):beforeC180Media(key,hero)};
bindModelMedia=function(wrap){if(wrap.dataset.modelMedia==='circle-cage-2')wrap.replaceWith(cage180Media(wrap.classList.contains('gh-hero-media')));else beforeC180Bind(wrap)};
queueMicrotask(()=>{root.querySelectorAll('.gh-product').forEach(card=>{if(!card.querySelector('[data-detail="circle-cage-2"]'))return;const img=card.querySelector('img');if(img)img.replaceWith(cage180Media())})});
