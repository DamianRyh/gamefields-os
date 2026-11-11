function constructionDetail(){
 let detailColour="gray"; const key="detail";
 const wrap=node('div',{className:'gh-model-media gh-construction-detail gh-colour-preview is-color'});wrap.dataset.constructionDetail='';
 const label='Detal konstrukcji — od zewnątrz';
 const source=colour=>'https://gamefields-studio.ryhfs90.chatgpt.site/product-presentation/v5/'+'corner-'+colour+'.webp';
 const img=node('img',{src:source(detailColour),alt:label+' — '+coatOptions.find(c=>c[0]===detailColour)[1]+', perforowane panele i rama',className:'gh-media-poster'});img.decoding='async';img.loading='lazy';
 const choices=node('div',{className:'gh-coat-options'});choices.setAttribute('role','radiogroup');choices.setAttribute('aria-label','Kolor konstrukcji');
 let request=0;
 const select=async colour=>{const token=++request;const preload=new Image();preload.src=source(colour);wrap.setAttribute('aria-busy','true');try{await preload.decode();if(token!==request||!wrap.isConnected)return;detailColour=colour;img.src=preload.src;img.alt=label+' — '+coatOptions.find(c=>c[0]===colour)[1]+', perforowane panele i rama';buttons.forEach((button,i)=>{const active=coatOptions[i][0]===colour;button.setAttribute('aria-checked',String(active));button.tabIndex=active?0:-1});}catch(e){/* Keep the last loaded product visible. */}finally{if(token===request)wrap.removeAttribute('aria-busy')}};
 const buttons=coatOptions.map(([colour,name,hex],index)=>{const button=node('button',{type:'button',className:'gh-coat-dot'});button.title=name;button.setAttribute('role','radio');button.setAttribute('aria-label',name);button.setAttribute('aria-checked',String(colour===detailColour));button.tabIndex=colour===detailColour?0:-1;button.style.setProperty('--coat',key==='p1'&&colour==='red'?'#C81726':hex);button.addEventListener('click',()=>select(colour));button.addEventListener('keydown',event=>{let next=index;if(['ArrowRight','ArrowDown'].includes(event.key))next=(index+1)%4;else if(['ArrowLeft','ArrowUp'].includes(event.key))next=(index+3)%4;else if(event.key==='Home')next=0;else if(event.key==='End')next=3;else return;event.preventDefault();buttons[next].focus();select(coatOptions[next][0])});choices.append(button);return button});
 wrap.append(img,choices);return wrap;
}
const constructionCard=root.querySelector('.gh-category-grid article [data-model-media="p1"]');
if(constructionCard)constructionCard.replaceWith(constructionDetail());
const detailStyle=document.createElement('style');detailStyle.textContent='.gh-category-grid .gh-construction-detail{width:100%;height:auto!important;aspect-ratio:16/9;overflow:hidden;background:#fff}.gh-category-grid .gh-construction-detail img{width:100%;height:100%!important;object-fit:contain}.gh-construction-detail .gh-coat-options{bottom:8px;right:8px}';document.head.append(detailStyle);
