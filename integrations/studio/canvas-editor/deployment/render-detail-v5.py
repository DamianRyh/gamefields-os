import bpy,json
from pathlib import Path
B=Path('/workspace/gamefields-detail-v5');bpy.ops.wm.open_mainfile(filepath='/workspace/panna_P1_v6/blender/Panna_Play_P1.blend');s=bpy.context.scene;s.camera=bpy.data.objects['DETAIL_CORNER'];s.camera.data.ortho_scale=2.2;s.render.resolution_x=1600;s.render.resolution_y=900;s.render.resolution_percentage=100;s.cycles.samples=32;s.cycles.seed=0;s.render.use_persistent_data=True
palette={'gray':'#929696','red':'#C81726','blue':'#2469A6','green':'#667451'}
paint=[]
for m in bpy.data.materials:
 p=m.node_tree.nodes.get('Principled BSDF') if m.use_nodes else None
 if p and p.inputs['Base Color'].default_value[0]>.1 and p.inputs['Base Color'].default_value[0]>p.inputs['Base Color'].default_value[1]*2:paint.append(m)
def lin(x):return x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4
for c,h in palette.items():
 for m in paint:
  rgba=(*[lin(int(h[i:i+2],16)/255) for i in [1,3,5]],1);m.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=rgba;m.diffuse_color=rgba
 s.render.filepath=str(B/(c+'.png'));bpy.ops.render.render(write_still=True);print('READY',c,flush=True)
(B/'manifest.json').write_text(json.dumps({'source':'Panna_Play_P1 v6','camera':'DETAIL_CORNER','scale':2.2,'palette':palette,'geometry_unchanged':True},indent=2))
