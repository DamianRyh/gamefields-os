import bpy,json,hashlib,math
from pathlib import Path
BASE=Path('/workspace/gamefields-colour-preview-v4');SOURCES=Path('/workspace/gamefields-presentation-v3')
PALETTE={'gray':{'label':'Szary','hex':'#929696'},'blue':{'label':'Niebieski','hex':'#2469A6','source_palette':'Miami'},'green':{'label':'Zielony','hex':'#667451','source_palette':'Earth'}}
def linear(n):return n/12.92 if n<=.04045 else ((n+.055)/1.055)**2.4
def rgb(h):return [linear(int(h[i:i+2],16)/255) for i in [1,3,5]]
def hexcolor(c):return '#'+''.join(f'{round((v*12.92 if v<=.0031308 else 1.055*v**(1/2.4)-.055)*255):02X}' for v in c[:3])
rows=[]
for product in ['o1','p1']:
 path=SOURCES/f'{product}_presentation.blend';bpy.ops.wm.open_mainfile(filepath=str(path));scene=bpy.context.scene;scene.camera=bpy.data.objects['WIDE_DEFAULT'];scene.render.resolution_x=1920;scene.render.resolution_y=1080;scene.render.resolution_percentage=100;scene.cycles.samples=16;scene.cycles.seed=0;scene.render.use_persistent_data=True
 camera_pose=list(scene.camera.matrix_world);paint=[]
 for material in bpy.data.materials:
  if not material.use_nodes:continue
  p=material.node_tree.nodes.get('Principled BSDF')
  if p is None:continue
  colour=p.inputs['Base Color'].default_value
  if colour[0]>.1 and colour[0]>colour[1]*2 and colour[0]>colour[2]*2:paint.append(material)
 assert len(paint)>=2
 native_red=hexcolor(paint[0].node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value)
 collection=bpy.data.collections['PRODUCT_'+('O1' if product=='o1' else 'P1')];geometry={o.name:(len(o.data.vertices),len(o.data.polygons)) for o in collection.objects if o.type=='MESH'}
 for key,spec in PALETTE.items():
  for material in paint:
   value=(*rgb(spec['hex']),1);material.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=value;material.diffuse_color=value
  assert list(scene.camera.matrix_world)==camera_pose
  assert geometry=={o.name:(len(o.data.vertices),len(o.data.polygons)) for o in collection.objects if o.type=='MESH'}
  scene.render.filepath=str(BASE/f'{product}_{key}.png');bpy.ops.render.render(write_still=True)
  rows.append({'product':product,'colour':key,**spec,'native_red':native_red,'paint_materials':[m.name for m in paint],'geometry_unchanged':True,'camera_unchanged':True,'camera_matrix':[list(row) for row in camera_pose],'source_hash':hashlib.sha256(path.read_bytes()).hexdigest()});(BASE/'render-manifest.json').write_text(json.dumps({'palette':PALETTE,'renders':rows},indent=2));print('COLOUR_RENDER_READY',product,key,flush=True)
print('ALL_COLOURS_READY',flush=True)
