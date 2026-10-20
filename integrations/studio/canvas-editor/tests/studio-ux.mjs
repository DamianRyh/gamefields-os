import assert from 'node:assert/strict';
import {isSignaturePresetActive,nextProjectName} from '../lib/studio-ux.mjs';

const preset={familyId:'organic-flow',variant:6,paletteId:'court-culture'};
const palette={colors:['#000000','#AABBCC','#222222','#333333','#DDEEFF']};
const project={patternFamily:'organic-flow',patternVariant:6,patternPalette:'court-culture',base:'#ddeeff',zone:'#aabbcc'};
assert.equal(isSignaturePresetActive(project,preset,palette),true,'Hex case does not change the selected preset');
for(const patch of [{patternFamily:'mono'},{patternVariant:2},{patternPalette:'miami'},{base:'#000000'},{zone:'#000000'}]){
 assert.equal(isSignaturePresetActive({...project,...patch},preset,palette),false,JSON.stringify(patch));
}
assert.equal(isSignaturePresetActive({...project,patternVariant:undefined},{...preset,variant:1},palette),true,'Missing variant defaults to 1');
assert.equal(isSignaturePresetActive(project,preset,{colors:[]}),false,'Incomplete palette cannot match');

assert.equal(nextProjectName('Panna Grid — projekt','Panna Grid','Panna Octa'),'Panna Octa — projekt');
for(const dimensions of ['6.214 × 4.648 m','6,214 × 4,648 m','Ø 6 m']){
 assert.equal(nextProjectName(`Panna Grid · ${dimensions} — projekt`,'Panna Grid','Panna Octa'),'Panna Octa — projekt');
}
for(const name of ['Boisko szkoły','Panna Grid — projekt szkoły','Panna Grid · ulubiony — projekt','Panna Grid — projekt ','Inny model — projekt']){
 assert.equal(nextProjectName(name,'Panna Grid','Panna Octa'),name,'Custom title preserved exactly');
}
assert.equal(nextProjectName('   ','Panna Grid','Panna Octa'),'Panna Octa — projekt');
assert.equal(nextProjectName('','Panna Grid','Panna Octa'),'Panna Octa — projekt');
console.log('PASS: exact signature state including custom colours; safe automatic-title changes and preserved custom names.');
