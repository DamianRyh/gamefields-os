import bpy,math,os,json,hashlib
from mathutils import Vector
OUT=os.path.dirname(os.path.abspath(__file__))
scene=bpy.context.scene
templates={c.name:list(c.objects) for c in bpy.data.collections if c.name in ['Panel 01','Panel 02','Panel 03']}
assert all(templates.get(k) for k in ['Panel 01','Panel 02','Panel 03'])
structure=bpy.data.collections.new('Konstrukcja Panna Circle Cage 1.0');scene.collection.children.link(structure)
count={'Panel 01':0,'Panel 02':0,'Panel 03':0}
for level in [0]:
 for i in range(8):
  kind='Panel 03' if i==1 else 'Panel 02' if level==0 and i in [0,4] else 'Panel 01'
  count[kind]+=1
  for template in templates[kind]:
   o=template.copy();o.data=template.data.copy();structure.objects.link(o)
   o.name=f'{kind} L{level+1} S{i+1} '+('bramka' if 'bramka' in template.name else 'siatka' if 'siatka' in template.name else 'rama')
   o.location=(0,0,0);o.rotation_euler=(0,0,i*math.pi/4)
   if level==1:
    for v in o.data.vertices:v.co.z=1.8-v.co.z if kind=='Panel 03' else v.co.z+.9
    if kind=='Panel 03':
     import bmesh
     bm=bmesh.new();bm.from_mesh(o.data);bmesh.ops.reverse_faces(bm,faces=list(bm.faces));bm.to_mesh(o.data);bm.free()
   o['source_module']=kind;o['level']=level+1;o['sector']=i+1
for objects in templates.values():
 for o in objects:bpy.data.objects.remove(o,do_unlink=True)
assert count=={'Panel 01':5,'Panel 02':2,'Panel 03':1}
bpy.ops.mesh.primitive_cylinder_add(vertices=128,radius=3,depth=.2,location=(0,0,-.1))
floor=bpy.context.object;floor.name='Nawierzchnia';floor['group']='floor'
mat=bpy.data.materials.new('Nawierzchnia - baza');mat.use_nodes=True;mat.diffuse_color=(.42,.46,.41,1);mat.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value=mat.diffuse_color;floor.data.materials.append(mat)
uv=floor.data.uv_layers.active
for poly in floor.data.polygons:
 for li in poly.loop_indices:
  v=floor.data.vertices[floor.data.loops[li].vertex_index].co;uv.data[li].uv=((v.x+3)/6,(v.y+3)/6)
scene['Project']='Panna Circle Cage 1.0';scene['SourceAssembly']='PNG0005-00-00-000, Boisko 03, 28.11.2023';scene['AssemblyCounts']=json.dumps(count)
bpy.context.preferences.filepaths.save_version=0
bpy.ops.object.select_all(action='SELECT')
bpy.ops.wm.save_as_mainfile(filepath=OUT+'/panna-circle-cage-1.blend',compress=True)
bpy.ops.export_scene.gltf(filepath=OUT+'/panna-circle-cage-1.glb',export_format='GLB')
meshes=[]
for o in scene.objects:
 if o.type!='MESH':continue
 o.data.calc_loop_triangles();v=[tuple(o.matrix_world@vert.co) for vert in o.data.vertices];v=[(x,z,-y) for x,y,z in v]
 group='floor' if o==floor else 'goals' if 'bramka' in o.name else 'panels' if 'siatka' in o.name else 'frame'
 uvs=[[0,0] for _ in v]
 if group=='panels':
  zbase=.9 if o.get('level')==2 else 0
  uvs=[[(math.atan2(p.co.y,p.co.x)+math.pi/8)/(math.pi/4),(p.co.z-zbase)/.9] for p in o.data.vertices]
 if o.data.uv_layers.active:
  for loop in o.data.loops:uvs[loop.vertex_index]=list(o.data.uv_layers.active.data[loop.index].uv)
 meshes.append({'id':'floor' if o==floor else o.name.replace(' ','-'),'label':o.name,'group':group,'v':[[round(c,6) for c in p] for p in v],'f':[list(t.vertices) for t in o.data.loop_triangles],'uv':uvs,'artwork':False})
with open(OUT+'/studio-mesh.json','w') as f:json.dump(meshes,f,separators=(',',':'))
report={'name':'Panna Circle Cage 1.0','status':'ASSEMBLED_FROM_SOURCE','assembly':'Boisko 03 28112023 (1).pdf','moduleCounts':count,'diameter_m':6,'height_m':.9,'goal_total_length_m':6.72251,'surface_thickness_m':.2,'entry':'Single Panel 03 with top notch, sector 2','goals':'Sectors 1 and 5, lower level','notes':['Entry uses newer detailed Panel 03 width 575 mm; older assembly labels 601 mm. Goal rear height uses detailed Panel 02: 315 mm.','Mesh pitch 50 mm inferred visually; sleeve and weld details omitted.','Neutral surface slab is an additional Studio layer, absent from construction drawings.'],'artifacts':{}}
for filename in ['panna-circle-cage-1.blend','panna-circle-cage-1.glb','studio-mesh.json']:
 b=open(OUT+'/'+filename,'rb').read();report['artifacts'][filename]={'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
with open(OUT+'/validation.json','w') as f:json.dump(report,f,indent=2)
print('ARENA_READY',count)
