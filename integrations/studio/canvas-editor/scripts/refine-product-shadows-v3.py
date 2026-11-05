"""Native compositor refinement of the product render's shadow only."""
import bpy
from pathlib import Path
import argparse,sys
parser=argparse.ArgumentParser();parser.add_argument('--directory',required=True);args=parser.parse_args(sys.argv[sys.argv.index('--')+1:] if '--' in sys.argv else []);BASE=Path(args.directory)
s=bpy.context.scene;bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False);bpy.ops.object.camera_add();s.camera=bpy.context.object;s.render.engine='CYCLES';s.cycles.samples=1;s.cycles.use_denoising=False;s.render.resolution_x=1920;s.render.resolution_y=1080;s.render.resolution_percentage=100;s.render.film_transparent=True;s.render.image_settings.file_format='PNG';s.render.image_settings.color_mode='RGBA';s.view_settings.view_transform='Standard';s.view_settings.look='None';s.view_settings.exposure=0;s.view_settings.gamma=1;s.use_nodes=True
n=s.node_tree.nodes;n.clear();links=s.node_tree.links;image=n.new('CompositorNodeImage');core=n.new('CompositorNodeMath');core.operation='GREATER_THAN';core.inputs[1].default_value=.96;links.new(image.outputs['Alpha'],core.inputs[0])
grow=n.new('CompositorNodeDilateErode');grow.mode='DISTANCE';grow.distance=32;links.new(core.outputs[0],grow.inputs['Mask']);blur=n.new('CompositorNodeBlur');blur.filter_type='GAUSS';blur.size_x=64;blur.size_y=64;links.new(grow.outputs['Mask'],blur.inputs['Image'])
protect=n.new('CompositorNodeMath');protect.operation='MAXIMUM';links.new(core.outputs[0],protect.inputs[0]);links.new(blur.outputs['Image'],protect.inputs[1]);alpha=n.new('CompositorNodeMath');alpha.operation='MULTIPLY';links.new(image.outputs['Alpha'],alpha.inputs[0]);links.new(protect.outputs[0],alpha.inputs[1])
straight=n.new('CompositorNodePremulKey');straight.mapping='PREMUL_TO_STRAIGHT';links.new(image.outputs['Image'],straight.inputs['Image']);setalpha=n.new('CompositorNodeSetAlpha');setalpha.mode='REPLACE_ALPHA';links.new(straight.outputs['Image'],setalpha.inputs['Image']);links.new(alpha.outputs[0],setalpha.inputs['Alpha']);premul=n.new('CompositorNodePremulKey');premul.mapping='STRAIGHT_TO_PREMUL';links.new(setalpha.outputs['Image'],premul.inputs['Image']);out=n.new('CompositorNodeComposite');links.new(premul.outputs['Image'],out.inputs['Image'])
for product in ['o1','p1']:
 for view in ['DEFAULT','HOVER']:
  image.image=bpy.data.images.load(str(BASE/f'{product}_{view}.png'),check_existing=False);s.render.filepath=str(BASE/f'{product}_{view}_SOFT.png');bpy.ops.render.render(write_still=True);print('SOFT_SHADOW_READY',product,view,flush=True)
