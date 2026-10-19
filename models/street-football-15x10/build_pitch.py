import bpy, math, os, json
from mathutils import Vector
OUT=os.path.dirname(os.path.abspath(__file__))
os.makedirs(OUT,exist_ok=True)
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
scene=bpy.context.scene
scene.unit_settings.system='METRIC'
scene.unit_settings.length_unit='METERS'
def mat(name,color,metal=0,rough=.5):
 m=bpy.data.materials.new(name); m.diffuse_color=(*color,1); m.use_nodes=True
 p=m.node_tree.nodes.get('Principled BSDF'); p.inputs['Base Color'].default_value=(*color,1); p.inputs['Metallic'].default_value=metal; p.inputs['Roughness'].default_value=rough
 return m
steel=mat('Stal ocynkowana',(.48,.57,.60),.8,.29)
black=mat('Czarne wypelnienie band',(.012,.019,.025),0,.48)
white=mat('Bialy nadruk',(.92,.96,.97))
grass=mat('Sztuczna trawa',(.07,.24,.035),0,.93)
n=grass.node_tree.nodes; l=grass.node_tree.links; noise=n.new('ShaderNodeTexNoise'); noise.inputs['Scale'].default_value=190
r=n.new('ShaderNodeValToRGB'); r.color_ramp.elements[0].color=(.025,.085,.009,1); r.color_ramp.elements[1].color=(.16,.34,.045,1)
l.new(noise.outputs['Fac'],r.inputs[0]); l.new(r.outputs[0],n.get('Principled BSDF').inputs['Base Color'])
b=n.new('ShaderNodeBump'); b.inputs['Strength'].default_value=.22; b.inputs['Distance'].default_value=.018; l.new(noise.outputs['Fac'],b.inputs['Height']); l.new(b.outputs[0],n.get('Principled BSDF').inputs['Normal'])
yellow=mat('Linia zolta',(.85,.65,.12)); ground=mat('Podloze prezentacji',(.12,.15,.16))
cols={}
for name in ['01_Nawierzchnia','02_Bandy_modulowe','03_Bramki','04_Oznakowanie','05_Wymiary','06_Prezentacja']:
 c=bpy.data.collections.new(name); scene.collection.children.link(c); cols[name]=c
def move(o,c):
 for cc in list(o.users_collection): cc.objects.unlink(o)
 cols[c].objects.link(o)
def box(name,loc,size,material,col,angle=0):
 bpy.ops.mesh.primitive_cube_add(size=1,location=loc); o=bpy.context.object; o.name=name; o.dimensions=size; o.rotation_euler.z=angle
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True); o.data.materials.append(material); move(o,col)
 bevel=o.modifiers.new('Lagodne krawedzie','BEVEL'); bevel.width=.006; bevel.segments=2
 o.modifiers.new('Normalne','WEIGHTED_NORMAL'); return o
def rod(name,a,b,radius=.018,material=steel,col='03_Bramki'):
 d=Vector(b)-Vector(a); bpy.ops.mesh.primitive_cylinder_add(vertices=12,radius=radius,depth=d.length,location=(Vector(a)+Vector(b))/2)
 o=bpy.context.object; o.name=name; o.rotation_euler=d.to_track_quat('Z','Y').to_euler(); o.data.materials.append(material); move(o,col); return o
def text(body,loc,size,rotation=(0,0,0),col='05_Wymiary',material=white):
 cu=bpy.data.curves.new(body,'FONT'); cu.body=body; cu.align_x='CENTER'; cu.align_y='CENTER'; cu.size=size; cu.extrude=.0005
 o=bpy.data.objects.new(body,cu); cols[col].objects.link(o); o.location=loc; o.rotation_euler=rotation; cu.materials.append(material); return o
# Inner playing envelope: x = +/-7.5, y = +/-5. Corners cut by 0.65 m.
v=[(-7.5,-4.35,0),(-6.85,-5,0),(6.85,-5,0),(7.5,-4.35,0),(7.5,4.35,0),(6.85,5,0),(-6.85,5,0),(-7.5,4.35,0)]
me=bpy.data.meshes.new('Obrys murawy'); me.from_pydata(v,[],[list(range(8))]); me.update(); ob=bpy.data.objects.new('Murawa 15x10m ze scietymi naroznikami',me); cols['01_Nawierzchnia'].objects.link(ob); me.materials.append(grass)
sol=ob.modifiers.new('Grubosc podkladu 60mm','SOLIDIFY'); sol.thickness=.06
H=1.0; T=.04
def panels(a,b):
 a,b=Vector(a),Vector(b); d=b-a; length=d.length; u=d.normalized(); normal=Vector((u.y,-u.x)); count=math.ceil(length/2.3); step=length/count; ang=math.atan2(d.y,d.x)
 for j in range(count):
  mid=a+u*((j+.5)*step)+normal*.025
  box('Panel bandy %s'%len(bpy.data.objects),(mid.x,mid.y,H/2),(step-.025,.022,H-.08),black,'02_Bandy_modulowe',ang)
  for z in [.025,H-.025]: box('Rama pozioma',(mid.x,mid.y,z),(step,.04,.05),steel,'02_Bandy_modulowe',ang)
  for off in [-step/2,step/2]:
   p=mid+u*off; box('Slupek ramy',(p.x,p.y,H/2),(.04,.04,H),steel,'02_Bandy_modulowe',ang)
  if step>1.4:
   # Both faces remain readable from inside and outside.
   for sign in [-1,1]:
    p=mid+normal*(sign*.018); zrot=ang if sign==1 else ang+math.pi
    text('STREETFOOTBALL',(p.x,p.y,.56),.18,(math.pi/2,0,zrot),'04_Oznakowanie')
 for p in [a,b]:
  p=p+normal*.025
  for z in [.16,.94]: rod('Lacznik / sruba',(p.x,p.y-.027,z),(p.x,p.y+.027,z),.012,steel,'02_Bandy_modulowe')
for i in range(8):
 a=v[i][:2]; b=v[(i+1)%8][:2]
 if a[0]==b[0] and abs(a[0])==7.5:
  panels((a[0],-4.35),(a[0],-1)); panels((a[0],1),(a[0],4.35))
 else: panels(a,b)
H=1.1 # Independent estimated goal height
for side in [-1,1]:
 x=side*7.5; back=x+side*.8
 for xx in [x,back]:
  for yy in [-1,1]: rod('Bramka slupek',(xx,yy,0),(xx,yy,H),.025)
  for z in [0,H]: rod('Bramka poprzeczka',(xx,-1,z),(xx,1,z),.025)
 for y in [-1,1]:
  for z in [0,H]: rod('Bramka glebokosc',(x,y,z),(back,y,z),.025)
  for z in [.275,.55,.825]: rod('Bramka boczny pret',(x,y,z),(back,y,z),.012)
 for j in range(1,14):
  y=-1+2*j/14; rod('Bramka tylne prety',(back,y,0),(back,y,H),.012)
  rod('Bramka dach prety',(x,y,H),(back,y,H),.012)
box('Linia srodkowa',(0,0,.004),(.035,9.97,.006),yellow,'04_Oznakowanie')
# Dimension overlay, separate collection can be hidden.
for a,b,label,loc in [((-7.5,-6.2,.025),(7.5,-6.2,.025),'15.00 m',(0,-6.55,.03)),((-9.1,-5,.025),(-9.1,5,.025),'10.00 m',(-9.5,0,.03))]:
 rod('Wymiar',a,b,.009,white,'05_Wymiary'); text(label,loc,.28)
 for p in [a,b]:
  delta=(0,.14,0) if a[1]==b[1] else (.14,0,0)
  rod('Znacznik wymiaru',Vector(p)-Vector(delta),Vector(p)+Vector(delta),.009,white,'05_Wymiary')
box('Podloze',(0,0,-.18),(200,200,.2),ground,'06_Prezentacja')
def camera(name,loc,target,ortho):
 bpy.ops.object.camera_add(location=loc); c=bpy.context.object; c.name=name; c.rotation_euler=(Vector(target)-c.location).to_track_quat('-Z','Y').to_euler(); c.data.type='ORTHO'; c.data.ortho_scale=ortho; move(c,'06_Prezentacja'); return c
cam=camera('Kamera perspektywa',(20,-24,18),(0,0,0),25); camera('Kamera rzut z gory',(0,0,30),(0,0,0),23)
scene.camera=cam
bpy.ops.object.light_add(type='AREA',location=(0,-2,14)); light=bpy.context.object; light.data.energy=2300; light.data.shape='DISK'; light.data.size=12; move(light,'06_Prezentacja')
bpy.ops.object.light_add(type='SUN',location=(4,-6,10)); bpy.context.object.rotation_euler=(.35,-.4,-.35); bpy.context.object.data.energy=2; bpy.context.object.data.angle=.15; move(bpy.context.object,'06_Prezentacja')
scene.world.color=(.3,.3,.3); scene.render.engine='CYCLES'; scene.cycles.samples=12; scene.cycles.use_denoising=False
scene.render.resolution_x=1200; scene.render.resolution_y=880; scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'; scene.render.filepath=OUT+'/wizualizacja.png'
scene['Zalozenia']='15x10m w swietle wewnetrznego obrysu przed scieciem; bandy 1.00m; bramki 2.00x1.10x0.80m; sciecia 0.65m. Poza 15x10m wymiary szacunkowe ze zdjecia.'
scene['Charakter projektu']='Model koncepcyjny, bez obliczen statycznych, dokumentacji produkcyjnej i potwierdzenia norm.'
for screen in bpy.data.screens:
 for area in screen.areas:
  if area.type=='VIEW_3D':
   area.spaces.active.region_3d.view_distance=23; area.spaces.active.region_3d.view_location=(0,0,0)
bpy.ops.wm.save_as_mainfile(filepath=OUT+'/boisko_15x10.blend')
bpy.ops.export_scene.gltf(filepath=OUT+'/boisko_15x10.glb',export_format='GLB')
bpy.ops.render.render(write_still=True)
scene.camera=bpy.data.objects['Kamera rzut z gory']; scene.render.filepath=OUT+'/rzut_z_gory.png'; bpy.ops.render.render(write_still=True)
print('PROJECT_COMPLETE')
