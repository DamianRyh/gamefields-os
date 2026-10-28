const p1Asset=suffix=>({"default":"https://www.gamefields.eu/wp-content/uploads/2026/10/Panna-Court-v6-—-konstrukcja-bez-podloza.webp","hover":"https://www.gamefields.eu/wp-content/uploads/2026/10/Panna-Court-v6-hover.webp","detail-corner-inside":"https://www.gamefields.eu/wp-content/uploads/2026/10/Panna-Court-v6-detail-corner-inside.webp","detail-corner":"https://www.gamefields.eu/wp-content/uploads/2026/10/Panna-Court-v6-detail-corner.webp","detail-goal":"https://www.gamefields.eu/wp-content/uploads/2026/10/Panna-Court-v6-detail-goal.webp"})[suffix];data.models.p1=p1Asset('default');data.modelMedia.p1={poster:data.models.p1,images:['default','hover','detail-corner-inside','detail-corner','detail-goal'].map(key=>({url:p1Asset(key)})),videos:[]};
function pannaCourtMedia(hero=false){
 const wrap=node('div',{className:'gh-model-media'+(hero?' gh-hero-media':'')});wrap.dataset.modelMedia='p1';
 const img=node('img',{src:p1Asset('default'),alt:'Panna Court — konstrukcja bez podłoża',className:'gh-media-poster'+(hero?' gh-hero-image':'')});img.decoding='async';
 const toggle=node('button',{type:'button',className:'gh-media-toggle'},'Drugi widok ↗');toggle.setAttribute('aria-label','Panna Court: przełącz widok');toggle.setAttribute('aria-pressed','false');let pinned=false;
 const show=on=>{img.src=p1Asset(on?'hover':'default');};wrap.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')show(true)});wrap.addEventListener('pointerleave',()=>show(pinned));toggle.addEventListener('focus',()=>show(true));toggle.addEventListener('blur',()=>show(pinned));toggle.addEventListener('click',()=>{pinned=!pinned;toggle.setAttribute('aria-pressed',String(pinned));show(pinned)});wrap.append(img,toggle);return wrap;
}

const originalModelMedia=modelMedia,originalBindModelMedia=bindModelMedia;
modelMedia=function(key,hero=false){return key==='p1'?pannaCourtMedia(hero):originalModelMedia(key,hero)};
bindModelMedia=function(wrap){if(wrap.dataset.modelMedia==='p1')wrap.replaceWith(pannaCourtMedia(wrap.classList.contains('gh-hero-media')));else originalBindModelMedia(wrap)};

