export const RAW='https://raw.githubusercontent.com/DamianRyh/gamefields-os/main/';
const old=(id,label,source,parts)=>({id,label,kind:'source',source:RAW+source,parts});
export const FAMILIES={
 'street-field':{id:'street-field',label:'Panna Grid',kind:'rectangle',long:'sf-long',short:'sf-short',goal:'sf-goal',entry:'sf-entry',post:'sf-post',pitchL:1.6025,pitchW:1.6146666666666667,height:1.091},
 octagon:{id:'octagon',label:'Panna Octa',kind:'octagon',standard:'oct-standard',goal:'oct-goal',entry:'oct-entry',post:'oct-post',height:1.218},
 'circle-cage':{id:'circle-cage',label:'Panna Cage 90 / 180',kind:'circle',standard:'cc-standard',goal:'cc-goal',entry:'cc-entry',upper:'cc-upper-entry',height:.9},
 p1:old('p1','Panna Court','public/models/gamefields/source/boisko-p1.glb',['k1','k2','k3','k4','s1']),
 o1:old('o1','Panna Play','public/models/gamefields/source/panna-kids-o1.glb',['po1','po2','po3']),
 w1:old('w1','Panna Ring','public/models/gamefields/source/boisko-w1.glb',['rw1','rw2','st1','e1']),
 street15:old('street15','Street Arena 15','public/products/street-football-15x10/boisko-15x10.glb',[])
};
export function partIds(f){return [...new Set(['long','short','standard','goal','entry','post','upper'].map(k=>f[k]).filter(Boolean))].concat(f.parts||[])}
export function normalize(value={}){
 if(!value||typeof value!=='object'||Array.isArray(value))throw Error('Nieprawidłowy projekt');
 const family=value.family||'street-field',f=Object.hasOwn(FAMILIES,family)?FAMILIES[family]:null;if(!f)throw Error('Nieznana rodzina konstrukcji');
 const integer=(key,def,min,max)=>{const v=value[key]??def;if(!Number.isInteger(v)||v<min||v>max)throw Error('Niedozwolona wartość: '+key);return v};
 if(value.instances||value.assets||value.url||value.scale)throw Error('Projekt może zawierać tylko części wybranej rodziny');
 const mode=value.mode||'assembly';if(!['assembly','part'].includes(mode))throw Error('Nieznany tryb');
 const part=value.part||partIds(f)[0]||'';if(mode==='part'&&!part)throw Error('Brak osobnych komponentów tej konstrukcji');if(part&&!partIds(f).includes(part))throw Error('Część nie należy do wybranej rodziny');
 const color=value.color||'#30363c';if(!/^#[0-9a-f]{6}$/i.test(color))throw Error('Nieprawidłowy kolor');
 const config={schema:'GF-OWNED-ASSEMBLY-1',family,mode,part,color,long:integer('long',4,2,10),short:integer('short',3,2,8),goals:integer('goals',2,0,2),entries:integer('entries',1,0,2),levels:integer('levels',1,1,2)};
 if(f.kind!=='circle'&&config.levels!==1)throw Error('Ta rodzina nie ma wariantu piętrowego');
 return config;
}
export function assetUrl(id){return id.startsWith('sf-')||id.startsWith('oct-')||id.startsWith('cc-')?'./assets/'+id+'.glb':RAW+'public/models/gamefields/components/'+id+'.glb'}
export function assemble(value){
 const c=normalize(value),f=FAMILIES[c.family],instances=[];const add=(asset,x=0,z=0,angle=0,y=0)=>instances.push({id:'I'+(instances.length+1),family:c.family,asset,url:assetUrl(asset),position:[x,y,z],rotationY:-angle,scale:[1,1,1]});
 if(c.mode==='part'){add(c.part);return {config:c,instances,floor:null}}
 if(f.kind==='source')return {config:c,instances:[{id:'SOURCE',family:c.family,asset:c.family,url:f.source,position:[0,0,0],rotationY:0,scale:[1,1,1]}],floor:null};
 if(f.kind==='rectangle'){
  const px=c.long*f.pitchL/2,py=c.short*f.pitchW/2;
  for(const s of [-1,1]){
   for(let i=0;i<c.long;i++)add(i===Math.floor((c.long-1)/2)&&(s===-1?c.entries>=1:c.entries===2)?f.entry:f.long,-px+(i+.5)*f.pitchL,-s*(py-.073),s===1?0:Math.PI);
   for(let i=0;i<c.short;i++)add(i===Math.floor((c.short-1)/2)&&(s===-1?c.goals>=1:c.goals===2)?f.goal:f.short,s*(px-.073),-(-py+(i+.5)*f.pitchW),s===1?-Math.PI/2:Math.PI/2);
  }
  for(const y of [-py,py])for(let i=0;i<=c.long;i++)add(f.post,-px+i*f.pitchL,-y);
  for(const x of [-px,px])for(let i=1;i<c.short;i++)add(f.post,x,-(-py+i*f.pitchW));
  return {config:c,instances,floor:{kind:'rectangle',x:2*px+.9,z:2*py+.46,depth:.2},dimensions:[2*px-.196,2*py-.196]};
 }
 for(let i=0;i<8;i++){
  const goal=i===0&&c.goals>=1||i===4&&c.goals===2,entry=i===2&&c.entries>=1||i===6&&c.entries===2;
  const a=i*Math.PI/4;
  if(f.kind==='circle'){
   add(goal?f.goal:entry?f.entry:f.standard,0,0,a);
   if(c.levels===2)add(entry?f.upper:f.standard,0,0,a,.9);
  }else{
   add(goal?f.goal:entry?f.entry:f.standard,2.506*Math.cos(a),-2.506*Math.sin(a),a-Math.PI/2);
   const r=2.579/Math.cos(Math.PI/8),p=a+Math.PI/8;add(f.post,r*Math.cos(p),-r*Math.sin(p));
  }
 }
 return {config:c,instances,floor:{kind:f.kind,radius:f.kind==='circle'?3.55:3/Math.cos(Math.PI/8),depth:.2},dimensions:[f.kind==='circle'?6:4.962,f.kind==='circle'?6:4.962]};
}
export function bom(plan){const rows=new Map();for(const i of plan.instances){const row=rows.get(i.asset)||{component:i.asset,family:i.family,quantity:0,source:i.url};row.quantity++;rows.set(i.asset,row)}return [...rows.values()]}
