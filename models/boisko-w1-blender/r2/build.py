"""Panna Ring presentation assembly from W-002, W-005, W-006 and RW1 details."""
import json
import math
from pathlib import Path

import bmesh
import bpy
from mathutils import Vector

OUT = Path(__file__).resolve().parent
R, H = 2.520, 1.000
PITCH, TILE_Y = .008, .008 * math.sqrt(3)
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = "METRIC"
scene["Drawing"] = "BOISKO W-1, 01-2012 | W-001–W-006"

def collection(name):
    coll = bpy.data.collections.new(name)
    scene.collection.children.link(coll)
    return coll

structure = collection("W-1 | konstrukcja")
goal_parts = collection("BR2 | dwie bramki")
hardware_parts = collection("E1 i ST1 | łączenia")
studio = collection("Studio | kamery i światło")
roles = {"panels": ("Panele | RV5-8", "#D9142B", .2, .43),
         "frame": ("Rama | lakier proszkowy", "#2B2226", .24, .37),
         "goals": ("Bramki | lakier proszkowy", "#2B2226", .24, .38),
         "hardware": ("Łączniki | ocynk", "#A0A5A6", .74, .32)}

def make_material(label, hex_color, metal, roughness):
    m = bpy.data.materials.new(label)
    m.use_nodes = True
    rgb = [int(hex_color[i:i+2],16)/255 for i in (1,3,5)]
    m.diffuse_color = (*[(c/12.92 if c<=.04045 else ((c+.055)/1.055)**2.4) for c in rgb],1)
    p = m.node_tree.nodes["Principled BSDF"]
    p.inputs["Base Color"].default_value = m.diffuse_color
    p.inputs["Metallic"].default_value = metal
    p.inputs["Roughness"].default_value = roughness
    return m

materials = {key:make_material(*values) for key,values in roles.items()}
n = 128
pattern = bpy.data.images.new("RV5-8 | Ø5 mm", width=n,height=n,alpha=True)
pixels = []
for row in range(n):
    for col in range(n):
        u, v = PITCH*(col+.5)/n, TILE_Y*(row+.5)/n
        d = min(math.hypot((u-x+PITCH/2)%PITCH-PITCH/2, (v-y+TILE_Y/2)%TILE_Y-TILE_Y/2)
                for x,y in [(0,0),(PITCH/2,TILE_Y/2)])
        pixels.extend((1,1,1,min(1,max(0,.5+(d-.0025)/.00010))))
pattern.pixels.foreach_set(pixels)
pattern.pack()
panel_mat = materials["panels"]
panel_mat.blend_method = "CLIP"
panel_mat.alpha_threshold = .50
nodes = panel_mat.node_tree.nodes
texture = nodes.new("ShaderNodeTexImage")
texture.image = pattern
texture.extension = "REPEAT"
uv = nodes.new("ShaderNodeUVMap")
uv.uv_map = "Perforacja RV5-8"
panel_mat.node_tree.links.new(uv.outputs["UV"],texture.inputs["Vector"])
panel_mat.node_tree.links.new(texture.outputs["Alpha"],nodes["Principled BSDF"].inputs["Alpha"])

def polar(r,t,z):
    return (r*math.sin(t),r*math.cos(t),z)

def tag(o, name, role, coll=structure):
    o.name = name
    for c in list(o.users_collection):
        c.objects.unlink(o)
    coll.objects.link(o)
    o["group"],o["sourceId"],o["artwork"] = role,name,role=="panels"
    o.data.materials.append(materials[role])
    return o

def mesh(name, role, vertices, faces):
    data = bpy.data.meshes.new(name)
    data.from_pydata(vertices,[],faces)
    data.update()
    bm = bmesh.new()
    bm.from_mesh(data)
    bmesh.ops.recalc_face_normals(bm,faces=list(bm.faces))
    bm.to_mesh(data)
    bm.free()
    return tag(bpy.data.objects.new(name,data),name,role)

def bevel(obj, radius):
    obj.data.use_auto_smooth = True
    mod = obj.modifiers.new("Promień krawędzi", "BEVEL")
    mod.width, mod.segments, mod.limit_method = radius,2,"ANGLE"
    mod.harden_normals = True
    obj.modifiers.new("Normalne ważone","WEIGHTED_NORMAL")

def sweep(name,a,b,r0,r1,z0,z1,role):
    steps=max(4,math.ceil((b-a)*100))
    vertices=[polar(r,a+(b-a)*i/steps,z) for i in range(steps+1)
              for r,z in [(r0,z0),(r1,z0),(r1,z1),(r0,z1)]]
    faces=[(4*i+j,4*i+(j+1)%4,4*(i+1)+(j+1)%4,4*(i+1)+j)
           for i in range(steps) for j in range(4)]
    faces += [(3,2,1,0),tuple(4*steps+j for j in range(4))]
    obj=mesh(name,role,vertices,faces)
    if role=="panels":
        artwork=obj.data.uv_layers.new(name="UVMap")
        perforation=obj.data.uv_layers.new(name="Perforacja RV5-8")
        for loop in obj.data.loops:
            co=obj.data.vertices[loop.vertex_index].co
            t=(loop.vertex_index//4)/steps
            artwork.data[loop.index].uv=(t,(co.z-z0)/(z1-z0))
            perforation.data[loop.index].uv=(t*(b-a)*(r0+r1)/2/PITCH,(co.z-z0)/TILE_Y)
    else:
        bevel(obj,.0012)
    return obj

def box(name,role,pos,size,theta=0,coll=structure,radius=.0012):
    bpy.ops.mesh.primitive_cube_add(size=1,location=pos)
    o=bpy.context.object
    o.dimensions=size
    o.rotation_euler.z=theta
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    tag(o,name,role,coll)
    bevel(o,radius)
    return o

def bolt(name,base,normal):
    normal=Vector(normal)
    for label,radius,thick,offset,segments in [("podkładka",.008,.0016,.0008,12),("M8",.0065,.0048,.0038,6)]:
        bpy.ops.mesh.primitive_cylinder_add(vertices=segments,radius=radius,depth=thick,
            location=Vector(base)+offset*normal,rotation=normal.to_track_quat("Z","Y").to_euler())
        tag(bpy.context.object,name+" "+label,"hardware",hardware_parts)
        bevel(bpy.context.object,.00045)

def rail(name,a,b,base):
    return sweep(name,a,b,R-.025,R+.025,base,base+.03,"frame")

def vertical(name,t,start,end,depth=.05,width=.03):
    return box(name,"frame",polar(R,t,(start+end)/2),(width,depth,end-start),-t)

def faces(name,a,b,z0,z1):
    for side,offset in [("wewnętrzna",-.023),("zewnętrzna",.023)]:
        sweep(f"{name} | blacha {side}",a,b,R+offset-.001,R+offset+.001,z0,z1,"panels")

sector=math.pi/4
# RW2 middle arc is 33 degrees on the part drawing. Keep the assembled 45° pitch.
goal_half=math.radians(16.5)
for i in range(8):
    c=i*sector
    a,b=c-sector/2,c+sector/2
    goal=i in (0,4)
    name=("RW2" if goal else "RW1")+f" {i+1:02d}"
    top=rail(name+" | wieniec górny",a,b,.97)
    top["wieniec"]=True
    for sign,t in [(-1,a),(1,b)]:
        vertical(f"{name} | słupek {sign}",t-sign*.015/R,0,H)
    if goal:
        for sign,aa,bb in [(-1,a,c-goal_half),(1,c+goal_half,b)]:
            rail(f"{name} | profil dolny {sign}",aa,bb,0)
            faces(f"{name} | skrzydło {sign}",aa+.014/R,bb-.014/R,.029,.971)
            t=c+sign*goal_half
            vertical(f"{name} | ościeże {sign}",t,0,.97,.05,.05)
            box(f"{name} | stopa ościeża {sign}","frame",polar(R,t,.0025),(.1,.1,.005),-t)
        rail(name+" | nadproże",c-goal_half,c+goal_half,.50)
        faces(name+" | nadproże",c-goal_half+.02/R,c+goal_half-.02/R,.529,.971)
    else:
        rail(name+" | profil dolny",a,b,0)
        faces(name,a+.014/R,b-.014/R,.029,.971)
        for j,t in enumerate((a+(b-a)*14/44,b-(b-a)*14/44),1):
            vertical(f"{name} | żebro {j}",t,.030,.970,.04)
    # W-006: two 40×20×3 inserts, separate top cap and base plate.
    box(f"ST1 {i+1} | stopa","frame",polar(R,a,.0025),(.130,.080,.005),-a,hardware_parts)
    box(f"E1 {i+1} | pokrywa","frame",polar(R,a,.9975),(.070,.050,.005),-a,hardware_parts)
    for j in (-1,1):
        t=a+j*.020/R
        for prefix,z in [("ST1",.055),("E1",.945)]:
            box(f"{prefix} {i+1} | wkład {j}","frame",polar(R+.016,t,z),(.020,.040,.10),-t,hardware_parts)
            bolt(f"{prefix} {i+1}.{j}",polar(R+.036,t,z),polar(1,t,0))

def tube(name,points):
    cu=bpy.data.curves.new(name,"CURVE")
    cu.dimensions="3D"
    cu.bevel_depth,cu.bevel_resolution,cu.use_fill_caps=.0212,3,True
    spl=cu.splines.new("POLY")
    spl.points.add(len(points)-1)
    for point,co in zip(spl.points,points):
        point.co=(*co,1)
    spl.use_smooth=True
    tag(bpy.data.objects.new(name,cu),name,"goals",goal_parts)

front=R*math.cos(goal_half)
for sign in (-1,1):
    name=f"BR2 {sign}"
    def pt(x,d,z):
        return (x,sign*(front+d),z)
    for side in (-1,1):
        x=side*.7363
        points=[pt(x,0,.4838)]
        for i in range(25):
            t=math.pi/2-i*math.pi/48
            points.append(pt(x,.333+.15*math.cos(t),.3338+.15*math.sin(t)))
        points.append(pt(x,.483,.005))
        tube(f"{name} | pałąk {side}",points)
        tube(f"{name} | dolna rura {side}",[pt(x,0,.184),pt(x,.483,.184)])
        box(f"{name} | stopa {side}","goals",pt(x,.483,.0025),(.1,.1,.005),coll=goal_parts)
        box(f"{name} | blacha montażowa {side}","goals",pt(x,-.0025,.28),(.05,.005,.450),coll=goal_parts)
        for j,z in enumerate((.105,.405),1):
            bolt(f"{name} | {side}.{j}",pt(x,.001,z),(0,sign,0))
    for j,(d,z) in enumerate(((.176,.4838),(.368,.4797),(.483,.184)),1):
        tube(f"{name} | poprzeczka {j}",[pt(-.7363,d,z),pt(.7363,d,z)])

scene.world=bpy.data.worlds.new("Neutralne studio")
scene.world.use_nodes=True
scene.world.node_tree.nodes["Background"].inputs["Strength"].default_value=.52
for label,loc,power,size in [("Główne",(-2,-4,7),1650,5),("Wypełnienie",(5,1,4),950,5),("Kontra",(-3,4,6),1800,4)]:
    bpy.ops.object.light_add(type="AREA",location=loc)
    o=bpy.context.object
    o.name=label
    o.rotation_euler=(-o.location).to_track_quat("-Z","Y").to_euler()
    o.data.energy,o.data.size=power,size
    for c in list(o.users_collection):c.objects.unlink(o)
    studio.objects.link(o)
bpy.ops.object.camera_add(location=(7,-10,7.0))
cam=bpy.context.object
cam.rotation_euler=(Vector((0,0,.48))-cam.location).to_track_quat("-Z","Y").to_euler()
cam.data.type,cam.data.ortho_scale="ORTHO",8.9
scene.camera=cam
for c in list(cam.users_collection):c.objects.unlink(cam)
studio.objects.link(cam)
scene.render.engine="CYCLES"
scene.cycles.samples=32
scene.cycles.use_denoising=True
scene.render.resolution_x,scene.render.resolution_y=1200,675
scene.render.resolution_percentage=100
scene.render.film_transparent=True
scene.render.image_settings.color_mode="RGBA"
scene.render.filepath="//panna-ring.png"
bpy.context.preferences.filepaths.save_version=0

parts=[*structure.objects,*goal_parts.objects,*hardware_parts.objects]
bpy.context.view_layer.update()
deps=bpy.context.evaluated_depsgraph_get()
bounds={}
for o in parts:
    evaluated=o.evaluated_get(deps)
    m=evaluated.to_mesh()
    points=[o.matrix_world@v.co for v in m.vertices]
    bounds[o.name]=[min(v.z for v in points),max(v.z for v in points)]
    evaluated.to_mesh_clear()
assert min(a for a,b in bounds.values())>=-.000001 and max(b for a,b in bounds.values())<=1.000001
bpy.ops.object.select_all(action="DESELECT")
for o in parts:o.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(OUT/"panna-ring-r2.glb"),export_format="GLB",
    use_selection=True,export_apply=True,export_extras=True)
bpy.ops.export_scene.gltf(filepath=str(OUT/"panna-ring.glb"),export_format="GLB",
    use_selection=True,export_apply=True,export_extras=True,export_draco_mesh_compression_enable=True,
    export_draco_position_quantization=16)
bpy.ops.object.select_all(action="DESELECT")
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/"panna-ring-r2.blend"),compress=True)
bpy.ops.render.render(write_still=True)
cam.location=(4,-5.4,2.35)
cam.rotation_euler=(Vector((.37,-2.4,.46))-cam.location).to_track_quat("-Z","Y").to_euler()
cam.data.ortho_scale=3.0
scene.render.resolution_x,scene.render.resolution_y=1200,820
scene.render.filepath="//panna-ring-detal.png"
bpy.ops.render.render(write_still=True)
(OUT/"bounds.json").write_text(json.dumps(bounds,indent=2)+"\n")
