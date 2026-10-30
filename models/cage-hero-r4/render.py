"""Homepage product photography from unchanged Cage CAD masters. Blender 3.6 Cycles."""
import bpy,math,json,hashlib,os
from pathlib import Path
from mathutils import Vector
import numpy as np
OUT=Path(__file__).resolve().parent;ROOT=OUT.parents[1];W,H=int(os.environ.get("CAGE_WIDTH","1920")),int(os.environ.get("CAGE_HEIGHT","1080"));ASPECT=W/H
PALETTE={'gray':'#929696','red':'#D3152B','blue':'#2469A6','green':'#667451'}
def lin(x):return x/12.92 if x<=.04045 else((x+.055)/1.055)**2.4
def rgb(h):return tuple(lin(int(h[i:i+2],16)/255)for i in [1,3,5])+(1,)
def background_valid(path):
 image=bpy.data.images.load(str(path),check_existing=False);pixels=np.empty(W*H*4,dtype=np.float32);image.pixels.foreach_get(pixels);pixels=pixels.reshape(H,W,4);band=pixels[int(H*.94):,int(W*.06):int(W*.94)];bad=np.count_nonzero((band[:,:,3]>.01)&(band[:,:,:3].max(axis=2)>.005));bpy.data.images.remove(image);return bad<4
rows=[]
for model in [int(v)for v in os.environ.get('CAGE_MODELS','90,180').split(',')]:
 source=ROOT/f'models/panna-cage-{model}-v2/panna-cage-{model}-v2.blend';bpy.ops.wm.open_mainfile(filepath=str(source));s=bpy.context.scene
 product=bpy.data.collections['Konstrukcja — CAD r2'];objects=[o for o in product.objects if o.type=='MESH'];before={o.name:(len(o.data.vertices),len(o.data.polygons),list(o.matrix_world))for o in objects}
 for o in list(s.objects):
  if o not in objects:bpy.data.objects.remove(o,do_unlink=True)
 for name,loc,power,size in [('Key',(-3,-4,9),900,6),('Fill',(6,0,5),220,7),('Rim',(2,6,7),500,5)]:
  light=bpy.data.objects.new(name,bpy.data.lights.new(name,'AREA'));s.collection.objects.link(light);light.location=loc;light.data.energy=power;light.data.shape='DISK';light.data.size=size;light.rotation_euler=(Vector((0,0,.4))-light.location).to_track_quat('-Z','Y').to_euler()
 bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.025));ground=bpy.context.object;ground.name='Shadow only';ground.is_shadow_catcher=True
 shadow_collection=bpy.data.collections.new('Shadow stage');s.collection.children.link(shadow_collection)
 for c in list(ground.users_collection):c.objects.unlink(ground)
 shadow_collection.objects.link(ground)
 mat=bpy.data.materials.new('Shadow receiver');mat.use_nodes=True;mat.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=(.75,.78,.8,1);ground.data.materials.append(mat)
 s.world.use_nodes=True;s.world.node_tree.nodes['Background'].inputs[0].default_value=(.65,.72,.8,1);s.world.node_tree.nodes['Background'].inputs[1].default_value=.22
 paint=[]
 for o in objects:
  if 'sleeves' in o.name:
   dark=bpy.data.materials.get('Graphite hardware')
   if dark is None:
    dark=bpy.data.materials.new('Graphite hardware');dark.use_nodes=True;p=dark.node_tree.nodes['Principled BSDF'];p.inputs['Base Color'].default_value=rgb('#30363c');p.inputs['Metallic'].default_value=.5;p.inputs['Roughness'].default_value=.35
   # A shallow object-local mesh copy keeps template geometry and all model sources unchanged.
   o.data=o.data.copy();o.data.materials.clear();o.data.materials.append(dark)
  elif o.get('group')in ['frame','panels']:
   for m in o.data.materials:
    if m not in paint:paint.append(m)
 for m in paint:
  p=m.node_tree.nodes['Principled BSDF'];p.inputs['Metallic'].default_value=.22;p.inputs['Roughness'].default_value=.48
 goal=bpy.data.materials.get('Bramki — metal lakierowany').node_tree.nodes['Principled BSDF'];goal.inputs['Base Color'].default_value=rgb('#bec5ca');goal.inputs['Metallic'].default_value=.6;goal.inputs['Roughness'].default_value=.3
 bpy.ops.object.camera_add(location=(10,-9,4.8 if model==180 else 6));camera=bpy.context.object;target=Vector((0,0,.65 if model==180 else .35));camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.type='ORTHO';camera.data.sensor_fit='HORIZONTAL';s.camera=camera;bpy.context.view_layer.update()
 inv=camera.matrix_world.inverted();lo=np.array([np.inf,np.inf]);hi=np.array([-np.inf,-np.inf])
 for o in objects:
  co=np.empty(len(o.data.vertices)*3,dtype=np.float32);o.data.vertices.foreach_get('co',co);co=co.reshape(-1,3);m=np.array(inv@o.matrix_world);projected=co@m[:3,:3].T+m[:3,3];lo=np.minimum(lo,projected[:,:2].min(axis=0));hi=np.maximum(hi,projected[:,:2].max(axis=0))
 camera.data.ortho_scale=max((hi[0]-lo[0])/.85,(hi[1]-lo[1])*ASPECT/.79);camera.location+=camera.rotation_euler.to_matrix()@Vector(((hi[0]+lo[0])/2,(hi[1]+lo[1])/2,0));bpy.context.view_layer.update();pose=[list(row)for row in camera.matrix_world]
 s.render.engine='CYCLES';prefs=bpy.context.preferences.addons['cycles'].preferences
 try:
  prefs.compute_device_type='METAL';prefs.get_devices()
  if os.environ.get('CAGE_DEVICE')=='CPU':raise RuntimeError('CPU validation requested')
  for d in prefs.devices:d.use=d.type=='METAL'
  s.cycles.device='GPU'
 except Exception:s.cycles.device='CPU'
 s.render.filter_size=1.5;
 s.cycles.samples=int(os.environ.get('CAGE_SAMPLES','128'));s.cycles.use_denoising=True;s.cycles.seed=0;s.cycles.use_adaptive_sampling=True;s.cycles.adaptive_min_samples=32;s.cycles.adaptive_threshold=.025;s.render.use_persistent_data=True;s.render.resolution_x=W;s.render.resolution_y=H;s.render.resolution_percentage=100;s.render.film_transparent=True;s.render.image_settings.file_format='PNG';s.render.image_settings.color_mode='RGBA';s.view_settings.view_transform='Filmic';s.view_settings.look='Medium High Contrast';s.view_settings.exposure=float(os.environ.get('CAGE_EXPOSURE','-.3'))
 # Separate product and receiver layers keep wire opacity independent of shadow strength.
 full=s.view_layers[0];full.name='Full';full.samples=32;product_layer=s.view_layers.new('Product');product_layer.layer_collection.children['Shadow stage'].exclude=True
 bounce_collection=bpy.data.collections.new('Product ground bounce');s.collection.children.link(bounce_collection);bounce=ground.copy();bounce.data=ground.data.copy();bounce_collection.objects.link(bounce);bounce.name='Ground illumination only';bounce.is_shadow_catcher=False;bounce.visible_camera=False;full.layer_collection.children['Product ground bounce'].exclude=True
 s.use_nodes=True;n=s.node_tree.nodes;n.clear();l=s.node_tree.links
 full_node=n.new('CompositorNodeRLayers');full_node.layer='Full';product_node=n.new('CompositorNodeRLayers');product_node.layer='Product'
 def mathnode(op,a,b):
  node=n.new('CompositorNodeMath');node.operation=op
  for i,value in enumerate([a,b]):
   if isinstance(value,(int,float)):node.inputs[i].default_value=value
   else:l.new(value,node.inputs[i])
  return node.outputs[0]
 difference=mathnode('SUBTRACT',full_node.outputs['Alpha'],product_node.outputs['Alpha']);denominator=mathnode('MAXIMUM',mathnode('SUBTRACT',1,product_node.outputs['Alpha']),.0001);shadow=mathnode('DIVIDE',difference,denominator);shadow=mathnode('MINIMUM',1,mathnode('MAXIMUM',0,shadow));shadow=mathnode('MULTIPLY',shadow,float(os.environ.get('CAGE_SHADOW','.48')))
 mask=n.new('CompositorNodeBoxMask');mask.x=.5;mask.y=.5;mask.width=.96;mask.height=.96/ASPECT;blur=n.new('CompositorNodeBlur');blur.filter_type='GAUSS';blur.size_x=24;blur.size_y=24;l.new(mask.outputs['Mask'],blur.inputs['Image']);shadow=mathnode('MULTIPLY',shadow,blur.outputs['Image'])
 black=n.new('CompositorNodeRGB');black.outputs[0].default_value=(0,0,0,1);shadow_image=n.new('CompositorNodeSetAlpha');shadow_image.mode='REPLACE_ALPHA';l.new(black.outputs[0],shadow_image.inputs['Image']);l.new(shadow,shadow_image.inputs['Alpha']);over=n.new('CompositorNodeAlphaOver');over.inputs[0].default_value=1;l.new(shadow_image.outputs['Image'],over.inputs[1]);l.new(product_node.outputs['Image'],over.inputs[2]);comp=n.new('CompositorNodeComposite');l.new(over.outputs['Image'],comp.inputs['Image'])
 for coat,hex in PALETTE.items():
  if coat not in os.environ.get('CAGE_COATS','gray,red,blue,green').split(','):continue
  for m in paint:m.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=rgb(hex)
  assert pose==[list(row)for row in camera.matrix_world]
  assert before=={o.name:(len(o.data.vertices),len(o.data.polygons),list(o.matrix_world))for o in objects}
  path=OUT/f'cage-{model}-{coat}.png';s.render.filepath=str(path);bpy.ops.render.render(write_still=True);render_device=s.cycles.device;fallback=False
  if not background_valid(path):
   print('BACKGROUND_RETRY_CPU',model,coat,flush=True);s.cycles.device='CPU';s.render.use_persistent_data=False;bpy.ops.render.render(write_still=True);assert background_valid(path),'Invalid background after CPU fallback';render_device='CPU';fallback=True;s.cycles.device='GPU'
  assert background_valid(path),'Background artifact'
  rows.append({'product':f'Panna Cage {model}','coat':coat,'hex':hex,'source':str(source.relative_to(ROOT)),'source_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'geometry_unchanged':True,'renderDevice':render_device,'CPUFallback':fallback,'camera_matrix':pose,'image':path.name});(OUT/'manifest.json').write_text(json.dumps({'revision':'CAGE-HERO-4','dimensions':[W,H],'transparent':True,'shadow_catcher':True,'separateProductShadowLayers':True,'shadowStrength':float(os.environ.get('CAGE_SHADOW','.48')),'exposure':s.view_settings.exposure,'samples':s.cycles.samples,'device':s.cycles.device,'renders':rows},indent=2)+'\n');print('HERO_READY',model,coat,flush=True)
print('ALL_HEROES_READY',flush=True)
