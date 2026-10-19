import bpy,os
from mathutils import Vector
OUT=os.path.dirname(os.path.abspath(__file__));scene=bpy.context.scene
bpy.ops.object.camera_add(location=(8,10,7));camera=bpy.context.object;camera.name='Kamera Panna Circle Cage 1.0'
camera.rotation_euler=(Vector((0,0,.3))-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.type='ORTHO';camera.data.ortho_scale=9;scene.camera=camera
bpy.ops.object.light_add(type='AREA',location=(0,-2,8));bpy.context.object.data.energy=1800;bpy.context.object.data.size=8
bpy.ops.object.light_add(type='SUN',location=(5,-3,6));bpy.context.object.data.energy=2;bpy.context.object.rotation_euler=(.4,-.4,-.3)
scene.world.color=(.4,.4,.4);scene.render.engine='CYCLES';scene.cycles.samples=32;scene.cycles.use_denoising=True
scene.render.resolution_x=1200;scene.render.resolution_y=900;scene.render.resolution_percentage=100;scene.render.film_transparent=True
scene.render.filepath=OUT+'/podglad.png';bpy.ops.render.render(write_still=True)
