import bpy, os, math
from mathutils import Vector
scene=bpy.context.scene
bpy.ops.object.camera_add(location=(20,-24,19))
camera=bpy.context.object
camera.rotation_euler=(Vector((0,0,0))-camera.location).to_track_quat('-Z','Y').to_euler()
camera.data.type='ORTHO';camera.data.ortho_scale=23;scene.camera=camera
for kind,loc,energy in [('AREA',(0,-3,14),2400),('SUN',(5,-5,10),2)]:
 bpy.ops.object.light_add(type=kind,location=loc)
 o=bpy.context.object;o.data.energy=energy
 if kind=='AREA':o.data.size=12
 else:o.rotation_euler=(0.35,-0.4,-0.35)
scene.world.color=(0.3,0.3,0.3)
scene.render.engine='CYCLES';scene.cycles.samples=32;scene.cycles.use_denoising=True
scene.render.resolution_x=1000;scene.render.resolution_y=680;scene.render.resolution_percentage=100
scene.render.film_transparent=True
scene.render.image_settings.file_format='PNG'
scene.render.filepath=os.path.abspath('public/products/street-football-15x10/preview.png')
bpy.ops.render.render(write_still=True)
