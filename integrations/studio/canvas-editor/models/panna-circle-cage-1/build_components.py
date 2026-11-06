"""Source-derived modules; whole-court assembly requires its layout confirmation."""
import bpy, math, os, json
from mathutils import Vector
OUT=os.path.dirname(os.path.abspath(__file__))
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene;scene.unit_settings.system='METRIC'
scene.unit_settings.length_unit='METERS'
R=3.03; RM=3.0135; H=.9; A=math.pi/8; WALL=.003
def material(name,color,metal):
 m=bpy.data.materials.new(name);m.diffuse_color=(*color,1);m.use_nodes=True
 p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Base Color'].default_value=(*color,1);p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=.45
 return m
mats=[material('Rama - kolor edytowalny',(.14,.17,.19),.65),material('Siatka - kolor edytowalny',(.10,.13,.14),.6),material('Bramki - kolor edytowalny',(.25,.29,.30),.6)]
def pos(t,z,r=R):return Vector((r*math.cos(t),r*math.sin(t),z))
class Geometry:
 def __init__(self):self.v=[];self.f=[]
 def face(self,points):
  i=len(self.v);self.v.extend([tuple(p) for p in points]);self.f.append(tuple(range(i,i+len(points))))
 def rod(self,a,b,r=.0015,sides=6):
  a,b=Vector(a),Vector(b);d=(b-a).normalized();q=d.to_track_quat('Z','Y');u=q@Vector((r,0,0));v=q@Vector((0,r,0));rings=[]
  for p in [a,b]:rings.append([p+u*math.cos(2*math.pi*i/sides)+v*math.sin(2*math.pi*i/sides) for i in range(sides)])
  for i in range(sides):j=(i+1)%sides;self.face([rings[0][i],rings[0][j],rings[1][j],rings[1][i]])
 def arc(self,t0,t1,z,rad=R,w=.06,h=.04,steps=24):
  rings=[]
  for i in range(steps+1):
   t=t0+(t1-t0)*i/steps
   # SHS section with a 3 mm wall, including open ends.
   pts=[]
   for ww,hh in [(w,h),(w-2*WALL,h-2*WALL)]:
    for dr,dz in [(-ww/2,-hh/2),(ww/2,-hh/2),(ww/2,hh/2),(-ww/2,hh/2)]:pts.append(pos(t,z+dz,rad+dr))
   rings.append(pts)
  for a,b in zip(rings,rings[1:]):
   for j in range(4):k=(j+1)%4;self.face([a[j],b[j],b[k],a[k]]);self.face([a[4+k],b[4+k],b[4+j],a[4+j]])
  for ring in [rings[0],rings[-1]]:
   for j in range(4):k=(j+1)%4;self.face([ring[j],ring[k],ring[4+k],ring[4+j]])
 def boxbeam(self,a,b,width=.04,depth=.06):
  a,b=Vector(a),Vector(b);d=(b-a).normalized();q=d.to_track_quat('Z','Y');u=q@Vector((width/2,0,0));v=q@Vector((0,depth/2,0))
  p=[[c-u-v,c+u-v,c+u+v,c-u+v] for c in [a,b]]
  self.face(p[0][::-1]);self.face(p[1])
  for j in range(4):k=(j+1)%4;self.face([p[0][j],p[0][k],p[1][k],p[1][j]])
 def wirefield(self,t0,t1,z0,z1):
  # Square welded mesh: diameter is documented, 50 mm pitch inferred visually.
  n=max(1,round((t1-t0)*RM/.05));nz=max(1,round((z1-z0)/.05))
  for i in range(n+1):t=t0+(t1-t0)*i/n;self.rod(pos(t,z0,RM),pos(t,z1,RM))
  steps=max(2,math.ceil((t1-t0)*RM/.10))
  for i in range(nz+1):
   z=z0+(z1-z0)*i/nz
   for j in range(steps):self.rod(pos(t0+(t1-t0)*j/steps,z,RM),pos(t0+(t1-t0)*(j+1)/steps,z,RM))
 def object(self,name,mat,collection,offset):
  me=bpy.data.meshes.new(name);me.from_pydata(self.v,[],self.f);me.update();o=bpy.data.objects.new(name,me);collection.objects.link(o);o.data.materials.append(mats[mat]);o.location=offset
  return o

report={"name":"Panna Circle Cage 1.0","status":"COMPONENTS_ONLY_AWAITING_ASSEMBLY","documented":{"profile_inner_radius_m":3,"module_angle_deg":45,"module_height_m":.9,"SHS_section_m":[.04,.06],"SHS_wall_m":.003,"mesh_wire_diameter_m":.003,"goal_front_width_m":1.088,"goal_front_height_m":.640,"goal_rear_height_m":.315,"goal_depth_m":.587,"notch_width_m":.575,"notch_depth_m":.600},"assumptions":{"mesh_pitch_m":.05,"radius_to_profile_center_m":R,"whole_court_layout":"Unconfirmed; source has 12 standard + 2 goal + 2 notched modules, no assembly drawing"}}
for index,kind in enumerate(['Panel 01','Panel 02','Panel 03']):
 c=bpy.data.collections.new(kind);scene.collection.children.link(c);c['drawing']=kind
 frame,mesh,goal=Geometry(),Geometry(),Geometry();offset=(-3.0,index*3.2-3.2,0)
 for t in [-A,A]:frame.boxbeam(pos(t,0),pos(t,H))
 if index==0:
  frame.arc(-A,A,.02);frame.arc(-A,A,.88);frame.boxbeam(pos(0,.04),pos(0,.86))
  for t0,t1 in [(-A+.014,-.007),(.007,A-.014)]:mesh.wirefield(t0,t1,.04,.86)
 elif index==1:
  a=math.asin((1.088-.04)/2/R)
  frame.arc(-A,A,.88)
  for t0,t1 in [(-A,-a),(a,A)]:frame.arc(t0,t1,.02);mesh.wirefield(t0+.014,t1-.014,.04,.86)
  mesh.wirefield(-a+.007,a-.007,.66,.86)
  front=math.sqrt(R*R-(.524**2));back=6.72251/2-.02
  for y in [-.524,.524]:
   goal.boxbeam((front,y,0),(front,y,.64));goal.boxbeam((back,y,0),(back,y,.315))
   goal.boxbeam((front,y,.64),(back,y,.315));goal.boxbeam((front,y,.02),(back,y,.02))
  goal.boxbeam((front,-.524,.64),(front,.524,.64));goal.boxbeam((back,-.524,.315),(back,.524,.315));goal.boxbeam((back,-.524,.02),(back,.524,.02))
  for y in [-.44,-.22,0,.22,.44]:goal.boxbeam((back,y,.02),(back,y,.315),.03,.03);goal.boxbeam((front,y,.64),(back,y,.315),.03,.03)
 elif index==2:
  a=math.asin((.575+.04)/2/R);frame.arc(-A,A,.02);frame.arc(-a,a,.28)
  for t0,t1 in [(-A,-a),(a,A)]:frame.arc(t0,t1,.88);mesh.wirefield(t0+.014,t1-.014,.04,.86)
  for t in [-a,a]:frame.boxbeam(pos(t,.26),pos(t,.90))
  mesh.wirefield(-a+.007,a-.007,.04,.26);frame.boxbeam(pos(0,.04),pos(0,.26))
 frame.object(kind+' - rama',0,c,offset);mesh.object(kind+' - siatka',1,c,offset)
 if goal.v:goal.object(kind+' - bramka',2,c,offset)

scene['Project']='Panna Circle Cage 1.0';scene['Scope']='Source-derived modules; assembly not confirmed'
bpy.context.preferences.filepaths.save_version=0
bpy.ops.wm.save_as_mainfile(filepath=OUT+'/panna-circle-cage-1-moduly.blend',compress=True)
bpy.ops.export_scene.gltf(filepath=OUT+'/panna-circle-cage-1-moduly.glb',export_format='GLB')
with open(OUT+'/dimensions.json','w') as f:json.dump(report,f,indent=2)
print('COMPONENTS_READY')
