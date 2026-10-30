/* CAGE-HERO-3: native CAD render photographs; common four-colour product presentation. */
const cageHeroImages=__CAGE_IMAGES__;
const cageHeroLabels={'circle-cage-1':'Panna Cage 90','circle-cage-2':'Panna Cage 180'};
for(const key of Object.keys(cageHeroImages)){
 data.models[key]=cageHeroImages[key].gray;
 const detail=data.modelMedia[key]?.images?.at(-1);
 data.modelMedia[key]={poster:cageHeroImages[key].gray,images:coatOptions.map(([coat])=>({url:cageHeroImages[key][coat]})).concat(detail?[detail]:[]),videos:[]};
}
function cagePhotograph(key,hero=false){
 const label=cageHeroLabels[key],images=cageHeroImages[key];let colour=hero?heroColour:'gray',request=0,pinned=false;
 if(!images[colour])colour='gray';
 const wrap=node('div',{className:'gh-model-media is-color'+(hero?' gh-hero-media gh-colour-preview':'')});wrap.dataset.modelMedia=key;wrap.dataset.revision='CAGE-HERO-3';
 let img=node('img',{src:images[colour],alt:label+' — '+coatOptions.find(c=>c[0]===colour)[1]+', lakierowana rama i siatka',className:'gh-media-poster'+(hero?' gh-hero-image':'')});img.width=1920;img.height=1080;img.decoding='async';img.loading=hero?'eager':'lazy';wrap.append(img);
 const status=node('span',{className:'gh-visually-hidden'});status.setAttribute('role','status');wrap.append(status);
 const apply=async next=>{
  const token=++request;wrap.setAttribute('aria-busy','true');const image=new Image();image.src=images[next];
  try{await image.decode();if(token!==request)return;if(!wrap.isConnected)return;colour=next;if(hero)heroColour=next;image.className=img.className;image.width=1920;image.height=1080;image.decoding='async';image.alt=label+' — '+coatOptions.find(c=>c[0]===next)[1]+', lakierowana rama i siatka';img.replaceWith(image);img=image;status.textContent='';
   if(hero)buttons.forEach((b,i)=>{const active=coatOptions[i][0]===next;b.setAttribute('aria-checked',String(active));b.tabIndex=active?0:-1});
  }catch{if(token===request)status.textContent='Nie udało się zmienić koloru. Wybierz kolor ponownie.'}
  finally{if(token===request)wrap.removeAttribute('aria-busy')}
 };
 let buttons=[];
 if(hero){
  const group=node('div',{className:'gh-coat-options'});group.setAttribute('role','radiogroup');group.setAttribute('aria-label','Kolor boiska '+label);
  buttons=coatOptions.map(([coat,name,hex],index)=>{const b=node('button',{type:'button',className:'gh-coat-dot'});b.title=name;b.style.setProperty('--coat',hex);b.setAttribute('role','radio');b.setAttribute('aria-label',name);b.setAttribute('aria-checked',String(colour===coat));b.tabIndex=colour===coat?0:-1;b.addEventListener('click',()=>void apply(coat));b.addEventListener('keydown',e=>{let next=index;if(e.key==='ArrowRight')next=(index+1)%4;else if(e.key==='ArrowLeft')next=(index+3)%4;else if(e.key==='Home')next=0;else if(e.key==='End')next=3;else return;e.preventDefault();buttons[next].focus();void apply(coatOptions[next][0])});group.append(b);return b});wrap.append(group);
 }else{
  const button=node('button',{type:'button',className:'gh-media-toggle'},'Zobacz kolor ↗');button.setAttribute('aria-label',label+': pokaż kolor konstrukcji');button.setAttribute('aria-pressed','false');wrap.addEventListener('pointerenter',()=>void apply('green'));wrap.addEventListener('pointerleave',()=>void apply(pinned?'green':'gray'));wrap.addEventListener('focusin',()=>void apply('green'));wrap.addEventListener('focusout',e=>{if(!wrap.contains(e.relatedTarget))void apply(pinned?'green':'gray')});button.addEventListener('click',()=>{pinned=!pinned;button.setAttribute('aria-pressed',String(pinned));button.textContent=pinned?'Pokaż konstrukcję ↙':'Zobacz kolor ↗';void apply(pinned?'green':'gray')});wrap.append(button);
 }
 return wrap;
}
cage90Media=function(hero=false){return cagePhotograph('circle-cage-1',hero)};
cage180Media=function(hero=false){return cagePhotograph('circle-cage-2',hero)};
