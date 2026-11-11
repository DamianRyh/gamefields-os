import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFileSync} from 'node:fs';
import {isGoalPanelSheet,goalPanelBounds,goalPanelGroup} from '../lib/goal-panel-focus.mjs';

const mk=(label,group='panels')=>({label,group,v:[[0,0,0],[1,1.4,1]]});
const meshes=[mk('PO2L_east_sheet'),mk('PO2P_east_sheet'),mk('PO2L_west_sheet'),mk('PO2P_west_sheet'),mk('PO2L_east_frame','frame'),mk('PO3_east_sheet'),mk('BR1_east_frame','goals')];
test('goal-panel paint includes PO2 guards and the PO3 sheet over the goal',()=>{
 assert.equal(meshes.filter(isGoalPanelSheet).length,5);
 assert.equal(goalPanelGroup(meshes,'east').length,4);
 assert.equal(goalPanelGroup(meshes,'west').length,2);
 assert.equal(isGoalPanelSheet(meshes.at(-1)),false);
});
test('goal focus bounds include PO3 but exclude goal structure',()=>{
 assert.deepEqual(goalPanelBounds(meshes,'east'),[[0,0,0],[1,1.4,1]]);
 assert.equal(goalPanelBounds([mk('BR1_east_frame','goals')]),null);
});
test('published O1 v2 GLB contains four PO2 and two PO3 goal sheets',()=>{
 const bytes=readFileSync(new URL('../public/arenas/panna-play-o1-v2.glb',import.meta.url));
 const doc=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString());
 const sheets=doc.nodes.filter(node=>node.extras?.category==='sheet'&&/^(?:PO2[LP]|PO3)_(east|west)_sheet$/.test(node.extras?.cad_source));
 assert.equal(sheets.length,6);
 assert.deepEqual(new Set(sheets.map(node=>node.extras.cad_source.split('_')[1])),new Set(['east','west']));
});
