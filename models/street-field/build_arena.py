"""Street Field: dimensioned 09.09.2023 assembly, panel widths adapted by owner decision."""
import bpy, math, os, json, hashlib
from mathutils import Vector
OUT=os.path.dirname(os.path.abspath(__file__))
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene;scene.unit_settings.system='METRIC';scene.unit_settings.length_unit='METERS'
L,W=6.214,4.648
SLAB_L,SLAB_W=7.3,5.3
def material(name,color,metal=.6):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
 n=m.node_tree.nodes.get('Principled BSDF');n.inputs['Base Color'].default_value=(*color,1);n.inputs['Metallic'].default_value=metal;n.inputs['Roughness'].default_value=.48
 return m
mats={g:material(n,c) for g,n,c in [('frame','Rama - kolor edytowalny',(.12,.15,.17)),('panels','Wypelnienie - kolor edytowalny',(.16,.19,.20)),('goals','Bramki - kolor edytowalny',(.13,.16,.18))]}
mats['floor']=material('Nawierzchnia - baza',(.43,.48,.43),0)
structure=bpy.data.collections.new('Konstrukcja Street Field');scene.collection.children.link(structure)
class Geometry:
 def __init__(self):self.v=[];self.f=[]
 def face(self,points):
  i=len(self.v);self.v.extend([tuple(p) for p in points]);self.f.append(tuple(range(i,i+len(points))))
 def beam(self,a,b,w=.03,d=.05,wall=.003):
  a,b=Vector(a),Vector(b);axis=(b-a).normalized();rings=[]
  if abs(axis.z)>.999:u,v=Vector((1,0,0)),Vector((0,1,0))
  else:
   u=Vector((0,0,1));u=(u-axis*u.dot(axis)).normalized();v=axis.cross(u).normalized()
  for p in [a,b]:
   ring=[]
   for ww,dd in [(w,d),(w-2*wall,d-2*wall)]:
    ring.extend([p+u*(x*ww/2)+v*(y*dd/2) for x,y in [(-1,-1),(1,-1),(1,1),(-1,1)]])
   rings.append(ring)
  a,b=rings
  for j in range(4):
   k=(j+1)%4;self.face([a[j],a[k],b[k],b[j]]);self.face([a[4+k],a[4+j],b[4+j],b[4+k]])
   self.face([a[k],a[j],a[4+j],a[4+k]]);self.face([b[j],b[k],b[4+k],b[4+j]])
 def box(self,center,size):
  x,y,z=center;w,d,h=size
  p=[(x+sx*w/2,y+sy*d/2,z+sz*h/2) for sz in [-1,1] for sx,sy in [(-1,-1),(1,-1),(1,1),(-1,1)]]
  for f in [(3,2,1,0),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)]:self.face([p[i] for i in f])
 def object(self,name,group,origin=(0,0),angle=0):
  if not self.v:return
  me=bpy.data.meshes.new(name);me.from_pydata(self.v,[],self.f);me.update();o=bpy.data.objects.new(name,me);structure.objects.link(o);o.data.materials.append(mats[group]);o['group']=group;o.location=(*origin,0);o.rotation_euler.z=angle
  # Flat panel artwork UVs, normalized over each assembled panel.
  if group=='panels':
   uv=me.uv_layers.new(name='Panel UV');lo=min(v[0] for v in self.v);hi=max(v[0] for v in self.v)
   for loop in me.loops:
    v=me.vertices[loop.vertex_index].co;uv.data[loop.index].uv=((v.x-lo)/(hi-lo or 1),(v.z-.091))
  return o
def panel(name,span,kind,origin,angle):
 frame,fill,goal=Geometry(),Geometry(),Geometry();a,b=-span/2,span/2;z0,z1=.091,1.091
 def rail(x0,x1,z):frame.beam((x0,0,z),(x1,0,z))
 for x in [a+.015,b-.015]:frame.beam((x,0,z0),(x,0,z1))
 for x,sign in [(a,-1),(b,1)]:
  for z in [.192,.592,.992]:frame.beam((x,0,z),(x+sign*.055,.073,z),.025,.008,.002)
 if kind!='goal':rail(a,b,z0+.015)
 else:
  for x0,x1 in [(a,-.53),(.53,b)]:rail(x0,x1,z0+.015)
 if kind=='entry':
  for x0,x1 in [(a,-.53),(.53,b)]:rail(x0,x1,z1-.015)
  rail(-.53,.53,.606)
  for x in [-.515,.515]:frame.beam((x,0,.591),(x,0,z1))
 else:rail(a,b,z1-.015)
 # Horizontal stiffener at 300 mm above panel bottom; interrupted by goal opening.
 fields=[(a+.03,b-.03)] if kind=='standard' else [(a+.03,-.53),(.53,b-.03)]
 for x0,x1 in fields:fill.beam((x0,0,.391),(x1,0,.391),.025,.025,.002)
 if kind=='entry':fill.beam((-.50,0,.391),(.50,0,.391),.025,.025,.002)
 # Keep the characteristic 164 mm bar pitch where possible after width adaptation.
 n=max(2,round((span-.06)/.164))
 for i in range(1,n):
  x=a+.03+(span-.06)*i/n;low=z0+.03;high=z1-.03
  if abs(x)<.53:
   if kind=='entry':high=.591
   elif kind=='goal':low=.721
  fill.beam((x,0,low),(x,0,high),.025,.025,.002)
 if kind=='goal':
  # Clear mouth 1000 x 600 mm; depth and rear dimensions from the detailed basket.
  rear=3.512-(L/2+.025)-.025
  for x in [-.515,.515]:
   goal.beam((x,0,z0),(x,0,.721))
   goal.beam((x,rear,z0),(x,rear,.551))
   goal.beam((x,0,.706),(x,rear,.536))
   goal.beam((x,0,z0+.015),(x,rear,z0+.015))
  for y,z in [(0,.706),(rear,.536),(rear,z0+.015)]:goal.beam((-.53,y,z),(.53,y,z))
  for x in [-.328,-.164,0,.164,.328]:
   goal.beam((x,0,.706),(x,rear,.536),.025,.025,.002);goal.beam((x,rear,z0+.03),(x,rear,.521),.025,.025,.002)
  for x in [-.515,.515]:goal.beam((x,0,.391),(x,rear,.391),.025,.025,.002)
 frame.object(name+' rama','frame',origin,angle);fill.object(name+' wypelnienie','panels',origin,angle);goal.object(name+' bramka','goals',origin,angle)
counts={'standard':0,'entry':0,'goal':0,'posts':14};widths={}
# Post centers follow the dimensioned 140 mm base-plate outer envelope.
px,py=3.205,2.422
for side in [-1,1]:
 for i in range(4):
  x=-px+(i+.5)*(2*px/4);kind='entry' if side==-1 and i==1 else 'standard';span=2*px/4-.11
  panel(f'Bok {side} panel {i+1}',span,kind,(x,side*(W/2+.025)),0 if side==1 else math.pi);counts[kind]+=1;widths['long_m']=span
 for i in range(3):
  y=-py+(i+.5)*(2*py/3);kind='goal' if i==1 else 'standard';span=2*py/3-.11
  panel(f'Czolo {side} panel {i+1}',span,kind,(side*(L/2+.025),y),-math.pi/2 if side==1 else math.pi/2);counts[kind]+=1;widths['short_m']=span
posts=[]
for y in [-py,py]:
 for i in range(5):posts.append((-px+i*2*px/4,y))
for x in [-px,px]:
 for i in [1,2]:posts.append((x,-py+i*2*py/3))
for i,(x,y) in enumerate(posts):
 g=Geometry();g.beam((x,y,.005),(x,y,1.086),.08,.08,.003);g.box((x,y,.0025),(.14,.14,.005));g.box((x,y,1.0885),(.09,.09,.005));g.object(f'Slup {i+1:02d}','frame')
 # Simplified connector plates; hardware holes and welds omitted.
assert counts=={'standard':11,'entry':1,'goal':2,'posts':14}
g=Geometry();g.box((0,0,-.1),(SLAB_L,SLAB_W,.2));floor=g.object('Nawierzchnia','floor');uv=floor.data.uv_layers.new(name='Surface UV')
for loop in floor.data.loops:
 v=floor.data.vertices[loop.vertex_index].co;uv.data[loop.index].uv=((v.x+SLAB_L/2)/SLAB_L,(v.y+SLAB_W/2)/SLAB_W)
scene['Project']='Street Field';scene['SourceAssembly']='Boisko 02, 09.09.2023';scene['Adaptation']='Owner approved assembly footprint; panel widths adapted from later 2 m component drawings.'
bpy.context.preferences.filepaths.save_version=0;bpy.context.view_layer.update()
bpy.ops.wm.save_as_mainfile(filepath=OUT+'/street-field.blend',compress=True)
bpy.ops.export_scene.gltf(filepath=OUT+'/street-field.glb',export_format='GLB')
meshes=[]
for o in scene.objects:
 if o.type!='MESH':continue
 o.data.calc_loop_triangles();vs=[o.matrix_world@v.co for v in o.data.vertices];uvs=[[0,0] for _ in vs]
 if o.data.uv_layers.active:
  for loop in o.data.loops:uvs[loop.vertex_index]=list(o.data.uv_layers.active.data[loop.index].uv)
 meshes.append({'id':'floor' if o==floor else o.name.replace(' ','-'),'label':o.name,'group':o['group'],'v':[[round(v.x,6),round(v.z,6),round(-v.y,6)] for v in vs],'f':[list(t.vertices) for t in o.data.loop_triangles],'uv':uvs,'artwork':False})
with open(OUT+'/studio-mesh.json','w') as f:json.dump(meshes,f,separators=(',',':'))
report={'name':'Street Field','status':'VALIDATED_DIMENSIONED_ADAPTATION','source':'Boisko 02 (1).pdf, 09.09.2023','userDecision':'Use inner field 6.214 x 4.648 m and adapt later panel widths','length_m':L,'width_m':W,'height_m':1.091,'base_bounds_m':[6.55,4.984],'goal_total_length_m':7.024,'surface_thickness_m':.2,'surface_length_m':SLAB_L,'surface_width_m':SLAB_W,'moduleCounts':counts,'adapted_panel_widths':widths,'meshCount':len(meshes),'triangles':sum(len(m['f']) for m in meshes),'notes':['Detailed 2 m panels have adapted widths, not an unchanged manufacturing assembly.','Section dimensions retained: frame 50 x 30 x 3, infill 25 x 25 x 2, posts 80 x 80 x 3 mm.','Connector geometry simplified; bolts, holes and welds omitted.','20 cm neutral slab added for Studio; no default artwork or lines.'],'artifacts':{}}
for filename in ['street-field.blend','street-field.glb','studio-mesh.json']:
 b=open(OUT+'/'+filename,'rb').read();report['artifacts'][filename]={'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
with open(OUT+'/validation.json','w') as f:json.dump(report,f,indent=2)
print('STREET_FIELD_READY',report['moduleCounts'])
