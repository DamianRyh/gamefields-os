(function(){document.querySelectorAll('[data-gf-lead]').forEach(root=>{
 if(root.dataset.enhanced)return;root.dataset.enhanced='true';
 const steps=Array.from(root.querySelectorAll('[data-gf-step]')),tabs=Array.from(root.querySelectorAll('[data-gf-go]'));let active=0;
 function go(n,focus=true){active=Math.max(0,Math.min(steps.length-1,n));steps.forEach((step,i)=>{step.hidden=i!==active});tabs.forEach((tab,i)=>{if(i===active)tab.setAttribute('aria-current','step');else tab.removeAttribute('aria-current')});if(focus){const legend=steps[active].querySelector('legend');legend.tabIndex=-1;legend.focus()}}
 root.addEventListener('click',event=>{const button=event.target.closest('button');if(!button)return;if(button.hasAttribute('data-gf-next'))go(active+1);else if(button.hasAttribute('data-gf-prev'))go(active-1);else if(button.hasAttribute('data-gf-go'))go(Number(button.dataset.gfGo))});
 root.closest('.wpcf7')?.addEventListener('wpcf7invalid',()=>{const invalid=root.querySelector('.wpcf7-not-valid');if(invalid){go(steps.findIndex(step=>step.contains(invalid)),false);invalid.focus()}});
 go(0,false);
})})();
