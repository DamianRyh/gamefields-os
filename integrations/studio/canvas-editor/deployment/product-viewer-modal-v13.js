/* GF product-only 3D modal v13: Studio opens only after personalisation CTA. */
root.addEventListener('click',event=>{
 const button=event.target instanceof Element?event.target.closest('[data-open-3d],.gh-hero-mobile-3d'):null;if(!button||!root.contains(button))return;
 event.preventDefault();event.stopImmediatePropagation();
 const coat=['gray','red','blue','green'].includes(heroColour)?heroColour:'gray';
 open(data.names[model]+' — model 3D',button);
 const note=node('p',{className:'gh-load-status',role:'status'},'Wczytujemy podgląd konstrukcji…');
 const viewer=node('iframe',{className:'gh-frame gh-product-viewer-frame',title:data.names[model]+' — wizualizacja 3D',src:data.studio+'/product-viewer?'+new URLSearchParams({arena:model,coat})});frame=viewer;
 viewer.addEventListener('load',()=>{if(frame!==viewer)return;note.remove();clearTimeout(timeout)});
 const invite=node('div',{className:'gh-preview-invite'}),copy=node('div');copy.append(node('h3',{},'Nadaj mu swój charakter.'),node('p',{},'Dopasuj kolory, logo i detale konstrukcji w Studio.'));
 const cta=link('Personalizuj w Studio',data.studio+'/?'+new URLSearchParams({arena:model,coat}));cta.classList.add('gh-primary');invite.append(copy,cta);body.append(note,viewer,invite);
 timeout=setTimeout(()=>{if(frame===viewer&&dialog.open)note.textContent='Podgląd potrzebuje więcej czasu. Możesz też przejść do personalizacji w Studio.'},20000);
},true);
const ghProductModalStyle=document.createElement('style');ghProductModalStyle.textContent='.gh-frame.gh-product-viewer-frame{height:clamp(280px,52vh,560px);min-height:280px;border:0;background:#fff}.gh-preview-invite{display:flex;align-items:center;justify-content:space-between;gap:16px;margin-top:16px;padding:16px;border:1px solid var(--gh-line);border-radius:14px;background:#fbf9fa}.gh-preview-invite h3{font-size:22px;margin:0 0 5px}.gh-preview-invite p{font-size:15px;line-height:1.5;margin:0;color:var(--gh-muted)}.gh-preview-invite>a{white-space:nowrap}@media(max-width:760px){.gh-frame.gh-product-viewer-frame{height:clamp(260px,42vh,400px)}.gh-preview-invite{flex-direction:column;align-items:stretch}.gh-preview-invite>a{justify-content:center;width:100%}}';document.head.append(ghProductModalStyle);
