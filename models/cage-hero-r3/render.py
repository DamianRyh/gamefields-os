"""Homepage product photography from unchanged Cage CAD masters. Blender 3.6 Cycles."""
import bpy,math,json,hashlib,os
from pathlib import Path
from mathutils import Vector
import numpy as np
OUT=Path(__file__).resolve().parent;ROOT=OUT.parents[1];W,H=1920,1080;ASPECT=W/H
PALETTE={'gray':'#929696','red':'#D3152B','blue':'#2469A6','green':'#667451'}
def lin(x):return x/12.92 if x<=.04045 else((x+.055)/1.055)**2.4
def rgb(h):return tuple(lin(int(h[i:i+2],16)/255)for i in [1,3,5])+(1,)
rows=[]
for model in [90,180]:
 source=ROOT/f'models/panna-cage-{model}-v2/panna-cage-{model}-v2.blend';bpy.ops.wm.open_mainfile(filepath=str(source));s=bpy.context.scene
 product=bpy.data.collections['Konstrukcja — CAD r2'];objects=[o for o in product.objects if o.type=='MESH'];before={o.name:(len(o.data.vertices),len(o.data.polygons),list(o.matrix_world))for o in objects}
 for o in list(s.objects):
  if o not in objects:bpy.data.objects.remove(o,do_unlink=True)
 for name,loc,power,size in [('Key',(1,-4,9),1800,7),('Fill',(-5,-1,5),1100,6),('Rim',(3,6,6),2300,5)]:
  light=bpy.data.objects.new(name,bpy.data.lights.new(name,'AREA'));s.collection.objects.link(light);light.location=loc;light.data.energy=power;light.data.shape='DISK';light.data.size=size;light.rotation_euler=(Vector((0,0,.4))-light.location).to_track_quat('-Z','Y').to_euler()
 bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.025));ground=bpy.context.object;ground.name='Shadow only';ground.is_shadow_catcher=True
 mat=bpy.data.materials.new('Shadow receiver');mat.use_nodes=True;mat.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=(.75,.78,.8,1);ground.data.materials.append(mat)
 s.world.use_nodes=True;s.world.node_tree.nodes['Background'].inputs[0].default_value=(.65,.72,.8,1);s.world.node_tree.nodes['Background'].inputs[1].default_value=.45
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
  p=m.node_tree.nodes['Principled BSDF'];p.inputs['Metallic'].default_value=.22;p.inputs['Roughness'].default_value=.37
 goal=bpy.data.materials.get('Bramki — metal lakierowany').node_tree.nodes['Principled BSDF'];goal.inputs['Base Color'].default_value=rgb('#bec5ca');goal.inputs['Metallic'].default_value=.6;goal.inputs['Roughness'].default_value=.3
 bpy.ops.object.camera_add(location=(10,9,6.5));camera=bpy.context.object;target=Vector((0,0,.65 if model==180 else .35));camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.type='ORTHO';camera.data.sensor_fit='HORIZONTAL';s.camera=camera;bpy.context.view_layer.update()
 inv=camera.matrix_world.inverted();lo=np.array([np.inf,np.inf]);hi=np.array([-np.inf,-np.inf])
 for o in objects:
  co=np.empty(len(o.data.vertices)*3,dtype=np.float32);o.data.vertices.foreach_get('co',co);co=co.reshape(-1,3);m=np.array(inv@o.matrix_world);projected=co@m[:3,:3].T+m[:3,3];lo=np.minimum(lo,projected[:,:2].min(axis=0));hi=np.maximum(hi,projected[:,:2].max(axis=0))
 camera.data.ortho_scale=max((hi[0]-lo[0])/.85,(hi[1]-lo[1])*ASPECT/.79);camera.location+=camera.rotation_euler.to_matrix()@Vector(((hi[0]+lo[0])/2,(hi[1]+lo[1])/2,0));bpy.context.view_layer.update();pose=[list(row)for row in camera.matrix_world]
 s.render.engine='CYCLES';s.cycles.samples=48;s.cycles.use_denoising=True;s.cycles.seed=0;s.render.use_persistent_data=True;s.render.resolution_x=W;s.render.resolution_y=H;s.render.resolution_percentage=100;s.render.film_transparent=True;s.render.image_settings.file_format='PNG';s.render.image_settings.color_mode='RGBA';s.view_settings.view_transform='Filmic';s.view_settings.look='Medium High Contrast'
 # Feather only the far shadow tail, outside the safely fitted product.
 s.use_nodes=True;n=s.node_tree.nodes;n.clear();l=s.node_tree.links;layers=n.new('CompositorNodeRLayers');mask=n.new('CompositorNodeBoxMask');mask.x=.5;mask.y=.5;mask.width=.98;mask.height=.98/ASPECT;blur=n.new('CompositorNodeBlur');blur.filter_type='GAUSS';blur.size_x=20;blur.size_y=20;l.new(mask.outputs['Mask'],blur.inputs['Image']);multiply=n.new('CompositorNodeMath');multiply.operation='MULTIPLY';l.new(layers.outputs['Alpha'],multiply.inputs[0]);l.new(blur.outputs['Image'],multiply.inputs[1]);alpha=n.new('CompositorNodeSetAlpha');alpha.mode='REPLACE_ALPHA';l.new(layers.outputs['Image'],alpha.inputs['Image']);l.new(multiply.outputs[0],alpha.inputs['Alpha']);comp=n.new('CompositorNodeComposite');l.new(alpha.outputs['Image'],comp.inputs['Image'])
 for coat,hex in PALETTE.items():
  for m in paint:m.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=rgb(hex)
  assert pose==[list(row)for row in camera.matrix_world]
  assert before=={o.name:(len(o.data.vertices),len(o.data.polygons),list(o.matrix_world))for o in objects}
  path=OUT/f'cage-{model}-{coat}.png';s.render.filepath=str(path);bpy.ops.render.render(write_still=True)
  rows.append({'product':f'Panna Cage {model}','coat':coat,'hex':hex,'source':str(source.relative_to(ROOT)),'source_sha256':hashlib.sha256(source.read_bytes()).hexdigest(),'geometry_unchanged':True,'camera_matrix':pose,'image':path.name});(OUT/'manifest.json').write_text(json.dumps({'revision':'CAGE-HERO-3','dimensions':[W,H],'transparent':True,'shadow_catcher':True,'renders':rows},indent=2)+'\n');print('HERO_READY',model,coat,flush=True)
print('ALL_HEROES_READY',flush=True)
