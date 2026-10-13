"""Blender batch extraction. Translation/rotation only: never rescale or decimate source meshes."""
import bpy, pathlib, json, math, hashlib, re, struct
from mathutils import Vector, Matrix
ROOT=pathlib.Path(__file__).resolve().parents[2]
BASE=ROOT/'assets/private/gamefields'
SELECTIONS={
 'boisko-p1.glb': {'k1':('K1_-1_0 ',),'k2':('K2_-1_-1 ',),'k3':('K3_-1_-1 ',),'k4':('K4_-1 ',),'s1':('=S1','=S1 stopa')},
 'panna-kids-o1.glb': {'po1':('PO1 0 0 ',),'po2':('PO2 0 -1 ',),'po3':('PO3 0 ',)},
 'boisko-w1.glb': {'rw1':('RW1 2 ',),'rw2':('RW2 bok lewy 0 ','RW2 nadproze 0 ','RW2 bok prawy 0 '),'st1':('=ST1 stopa 0','=ST1 lacznik 0'),'e1':('=E1 lacznik 0',)},
}
def points(objects):return [o.matrix_world@Vector(c) for o in objects for c in o.bound_box]
def bounds(objects):
 p=points(objects);lo=Vector(tuple(min(v[i] for v in p) for i in range(3)));hi=Vector(tuple(max(v[i] for v in p) for i in range(3)));return lo,hi
report={'schema':'GF-SOURCE-GLB-LIBRARY-1.0','measurementStatus':'MODEL_MEASURED_NOT_MANUFACTURING_CONFIRMED','engineeringApproval':'REQUIRED','sources':[],'components':[]}
for filename,selections in SELECTIONS.items():
 bpy.ops.wm.read_factory_settings(use_empty=True)
 path=BASE/'source'/filename
 raw=path.read_bytes();chunk_length=struct.unpack_from('<I',raw,12)[0];gltf=json.loads(raw[20:20+chunk_length]);metadata={n.get('name'):n.get('extras',{}) for n in gltf.get('nodes',[])}
 bpy.ops.import_scene.gltf(filepath=str(path))
 objects=[o for o in bpy.context.scene.objects if o.type=='MESH']
 lo,hi=bounds(objects)
 families={}
 for obj in objects:
  family=obj.name.split(' ')[0].split('_')[0].split('.')[0];families[family]=families.get(family,0)+1
 report['sources'].append({'id':path.stem,'file':f'source/{filename}','sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'meshCount':len(objects),'measuredBoundsM':{'x':hi.x-lo.x,'y':hi.y-lo.y,'z':hi.z-lo.z},'familyMeshCounts':families})
 for identifier,prefixes in selections.items():
  selected=[o for o in objects if any(o.name==p[1:] if p.startswith('=') else o.name.startswith(p) for p in prefixes)]
  if not selected:raise RuntimeError(f'No objects for {filename}:{identifier}')
  repeat=None
  if identifier=='k1':
   adjacent=[o for o in objects if o.name.startswith('K1_-1_1 ')]
   a,b=bounds(selected);c,d=bounds(adjacent)
   repeat={'pitchM':((a+b)/2-(c+d)/2).length,'status':'OBSERVED_SOURCE_PLACEMENT_NOT_APPROVED_CONNECTION','sourceGroupA':'K1_-1_0','sourceGroupB':'K1_-1_1'}
  original={o:o.matrix_world.copy() for o in selected}
  source_names=[o.name for o in selected]
  lo,hi=bounds(selected)
  rotate=Matrix.Rotation(-math.pi/2,4,'Z') if (hi.y-lo.y)>(hi.x-lo.x) else Matrix.Identity(4)
  for o in selected:o.matrix_world=rotate@o.matrix_world
  bpy.context.view_layer.update();lo,hi=bounds(selected)
  translate=Matrix.Translation(Vector((-(lo.x+hi.x)/2,-(lo.y+hi.y)/2,-lo.z)))
  for o in selected:o.matrix_world=translate@o.matrix_world
  bpy.context.view_layer.update();lo,hi=bounds(selected)
  bpy.ops.object.select_all(action='DESELECT')
  for o in selected:o.select_set(True)
  bpy.context.view_layer.objects.active=selected[0]
  target=BASE/'components'/f'{identifier}.glb'
  bpy.ops.export_scene.gltf(filepath=str(target),export_format='GLB',use_selection=True,export_yup=True,export_extras=True)
  exported=target.read_bytes();exported_json=json.loads(exported[20:20+struct.unpack_from('<I',exported,12)[0]])
  material_slots=[m.get('name',f'material-{i}') for i,m in enumerate(exported_json.get('materials',[]))]
  report['components'].append({'id':identifier.upper(),'assetKey':f'gamefields/measured/{identifier}','pbrMaterialSlots':material_slots,'file':f'components/{identifier}.glb','source':path.stem,'sourceNodeNames':source_names,'meshCount':len(selected),'measuredBoundsM':{'x':hi.x-lo.x,'y':hi.y-lo.y,'z':hi.z-lo.z},'normalization':'RIGID_ROTATION_TRANSLATION_ONLY','upAxis':'Y','origin':'BOTTOM_CENTER','scale':[1,1,1],'connectionPoints':None,'weightKg':None,'materialConfirmation':None,'costStatus':'UNPRICED','productionDimensionsStatus':'UNCONFIRMED','repeatStudy':repeat,'authoredMetadata':{name:metadata.get(name,{}) for name in source_names if metadata.get(name)}})
  for o,matrix in original.items():o.matrix_world=matrix
  bpy.context.view_layer.update()
(BASE/'library.json').write_text(json.dumps(report,indent=2,ensure_ascii=False))
print('EXTRACTION_COMPLETE',len(report['sources']),len(report['components']))
