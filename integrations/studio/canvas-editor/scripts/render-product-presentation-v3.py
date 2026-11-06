import bpy,json,math,hashlib,sys
import numpy as np
from pathlib import Path
from mathutils import Vector
import argparse
parser=argparse.ArgumentParser();parser.add_argument('--o1',required=True);parser.add_argument('--p1',required=True);parser.add_argument('--output',required=True);args=parser.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else [])
BASE=Path(args.output);BASE.mkdir(parents=True,exist_ok=True)
SOURCES={'o1':args.o1,'p1':args.p1}
ASPECT=16/9;W,H=1920,1080;records=[]
# One rig, matching the accepted Panna Play perspective and shadows.
LIGHTS=[('Key',(1,-4,9),1800,7),('Fill',(-5,-1,5),1100,6),('Rim',(3,6,6),2300,5)]
VIEWS={'DEFAULT':(10,9,6.5),'HOVER':(9,-11,9.5)}
for key,path in SOURCES.items():
 bpy.ops.wm.open_mainfile(filepath=path);scene=bpy.context.scene
 source_hash=hashlib.sha256(Path(path).read_bytes()).hexdigest();product=bpy.data.collections['PRODUCT_'+('O1' if key=='o1' else 'P1')]
 originals=[o for o in product.objects if o.type=='MESH'];assert not any('turf' in o.name.lower() or 'floor' in o.name.lower() for o in originals)
 geometry_before={o.name:(len(o.data.vertices),len(o.data.polygons)) for o in originals}
 for obj in list(scene.objects):
  if obj.type=='LIGHT' or obj.name=='Shadow_catcher':bpy.data.objects.remove(obj,do_unlink=True)
 for name,loc,energy,size in LIGHTS:
  data=bpy.data.lights.new('Unified_'+name,'AREA');data.energy=energy;data.shape='DISK';data.size=size;obj=bpy.data.objects.new('Unified_'+name,data);scene.collection.objects.link(obj);obj.location=loc;obj.rotation_euler=(Vector((0,0,.4))-obj.location).to_track_quat('-Z','Y').to_euler()
 bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.04));stage=bpy.context.object;stage.name='Presentation_shadow_only';stage.is_shadow_catcher=True
 material=bpy.data.materials.new('Unified_shadow_stage');material.use_nodes=True;material.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=(.723055,.768151,.799103,1);stage.data.materials.append(material)
 scene.world.use_nodes=True;scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.65,.72,.8,1);scene.world.node_tree.nodes['Background'].inputs[1].default_value=.45
 scene.render.engine='CYCLES';scene.cycles.samples=16;scene.cycles.use_denoising=False;scene.render.resolution_x=W;scene.render.resolution_y=H;scene.render.resolution_percentage=100;scene.render.film_transparent=True;scene.render.image_settings.file_format='PNG';scene.render.image_settings.color_mode='RGBA';scene.view_settings.view_transform='AgX'
 # Only the shadow tail can reach this feathered outer guard; product stays inside it.
 scene.use_nodes=True;nodes=scene.node_tree.nodes;nodes.clear();links=scene.node_tree.links
 layers=nodes.new('CompositorNodeRLayers');mask=nodes.new('CompositorNodeBoxMask');mask.x=.5;mask.y=.5;mask.mask_width=.92;mask.mask_height=.92/ASPECT
 blur=nodes.new('CompositorNodeBlur');blur.filter_type='GAUSS';blur.size_x=16;blur.size_y=16;links.new(mask.outputs['Mask'],blur.inputs['Image'])
 multiply=nodes.new('CompositorNodeMath');multiply.operation='MULTIPLY';links.new(layers.outputs['Alpha'],multiply.inputs[0]);links.new(blur.outputs['Image'],multiply.inputs[1])
 alpha=nodes.new('CompositorNodeSetAlpha');alpha.mode='REPLACE_ALPHA';links.new(layers.outputs['Image'],alpha.inputs['Image']);links.new(multiply.outputs[0],alpha.inputs['Alpha']);out=nodes.new('CompositorNodeComposite');links.new(alpha.outputs['Image'],out.inputs['Image'])
 for view,pos in VIEWS.items():
  camera=bpy.data.objects.get('WIDE_'+view)
  if camera is None:camera=bpy.data.objects.new('WIDE_'+view,bpy.data.cameras.new('WIDE_'+view));scene.collection.objects.link(camera)
  camera.location=pos;camera.rotation_euler=(Vector((0,0,.35))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.type='ORTHO';camera.data.lens=50;camera.data.sensor_fit='HORIZONTAL';scene.camera=camera;bpy.context.view_layer.update()
  inverse=camera.matrix_world.inverted();lo=np.array([np.inf,np.inf]);hi=np.array([-np.inf,-np.inf])
  for obj in originals:
   co=np.empty(len(obj.data.vertices)*3,dtype=np.float32);obj.data.vertices.foreach_get('co',co);co=co.reshape(-1,3);matrix=np.array(inverse@obj.matrix_world);projected=co@matrix[:3,:3].T+matrix[:3,3];lo=np.minimum(lo,projected[:,:2].min(axis=0));hi=np.maximum(hi,projected[:,:2].max(axis=0))
  camera.data.ortho_scale=max((hi[0]-lo[0])/.82,(hi[1]-lo[1])*ASPECT/.78)
  # Centre the entire product in the image; retain the same rotation and light positions.
  offset=camera.rotation_euler.to_matrix()@Vector(((hi[0]+lo[0])/2,(hi[1]+lo[1])/2,0));camera.location+=offset;bpy.context.view_layer.update()
  filepath=BASE/(key+'_'+view+'.png');scene.render.filepath=str(filepath);bpy.ops.render.render(write_still=True)
  records.append({'product':key,'view':view,'source_blend_sha256':source_hash,'camera_rotation':list(camera.rotation_euler),'ortho_scale':camera.data.ortho_scale,'size':[W,H],'shadow_plane_z':-.04,'geometry_unchanged':geometry_before=={o.name:(len(o.data.vertices),len(o.data.polygons)) for o in originals},'image':str(filepath)})
  (BASE/'render_manifest.json').write_text(json.dumps({'lights':LIGHTS,'aspect_ratio':'16:9','shadow_edge_guard':'feathered outer shadow tail only; no product cropping','renders':records},indent=2))
  print('WIDE_RENDER_READY',key,view,flush=True)
 bpy.ops.wm.save_as_mainfile(filepath=str(BASE/(key+'_presentation.blend')))
print('ALL_WIDE_RENDERS_READY',flush=True)
