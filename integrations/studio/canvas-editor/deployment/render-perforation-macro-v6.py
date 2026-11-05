import bpy,math,json
from mathutils import Vector
from pathlib import Path
B=Path('/workspace/gamefields-macro-v6');bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
# RV5-8: 5 mm round holes on staggered 8 mm centres; actual open geometry.
pitch=.008;radius=.0025;thickness=.0015;N=48;verts=[];faces=[]
for row in range(-18,19):
 for col in range(-22,23):
  x=(col+(row%2)*.5)*pitch;y=row*pitch*math.sqrt(3)/2;start=len(verts)
  for z,inner in [(0,False),(0,True),(-thickness,False),(-thickness,True)]:
   for j in range(N):
    a=2*math.pi*j/N
    # Voronoi hexagon with flat right/left sides.
    nearest=((a+math.pi/6)%(math.pi/3))-math.pi/6
    r=radius if inner else (pitch/2)/math.cos(nearest)
    verts.append((x+r*math.cos(a),y+r*math.sin(a),z))
  for j in range(N):
   k=(j+1)%N;faces.extend([(start+j,start+k,start+N+k,start+N+j),(start+2*N+k,start+2*N+j,start+3*N+j,start+3*N+k),(start+N+j,start+N+k,start+3*N+k,start+3*N+j)])
mesh=bpy.data.meshes.new('RV5-8 actual perforation');mesh.from_pydata(verts,[],faces);mesh.update();o=bpy.data.objects.new('Perforated steel sheet macro',mesh);bpy.context.collection.objects.link(o);bpy.context.view_layer.objects.active=o;o.select_set(True)
bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.mesh.remove_doubles(threshold=.0000001);bpy.ops.mesh.normals_make_consistent(inside=False);bpy.ops.object.mode_set(mode='OBJECT')
bevel=o.modifiers.new('Soft finished hole edges','BEVEL');bevel.width=.00006;bevel.segments=2;bevel.limit_method='ANGLE'
m=bpy.data.materials.new('Powder coated perforated steel');m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF');p.inputs['Metallic'].default_value=.55;p.inputs['Roughness'].default_value=.38
noise=m.node_tree.nodes.new('ShaderNodeTexNoise');noise.inputs['Scale'].default_value=2400;bump=m.node_tree.nodes.new('ShaderNodeBump');bump.inputs['Strength'].default_value=.12;bump.inputs['Distance'].default_value=.000025;m.node_tree.links.new(noise.outputs['Fac'],bump.inputs['Height']);m.node_tree.links.new(bump.outputs['Normal'],p.inputs['Normal']);o.data.materials.append(m)
bpy.ops.object.camera_add(location=(0,-.10,.26));cam=bpy.context.object;cam.rotation_euler=(Vector((0,0,0))-cam.location).to_track_quat('-Z','Y').to_euler();cam.data.type='ORTHO';cam.data.ortho_scale=.14
s=bpy.context.scene;s.camera=cam
for name,pos,power,size in [('Key',(-.15,-.15,.25),15,.22),('Fill',(.2,.05,.15),8,.18)]:
 bpy.ops.object.light_add(type='AREA',location=pos);l=bpy.context.object;l.name=name;l.data.energy=power;l.data.shape='DISK';l.data.size=size;l.rotation_euler=(-l.location).to_track_quat('-Z','Y').to_euler()
s.world.use_nodes=True;s.world.node_tree.nodes['Background'].inputs[0].default_value=(.7,.75,.8,1);s.world.node_tree.nodes['Background'].inputs[1].default_value=.35
s.render.engine='CYCLES';s.cycles.samples=32;s.cycles.use_denoising=False;s.cycles.seed=0;s.render.use_persistent_data=True;s.render.resolution_x=1600;s.render.resolution_y=900;s.render.resolution_percentage=100;s.render.film_transparent=True;s.render.image_settings.file_format='PNG';s.render.image_settings.color_mode='RGBA';s.view_settings.view_transform='AgX'
def lin(x):return x/12.92 if x<=.04045 else ((x+.055)/1.055)**2.4
palette={'gray':'#929696','red':'#C81726','blue':'#2469A6','green':'#667451'}
for colour,h in palette.items():
 p.inputs['Base Color'].default_value=(*[lin(int(h[i:i+2],16)/255) for i in [1,3,5]],1);s.render.filepath=str(B/(colour+'.png'));bpy.ops.render.render(write_still=True);print('READY',colour,flush=True)
(B/'manifest.json').write_text(json.dumps({'perforation_diameter_mm':5,'pitch_mm':8,'thickness_mm':1.5,'thickness_note':'visualisation assumption','palette':palette,'camera_fixed':True,'background':'transparent','no_frames_posts_or_other_court_parts':True},indent=2))
