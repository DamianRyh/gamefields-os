import assert from 'node:assert/strict';
import {test} from 'node:test';
import {goalPanelMeshes,goalPanelBounds,isGoalPanelPart} from '../lib/goal-panel-focus.mjs';

const mesh=(label,x)=>({label,v:[[x,0,0],[x+1,1.416,1]]});
const scene=[mesh('PO2 0 -1 blacha',-2),mesh('PO2 0 1 blacha',1),mesh('PO2 3.141592653589793 -1 blacha',-2),mesh('PO2 3.141592653589793 1 blacha',1),mesh('PO2 0 1 profil gorny',1),mesh('PO2 slup wysoki',0),mesh('PO3 0 blacha',0),mesh('BR1 1 0.046',0),mesh('PO1 0 0 blacha',0)];

test('only the four rising PO2 sheets are color-editable',()=>{
  assert.equal(goalPanelMeshes(scene).length,4);
  assert.equal(goalPanelMeshes(scene,'near').length,2);
  assert.equal(goalPanelMeshes(scene,'far').length,2);
  assert.equal(isGoalPanelPart(scene[4]),true);
  assert.equal(isGoalPanelPart(scene[5]),false);
});

test('focus bounds include the supporting profile but exclude the goal',()=>{
  assert.deepEqual(goalPanelBounds(scene,'near'),[[-2,0,0],[2,1.416,1]]);
  assert.equal(goalPanelBounds([mesh('BR1 1 0.046',0)]),null);
});
