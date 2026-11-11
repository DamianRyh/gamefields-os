"""Octagon: dimensioned 09.09.2023 assembly, panel widths adapted by owner decision."""
import bpy, math, os, json, hashlib
from mathutils import Vector
OUT=os.path.dirname(os.path.abspath(__file__))
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene;scene.unit_settings.system='METRIC';scene.unit_settings.length_unit='METERS'
L,W=4.962,4.962
SLAB_L,SLAB_W=6.0,6.0
def material(name,color,metal=.6):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
 n=m.node_tree.nodes.get('Principled BSDF');n.inputs['Base Color'].default_value=(*color,1);n.inputs['Metallic'].default_value=metal;n.inputs['Roughness'].default_value=.48
 return m
mats={g:material(n,c) for g,n,c in [('frame','Rama - kolor edytowalny',(.12,.15,.17)),('panels','Wypelnienie - kolor edytowalny',(.16,.19,.20)),('goals','Bramki - kolor edytowalny',(.13,.16,.18))]}
mats['floor']=material('Nawierzchnia - baza',(.43,.48,.43),0)
structure=bpy.data.collections.new('Konstrukcja Octagon');scene.collection.children.link(structure)
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
    v=me.vertices[loop.vertex_index].co;uv.data[loop.index].uv=((v.x-lo)/(hi-lo or 1),(v.z-.018)/1.2)
  return o
def panel(name,span,kind,origin,angle):
 frame,fill,goal=Geometry(),Geometry(),Geometry();a,b=-span/2,span/2;z0,z1=.018,1.218
 def rail(x0,x1,z):frame.beam((x0,0,z),(x1,0,z))
 for x in [a+.015,b-.015]:frame.beam((x,0,z0),(x,0,z1))
 for x,sign in [(a,-1),(b,1)]:
  for z in [.119,.619,1.119]:frame.beam((x,0,z),(x+sign*.055,.073,z),.025,.008,.002)
 if kind!='goal':rail(a,b,z0+.015)
 else:
  for x0,x1 in [(a,-.53),(.53,b)]:rail(x0,x1,z0+.015)
 if kind=='entry':
  for x0,x1 in [(a,-.39),(.39,b)]:rail(x0,x1,z1-.015)
  rail(-.39,.39,.787)
  for x in [-.375,.375]:frame.beam((x,0,.772),(x,0,z1))
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
   if kind=='entry' and abs(x)<.39:high=.772
   elif kind=='goal':low=.462
  fill.beam((x,0,low),(x,0,high),.025,.025,.002)
 if kind=='goal':
  # Clear mouth 1000 x 600 mm; depth and rear dimensions from the detailed basket.
  rear=5.642/2-(L/2+.025)-.025
  for x in [-.515,.515]:
   goal.beam((x,0,z0),(x,0,.462))
   goal.beam((x,rear,z0),(x,rear,.320))
   goal.beam((x,0,.447),(x,rear,.305))
   goal.beam((x,0,z0+.015),(x,rear,z0+.015))
  for y,z in [(0,.447),(rear,.305),(rear,z0+.015)]:goal.beam((-.53,y,z),(.53,y,z))
  for x in [-.328,-.164,0,.164,.328]:
   goal.beam((x,0,.447),(x,rear,.305),.025,.025,.002);goal.beam((x,rear,z0+.03),(x,rear,.290),.025,.025,.002)
  for x in [-.515,.515]:goal.beam((x,0,.391),(x,rear,.391),.025,.025,.002)
 frame.object(name+' rama','frame',origin,angle);fill.object(name+' wypelnienie','panels',origin,angle);goal.object(name+' bramka','goals',origin,angle)
counts={'standard':0,'entry':0,'goal':0,'posts':8};widths={}
# Eight flats: goal panels north/south, entry panels east/west.
a=L/2+.025;post_a=a+.073;span=2.0
for i in range(8):
 theta=i*math.pi/4;kind='goal' if i in [2,6] else 'entry' if i in [0,4] else 'standard'
 panel(f'Panel {i+1}',span,kind,(a*math.cos(theta),a*math.sin(theta)),theta-math.pi/2);counts[kind]+=1
 r=post_a/math.cos(math.pi/8);phi=theta+math.pi/8;x,y=r*math.cos(phi),r*math.sin(phi)
 g=Geometry();g.beam((x,y,.005),(x,y,1.213),.08,.08,.003);g.box((x,y,.0025),(.14,.14,.005));g.box((x,y,1.2155),(.09,.09,.005));g.object(f'Slup {i+1:02d}','frame')
assert counts=={'standard':4,'entry':2,'goal':2,'posts':8}
# Octagonal base, 6 m across flats: includes both baskets and all post feet.
g=Geometry();r=3/math.cos(math.pi/8);outline=[(r*math.cos(math.pi/8+i*math.pi/4),r*math.sin(math.pi/8+i*math.pi/4)) for i in range(8)]
g.face([(x,y,0) for x,y in outline]);g.face([(x,y,-.2) for x,y in outline[::-1]])
for i in range(8):
 x,y=outline[i];xx,yy=outline[(i+1)%8];g.face([(x,y,-.2),(xx,yy,-.2),(xx,yy,0),(x,y,0)])
floor=g.object('Nawierzchnia','floor');uv=floor.data.uv_layers.new(name='Surface UV')
for loop in floor.data.loops:
 v=floor.data.vertices[loop.vertex_index].co;uv.data[loop.index].uv=((v.x+3)/6,(v.y+3)/6)
scene['Project']='Octagon';scene['SourceAssembly']='Boisko 01, 01.10.2021';scene['Adaptation']='Octagonal assembly from Boisko 01; shared profile sections adapted to older assembly heights and openings.'
bpy.context.preferences.filepaths.save_version=0;bpy.context.view_layer.update()
bpy.ops.wm.save_as_mainfile(filepath=OUT+'/octagon.blend',compress=True)
bpy.ops.export_scene.gltf(filepath=OUT+'/octagon.glb',export_format='GLB')
meshes=[]
for o in scene.objects:
 if o.type!='MESH':continue
 o.data.calc_loop_triangles();vs=[o.matrix_world@v.co for v in o.data.vertices];uvs=[[0,0] for _ in vs]
 if o.data.uv_layers.active:
  for loop in o.data.loops:uvs[loop.vertex_index]=list(o.data.uv_layers.active.data[loop.index].uv)
 meshes.append({'id':'floor' if o==floor else o.name.replace(' ','-'),'label':o.name,'group':o['group'],'v':[[round(v.x,6),round(v.z,6),round(-v.y,6)] for v in vs],'f':[list(t.vertices) for t in o.data.loop_triangles],'uv':uvs,'artwork':False})
with open(OUT+'/studio-mesh.json','w') as f:json.dump(meshes,f,separators=(',',':'))
report={'name':'Octagon','status':'SOURCE_DERIVED_CONCEPT','source':'Boisko 01.PDF, 01.10.2021','length_m':L,'width_m':W,'height_m':1.218,'goal_total_length_m':5.642,'surface_thickness_m':.2,'surface_length_m':6,'surface_width_m':6,'surface_shape':'regular octagon','moduleCounts':counts,'entry_clear_width_m':.720,'entry_sill_height_m':.802,'goal_width_m':1,'goal_front_height_m':.462,'meshCount':len(meshes),'triangles':sum(len(m['f']) for m in meshes),'notes':['Shared profile sections and bar infill from Street Field; height and openings adapted to older Boisko 01 assembly.','Eight 2 m modules, two opposing goals and two opposing notches.','Connector geometry simplified; bolt holes and welds omitted.','Octagonal neutral slab 20 cm thick added for Studio, 6 m across flats.'],'artifacts':{}}
for filename in ['octagon.blend','octagon.glb','studio-mesh.json']:
 b=open(OUT+'/'+filename,'rb').read();report['artifacts'][filename]={'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest()}
with open(OUT+'/validation.json','w') as f:json.dump(report,f,indent=2)
print('OCTAGON_READY',report['moduleCounts'])
