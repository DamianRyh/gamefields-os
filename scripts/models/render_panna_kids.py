"""Render owner-supplied source geometry to images; never publish GLB assets."""
from pathlib import Path
import bpy
from mathutils import Vector
ROOT = Path(__file__).resolve().parents[2]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(ROOT/'assets/private/gamefields/source/panna-kids-o1.glb'))
meshes = [o for o in bpy.context.scene.objects if o.type == 'MESH']
points = [o.matrix_world @ Vector(v) for o in meshes for v in o.bound_box]
lo = Vector(tuple(min(p[i] for p in points) for i in range(3)))
hi = Vector(tuple(max(p[i] for p in points) for i in range(3)))
center = (lo+hi)/2
span = max(hi.x-lo.x,hi.y-lo.y)
bpy.ops.mesh.primitive_plane_add(size=200, location=(center.x,center.y,lo.z-.015))
floor=bpy.context.object
mat=bpy.data.materials.new('Studio backdrop');mat.diffuse_color=(.82,.81,.77,1);floor.data.materials.append(mat)
scene=bpy.context.scene
scene.render.engine='CYCLES';scene.cycles.samples=64;scene.cycles.use_denoising=False
scene.world=bpy.data.worlds.new('Daylight');scene.world.use_nodes=True
scene.world.node_tree.nodes['Background'].inputs[0].default_value=(.86,.88,.91,1)
scene.world.node_tree.nodes['Background'].inputs[1].default_value=.7
for name,position,power,size in [('Key',(-4,-5,9),1600,7),('Fill',(4,3,6),900,5)]:
 bpy.ops.object.light_add(type='AREA',location=center+Vector(position))
 lamp=bpy.context.object;lamp.name=name;lamp.data.energy=power;lamp.data.shape='DISK';lamp.data.size=size
 lamp.rotation_euler=(center-lamp.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add();scene.camera=bpy.context.object
scene.camera.data.type='ORTHO';scene.camera.data.ortho_scale=span*1.38
scene.render.threads_mode='FIXED';scene.render.threads=4
scene.render.resolution_x=1400;scene.render.resolution_y=1100;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.view_settings.view_transform='AgX'
out=ROOT/'.sites-runtime/panna-kids-render';out.mkdir(parents=True,exist_ok=True)
for name,offset in [('perspective',(1,-1.3,1.05)),('overhead',(0,-.001,2)),('detail',(1,-1.5,.38))]:
 scene.camera.location=center+Vector(offset)*span
 scene.camera.rotation_euler=(center-scene.camera.location).to_track_quat('-Z','Y').to_euler()
 scene.render.filepath=str(out/(name+'.png'));bpy.ops.render.render(write_still=True)
