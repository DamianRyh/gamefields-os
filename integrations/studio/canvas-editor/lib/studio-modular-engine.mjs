// Studio layout v2: source components stay at scale 1:1. Historical OS engine is frozen.
import {assemble as legacyAssemble,normalize,FAMILIES,bom} from './vendor/owned-modular/engine.mjs';
export {normalize,FAMILIES,bom};
export function assemble(value){
 const plan=legacyAssemble(value);
 if(!['street-field','octagon','circle-cage'].includes(plan.config.family))throw Error('Ta rodzina nie ma układu modułowego Studio.');
 return {...plan,instances:plan.instances.map(i=>({...i,rotationY:plan.config.family==='octagon'||['sf-short','sf-goal'].includes(i.asset)?-i.rotationY:i.rotationY}))};
}
