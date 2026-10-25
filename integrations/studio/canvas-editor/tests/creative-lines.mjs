import assert from 'node:assert/strict';
import {creativeLineGeometry,decorativeLineStyles,creativeLineOptions} from '../lib/creative-lines.ts';
import {projectSchema} from '../lib/project.ts';
const base={id:'creative-test',name:'Test',sport:'Piłka nożna 3×3',length:15,width:10,surface:'EPDM',base:'#111111',zone:'#222222',outside:'#333333',lineColor:'#ffffff',lines:false,pattern:'organic',graphicOpacity:100,graphicScale:100,graphicRotation:0,scene:'day',objects:[]};
assert.equal(projectSchema.parse(base).decorativeLineStyle,undefined,'Legacy project must not acquire decoration');
assert.equal(creativeLineOptions.length,6);
assert.deepEqual(creativeLineGeometry(undefined),[]);
assert.deepEqual(creativeLineGeometry('none'),[]);
for(const height of [60,180,400,900,2400]){
 const signatures=new Set();
 for(const style of decorativeLineStyles.slice(1)){
  const strokes=creativeLineGeometry(style,height);
  assert(strokes.length>0);assert.deepEqual(strokes,creativeLineGeometry(style,height));
  signatures.add(JSON.stringify(strokes));
  for(const s of strokes){assert(s.path.startsWith('M'));assert(!/NaN|Infinity|undefined/.test(s.path));for(const [x,y]of s.points){assert(Number.isFinite(x)&&Number.isFinite(y));assert(x>=21&&x<=579);assert(y>=.035*height-.001&&y<=.965*height+.001);}}
  const project=projectSchema.parse({...base,decorativeLineStyle:style});
  assert.equal(project.lines,false,'Decoration must not enable sport markings');
  assert.equal(projectSchema.parse(JSON.parse(JSON.stringify(project))).decorativeLineStyle,style);
 }
 assert.equal(signatures.size,5,'Styles must produce distinct geometry');
}
assert.equal(projectSchema.safeParse({...base,decorativeLineStyle:'script'}).success,false);
assert.deepEqual(creativeLineGeometry('waves',NaN),creativeLineGeometry('waves',400));
console.log('PASS: five deterministic bounded decorative geometries, independent sports lines, strict enum and legacy/JSON compatibility.');
