"""Blender: eight independent, UV-mapped 20 cm slabs. Never alters existing arenas."""
import bpy,json,pathlib,sys,hashlib
root=pathlib.Path(__file__).resolve().parents[1];out=root/'public/sport-surfaces';catalog=json.loads((out/'catalog.json').read_text())
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.context.preferences.filepaths.save_version=0
def meshes(L,W):
 top={'id':'floor','label':'Nawierzchnia / warstwa górna','group':'floor','v':[[-L/2,0,-W/2],[L/2,0,-W/2],[L/2,0,W/2],[-L/2,0,W/2]],'f':[[0,2,1],[0,3,2]],'uv':[[0,0],[1,0],[1,1],[0,1]],'normals':[[0,1,0]]*4,'artwork':False}
 body={'id':'surface-body','label':'Nawierzchnia / krawędzie 20 cm','group':'surface-edge','v':[[-L/2,0,-W/2],[L/2,0,-W/2],[L/2,0,W/2],[-L/2,0,W/2],[-L/2,-.2,-W/2],[L/2,-.2,-W/2],[L/2,-.2,W/2],[-L/2,-.2,W/2]],'f':[[4,5,6],[4,6,7],[0,1,5],[0,5,4],[1,2,6],[1,6,5],[2,3,7],[2,7,6],[3,0,4],[3,4,7]],'uv':[[0,0]]*8,'artwork':False}
 return [top,body]
records=[]
for index,item in enumerate(catalog['items']):
 scene=bpy.context.scene if index==0 else bpy.data.scenes.new(item['id']);scene.name=item['id'];bpy.context.window.scene=scene;scene.unit_settings.system='METRIC';scene.unit_settings.scale_length=1
 data=meshes(item['length'],item['width']);(out/(item['id']+'.json')).write_text(json.dumps(data,separators=(',',':'))+'\n')
 # Runtime X/Y/Z-up conversion to Blender X/Y/Z-up; glTF export restores runtime axes.
 vertices=[(v[0],-v[2],v[1]) for v in data[1]['v']];faces=[(0,2,1),(0,3,2)]+[tuple(f) for f in data[1]['f']]
 mesh=bpy.data.meshes.new(item['id']);mesh.from_pydata(vertices,[],faces);mesh.update();obj=bpy.data.objects.new('SURFACE_'+item['id'],mesh);scene.collection.objects.link(obj)
 topmat=bpy.data.materials.new(item['id']+'_top');topmat.diffuse_color=tuple(int(item['base'][i:i+2],16)/255 for i in (1,3,5))+(1,)
 edge=bpy.data.materials.get('Neutral_edges') or bpy.data.materials.new('Neutral_edges');edge.diffuse_color=(.55,.58,.55,1);mesh.materials.append(topmat);mesh.materials.append(edge)
 uv=mesh.uv_layers.new(name='Surface_UV')
 for polygon in mesh.polygons:
  polygon.material_index=0 if polygon.index<2 else 1
  for li in polygon.loop_indices:
   vertex=mesh.vertices[mesh.loops[li].vertex_index].co;uv.data[li].uv=(vertex.x/item['length']+.5,-vertex.y/item['width']+.5)
 obj['surface_id']=item['id'];obj['thickness_m']=.2;obj['field_length_m']=item['fieldLength'];obj['field_width_m']=item['fieldWidth'];obj['role']='INDEPENDENT_SPORT_SURFACE'
 bpy.ops.object.select_all(action='DESELECT');obj.select_set(True);bpy.context.view_layer.objects.active=obj
 bpy.ops.export_scene.gltf(filepath=str(out/(item['id']+'.glb')),export_format='GLB',use_selection=True,use_active_scene=True,export_yup=True,export_apply=True,export_materials='EXPORT')
 records.append({'id':item['id'],'dimensions':[item['length'],item['width'],.2],'area':item['length']*item['width'],'files':{suffix:hashlib.sha256((out/(item['id']+'.'+suffix)).read_bytes()).hexdigest() for suffix in ['json','glb']}})
bpy.context.window.scene=bpy.data.scenes[catalog['items'][0]['id']]
bpy.ops.wm.save_as_mainfile(filepath=str(out/'sport-surfaces-20cm.blend'))
manifest={'schema':'GF-SPORT-SURFACE-MODELS-1','units':'m','thickness':.2,'catalogHash':hashlib.sha256((out/'catalog.json').read_bytes()).hexdigest(),'blendHash':hashlib.sha256((out/'sport-surfaces-20cm.blend').read_bytes()).hexdigest(),'models':records}
(out/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print('EXPORTED_SURFACES',len(records))
