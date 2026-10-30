"""Build editable Blender master and separately tessellated web LOD from the same CAD parts."""
import bpy,math,json,hashlib,os,sys
from pathlib import Path
from mathutils import Vector,Matrix
OUT=Path(__file__).resolve().parent;ROOT=OUT.parents[1];PUBLIC=ROOT/'public/arenas'
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene;scene.unit_settings.system='METRIC';bpy.context.preferences.filepaths.save_version=0
master=json.loads((OUT/'cad-parts.json').read_text());web=json.loads((OUT/'web-parts.json').read_text())
source_floor=OUT/'source-surface.json'
if source_floor.exists():floor_data=json.loads(source_floor.read_text())
else:
 old=json.loads((PUBLIC/'circle-cage-1.json').read_text());floor_data=next(m for m in old if m['group']=='floor')
def linear(c):return c/12.92 if c<.04045 else ((c+.055)/1.055)**2.4
def mat(name,color,metal,rough):
 m=bpy.data.materials.new(name);m.use_nodes=True;rgb=[linear(int(color[i:i+2],16)/255)for i in [1,3,5]];m.diffuse_color=(*rgb,1);p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=m.diffuse_color;p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough;return m
mats={'frame':mat('Rama — lakier proszkowy','#30363c',.15,.45),'panels':mat('Siatka — kolor edytowalny','#7c8584',.2,.46),'goals':mat('Bramki — metal lakierowany','#bcc4c7',.55,.32),'floor':mat('Nawierzchnia — niezależne 20 cm','#d8dcd9',0,.85)}
structure=bpy.data.collections.new('Konstrukcja — CAD r2');scene.collection.children.link(structure)
floors=bpy.data.collections.new('Nawierzchnia — oddzielna');scene.collection.children.link(floors)
objects=[]
def create_mesh(name,part,rot):
 me=bpy.data.meshes.new(name);matrix=Matrix.Rotation(rot,4,'Z');v=[tuple(matrix@Vector(p))for p in part['v']];qv=[Vector(tuple(round(x,5)for x in p))for p in v];faces=[f for f in part['f']if len(set(tuple(qv[i])for i in f))==3 and (qv[f[1]]-qv[f[0]]).cross(qv[f[2]]-qv[f[0]]).length>1e-12];me.from_pydata(v,[],faces);me.update();me.use_auto_smooth=True;me.auto_smooth_angle=math.radians(45)
 for p in me.polygons:p.use_smooth=True
 return me
for i in range(8):
 kind='Panel 03' if i==1 else 'Panel 02' if i in [0,4] else 'Panel 01'
 for p in master:
  if p['module']!=kind:continue
  group=p['group'];name=f'c90-r2-s{i+1:02d}-'+p['name'].replace(' ','-').lower();me=create_mesh(name,p,i*math.pi/4);o=bpy.data.objects.new(name,me);structure.objects.link(o);me.materials.append(mats[group]);o['group']=group;o['source_drawing']=p['source'];o['module']=kind;o['sector']=i+1;o['revision']='C90-CAD-2';objects.append(o)
fme=bpy.data.meshes.new('Nawierzchnia 20 cm');fme.from_pydata([(x,-z,y)for x,y,z in floor_data['v']],[],floor_data['f']);fme.update();fo=bpy.data.objects.new('floor',fme);floors.objects.link(fo);fme.materials.append(mats['floor']);fo['group']='floor';fo['thickness_m']=.2
uv=fme.uv_layers.new(name='UVMap')
for poly in fme.polygons:
 for li in poly.loop_indices:uv.data[li].uv=floor_data['uv'][fme.loops[li].vertex_index]
# The saved master retains the more detailed CAD tessellation.
scene['Product']='Panna Cage 90';scene['Revision']='C90-CAD-2';scene['Scope']='Source-derived visual model; CAD assumptions are listed in cad-validation.json'
def select(obs):
 bpy.ops.object.select_all(action='DESELECT')
 for o in obs:o.select_set(True)
 bpy.context.view_layer.objects.active=obs[0]
# Swap only mesh data for the web export; leave the saved Blender master detailed.
master_data={o.name:o.data for o in objects}
for o in objects:
 p=next(p for p in web if p['module']==o['module'] and p['group']==o['group'] and ('sleeves' in p['name'])==('sleeves' in o.name))
 o.data=create_mesh(o.name+' web',p,(o['sector']-1)*math.pi/4);o.data.materials.append(mats[o['group']])
# Explicit smooth vertex normals and local panel UVs keep lighting and artwork configurable.
meshes=[]
for o in objects:
 me=o.data;uv=me.uv_layers.new(name='UVMap')
 for poly in me.polygons:
  for li in poly.loop_indices:
   p=me.vertices[me.loops[li].vertex_index].co;angle=math.atan2(p.y,p.x)-(o['sector']-1)*math.pi/4;angle=(angle+math.pi)%(2*math.pi)-math.pi;uv.data[li].uv=((angle+math.pi/8)/(math.pi/4),p.z/.9)
 me.calc_normals_split();me.calc_loop_triangles();uv=me.uv_layers.active;v=[];n=[];u=[];f=[];lookup={}
 for tri in me.loop_triangles:
  face=[]
  for li in tri.loops:
   loop=me.loops[li];x,y,z=tuple(me.vertices[loop.vertex_index].co);nx,ny,nz=tuple(loop.normal)
   angle=math.atan2(y,x)-(o['sector']-1)*math.pi/4;angle=(angle+math.pi)%(2*math.pi)-math.pi;u0=(angle+math.pi/8)/(math.pi/4);u1=z/.9
   uv.data[li].uv=(u0,u1);key=tuple(round(q,6)for q in [x,z,-y,nx,nz,-ny,u0,u1]);assert all(math.isfinite(q)for q in key),'Nonfinite mesh attribute'

   if key not in lookup:lookup[key]=len(v);v.append(list(key[:3]));n.append([round(x,5)for x in key[3:6]]);u.append([round(x,4)for x in key[6:]])
   face.append(lookup[key])
  if len(set(face))==3:f.append(face)
 meshes.append({'id':o.name,'label':o.name,'group':o['group'],'v':v,'normals':n,'f':f,'uv':u,'artwork':o['group']=='panels','sourceModule':o['module'],'sector':o['sector']})
assert max(v[1]for m in meshes for v in m['v'])<=.90001,'Unexpected model height'
select(objects);bpy.ops.export_scene.gltf(filepath=str(OUT/'panna-cage-90-v2.glb'),export_format='GLB',use_selection=True,export_extras=True,export_apply=True)
select([fo]);bpy.ops.export_scene.gltf(filepath=str(OUT/'panna-cage-90-surface-20cm.glb'),export_format='GLB',use_selection=True)
def compact(value,digits):
 n=round(value,digits);return int(n)if n==int(n)else n
for m in meshes:
 m['v']=[[compact(n,5)for n in p]for p in m['v']]
 m['normals']=[[compact(n,4)for n in p]for p in m['normals']]
 m['uv']=[[compact(n,3)for n in p]for p in m['uv']]
(OUT/'studio-mesh.json').write_text(json.dumps(meshes+[floor_data],separators=(',',':'),allow_nan=False)+'\n')
for o in objects:o.data=master_data[o.name]
# White product photography rig, excluded from GLB exports.
rig=bpy.data.collections.new('Studio — kamery i oświetlenie');scene.collection.children.link(rig)
def move_to_rig(o):
 for c in list(o.users_collection):c.objects.unlink(o)
 rig.objects.link(o)
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.014));ground=bpy.context.object;ground.name='Tło renderu — nie jest częścią produktu';move_to_rig(ground);ground.data.materials.append(mat('Biel studia','#ffffff',0,.85))
for loc,power,size in [((0,-3,8),1700,7),((5,3,6),1100,6),((-5,2,4),700,5)]:
 bpy.ops.object.light_add(type='AREA',location=loc);light=bpy.context.object;move_to_rig(light);light.data.energy=power;light.data.size=size;light.rotation_euler=(Vector((0,0,.4))-light.location).to_track_quat('-Z','Y').to_euler()
scene.world.color=(.7,.7,.7);scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.75,.75,.75,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.65
bpy.ops.object.camera_add(location=(8,-10,7));camera=bpy.context.object;move_to_rig(camera);camera.rotation_euler=(Vector((0,0,.35))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.type='ORTHO';camera.data.ortho_scale=8.4;scene.camera=camera
scene.render.engine='CYCLES';scene.cycles.samples=40;scene.cycles.use_denoising=True;scene.render.resolution_x=1400;scene.render.resolution_y=1000;scene.render.resolution_percentage=100;scene.render.image_settings.file_format='PNG';scene.render.film_transparent=False;scene.view_settings.view_transform='Filmic';scene.view_settings.look='Medium High Contrast'
fo.hide_render=True;fo.hide_viewport=True
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/'panna-cage-90-v2.blend'),compress=True)
report={'product':'Panna Cage 90','revision':'C90-CAD-2','CADTriangles':sum(len(p['f'])*(5 if p['module']=='Panel 01' else 2 if p['module']=='Panel 02' else 1)for p in master),'webTriangles':sum(len(m['f'])for m in meshes),'webMeshes':len(meshes),'modules':{'Panel 01':5,'Panel 02':2,'Panel 03':1},'surfaceUnchanged':True,'floorIndependent':True,'files':{}}
for file in ['panna-cage-90-v2.FCStd','panna-cage-90-v2.step','panna-cage-90-v2.blend','panna-cage-90-v2.glb','panna-cage-90-surface-20cm.glb','studio-mesh.json']:
 p=OUT/file;report['files'][file]={'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}
(OUT/'validation.json').write_text(json.dumps(report,indent=2));print('CAGE90_EXPORT_READY',json.dumps(report),flush=True)
if os.environ.get('CAGE_SKIP_RENDER')=='1':sys.exit(0)
for name,color in [('default','#7c8584'),('hover','#b90f35')]:
 m=mats['panels'];m.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=(*[linear(int(color[i:i+2],16)/255)for i in [1,3,5]],1);scene.render.filepath=str(OUT/(name+'.png'));bpy.ops.render.render(write_still=True);print('RENDER_READY',name,flush=True)
camera.location=(4.6,-3.9,2.3);camera.rotation_euler=(Vector((2.6,-.3,.35))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.ortho_scale=2.9;scene.render.filepath=str(OUT/'detail-goal.png');bpy.ops.render.render(write_still=True);print('RENDER_READY goal',flush=True)
