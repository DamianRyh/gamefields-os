import bpy,os,math
from pathlib import Path
from mathutils import Vector
OUT=Path(__file__).resolve().parent
bpy.ops.wm.open_mainfile(filepath=str(OUT/'panna-cage-180-v2.blend'))
scene=bpy.context.scene;scene.cycles.samples=40
panel=bpy.data.materials['Siatka — kolor edytowalny'].node_tree.nodes['Principled BSDF']
def linear(n):return n/12.92 if n<.04045 else ((n+.055)/1.055)**2.4
for name,color in [('default','#7c8584'),('hover','#b90f35')]:
 panel.inputs['Base Color'].default_value=(*[linear(int(color[i:i+2],16)/255)for i in [1,3,5]],1);scene.render.filepath=str(OUT/(name+'.png'));bpy.ops.render.render(write_still=True);print('VERIFIED_RENDER',name,flush=True)
scene.camera.location=(4.6,-3.9,2.3);scene.camera.rotation_euler=(Vector((2.6,-.3,.35))-scene.camera.location).to_track_quat('-Z','Y').to_euler();scene.camera.data.ortho_scale=2.9;scene.render.filepath=str(OUT/'detail-goal.png');bpy.ops.render.render(write_still=True);print('VERIFIED_RENDER goal',flush=True)
