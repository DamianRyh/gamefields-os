import assert from 'node:assert/strict';
import * as THREE from 'three';
import {GFBall} from '../lib/homepage-ball-core.mjs';
import {renderHomepagePoster} from '../lib/homepage-poster.mjs';
import {defaultStudioPrint,studioPrintSchema} from '../lib/studio-print.ts';
import {PRO_FAMILIES} from '../lib/court-art-pro.mjs';
import {inquirySummary} from '../lib/inquiry-summary.mjs';
import {shareProject} from '../lib/shared-project.ts';
const ball=GFBall.create(THREE,{detail:4});assert.equal(ball.panels.length,32);assert.equal(ball.panels.filter(p=>p.type==='pent').length,12);assert.equal(ball.panels.filter(p=>p.type==='hex').length,20);ball.mesh.geometry.dispose();ball.group.traverse(o=>{if(o instanceof THREE.Mesh){o.geometry.dispose();(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>m.dispose())}});
const d=defaultStudioPrint('poster');for(const f of PRO_FAMILIES)for(let v=1;v<=12;v++)for(const layout of ['gallery','bleed','type','match','side']){const svg=renderHomepagePoster({...d,fam:f.id,v,layout,title:'<script>alert(1)</script>'});assert(svg.includes('<svg'));assert(!svg.includes('<script>'));assert(!/NaN|undefined|Infinity/.test(svg));}
assert(!studioPrintSchema.safeParse({...d,paint:{32:'#ffffff'}}).success);assert(!studioPrintSchema.safeParse({...d,fam:'other'}).success);assert(!studioPrintSchema.safeParse({...d,colors:['url(evil)','#fff','#fff','#fff','#fff']}).success);
const p={id:'GF-PRIVATE',name:'Mój plakat',sport:'Piłka nożna 1×1',arenaModel:'o1',length:15,width:10,surface:'EPDM',base:'#000000',zone:'#111111',outside:'#222222',lineColor:'#ffffff',lines:true,pattern:'Organic Flow',patternFamily:'organic-flow',patternVariant:1,graphicOpacity:100,graphicScale:100,graphicRotation:0,scene:'day',objects:[],printDesign:{...d,title:'PRYWATNE',logo:'data:image/png;base64,AA=='}};
assert.equal(shareProject(p).printDesign,undefined);assert.equal(shareProject(p,true).printDesign.title,'PRYWATNE');const inquiry=JSON.parse(inquirySummary(p,null));assert.equal(inquiry.printDesign.logo,undefined);assert.equal(inquiry.printDesign.logoIncluded,true);assert.equal(inquiry.printDesign.unpriced,true);
console.log('PASS: reused homepage football 12 pentagons/20 hexagons, 960 poster combinations, safe text, strict print schema and privacy.');
