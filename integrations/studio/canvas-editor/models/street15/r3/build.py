"""Refit both Street Arena 15 goals while preserving the R2 court and floor."""
import json
import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector


OUT = Path(__file__).resolve().parent
BASE = OUT.parent / "street15-r2"
arguments = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
if arguments and len(arguments) != 2:
    raise ValueError("Pass both the R2 blend and JSON paths after --")
blend_path, json_path = map(Path, arguments) if arguments else (
    BASE / "street15-r2.blend", BASE / "street15-r2.json"
)
bpy.ops.wm.open_mainfile(filepath=str(blend_path.resolve()))
scene = bpy.context.scene
structure = bpy.data.collections["Street Arena 15 | konstrukcja"]
old = json.loads(json_path.read_text())
steel = next(o.active_material for o in structure.objects if o.get("group") == "goals")
for obj in list(structure.objects):
    if obj.get("group") == "goals":
        bpy.data.objects.remove(obj, do_unlink=True)

net_material = bpy.data.materials.new("Siatka | plecionka szara")
net_material.use_nodes = True
net_bsdf = net_material.node_tree.nodes.get("Principled BSDF")
net_bsdf.inputs["Base Color"].default_value = (.29, .33, .35, 1)
net_bsdf.inputs["Roughness"].default_value = .86
net_material.diffuse_color = (.29, .33, .35, 1)

def register(obj, part_id, material):
    obj["group"], obj["sourceId"], obj["artwork"] = "goals", part_id, False
    obj.data.materials.append(material)
    return obj

def tubes(paths, radius, resolution, label, part_id, material):
    curve = bpy.data.curves.new(label, "CURVE")
    curve.dimensions = "3D"
    curve.bevel_depth = radius
    curve.bevel_resolution = resolution
    curve.use_fill_caps = True
    for points in paths:
        spline = curve.splines.new("POLY")
        spline.points.add(len(points) - 1)
        for point, coordinates in zip(spline.points, points):
            point.co = (*coordinates, 1)
        spline.use_smooth = True
    obj = bpy.data.objects.new(label, curve)
    structure.objects.link(obj)
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.convert(target="MESH")
    return register(bpy.context.object, part_id, material)

def fittings(center, side, label, part_id, bolt=False):
    if bolt:
        bpy.ops.mesh.primitive_cylinder_add(vertices=6, radius=.008, depth=.009, location=center,
                                           rotation=(0, side * math.pi / 2, 0))
    else:
        bpy.ops.mesh.primitive_cube_add(size=1, location=center)
        bpy.context.object.dimensions = (.016, .14, .078)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    obj = bpy.context.object
    obj.name = label
    for coll in list(obj.users_collection):
        coll.objects.unlink(obj)
    structure.objects.link(obj)
    bevel = obj.modifiers.new("Faza", "BEVEL")
    bevel.width, bevel.segments = (.001 if bolt else .003), 2
    obj.modifiers.new("Normalne", "WEIGHTED_NORMAL")
    return register(obj, part_id, steel)

def arc(a0, a1, steps=8):
    for i in range(steps + 1):
        theta = math.radians(a0 + (a1-a0)*i/steps)
        yield math.cos(theta), math.sin(theta)

for side, name, key in [(-1, "Bramka zachodnia", "goal-west"), (1, "Bramka wschodnia", "goal-east")]:
    def xyz(d, w, h):
        return (side * (7.5 + d), w, h)

    # Panna Court's rounded tube language adapted to a full football goal.
    # Nominal post axes at ±1 m, crossbar axis 1.10 m, rear depth 0.80 m.
    radius = .066
    portal = [xyz(0, -1, .025)]
    portal += [xyz(0, -1 + radius + radius*c, 1.10 - radius + radius*s) for c,s in arc(180,90)]
    portal += [xyz(0, 1 - radius + radius*c, 1.10 - radius + radius*s) for c,s in arc(90,0)]
    portal += [xyz(0, 1, .025)]
    tubes([portal], .025, 3, name + " | łuk słupków i poprzeczki", key + "-portal", steel)

    radius = .115
    base = [xyz(0, -1, .023)]
    base += [xyz(.8 - radius + radius*c, -1 + radius + radius*s, .023) for c,s in arc(-90,0)]
    base += [xyz(.8 - radius + radius*c, 1 - radius + radius*s, .023) for c,s in arc(0,90)]
    base += [xyz(0, 1, .023)]
    tubes([base], .021, 3, name + " | pałąk podstawy", key + "-base", steel)

    # Roof stops at 0.36 m. Sloped supports then carry the net to the rear base.
    supports = [[xyz(0,w,1.055), xyz(.26,w,1.055), xyz(.325,w,1.044),
                 xyz(.375,w,1.008), xyz(.755,w,.069), xyz(.754,w,.036)] for w in [-.972,.972]]
    supports.append([xyz(.347,-.972,1.032), xyz(.347,.972,1.032)])
    tubes(supports, .017, 2, name + " | podpory siatki", key + "-stays", steel)

    # Continuous, slightly slack cords across the roof and down the angled back.
    levels = [.038 + i * (.992 / 10) for i in range(11)]
    widths = [-.963 + 1.926 * i/20 for i in range(21)]
    roof_depth = [.018, .102, .184, .266, .348]
    def rear(h):
        t = (h - .038) / .992
        return .777 - .429*t + .018 * math.sin(math.pi*t)
    def span(w):
        return max(0, 1 - (w/.963)**2)

    cords = []
    for w in widths:
        cords.append([xyz(d,w,1.034-.016*span(w)*math.sin(math.pi*(d-.018)/.33)) for d in roof_depth[:-1]]
                     + [xyz(rear(h)+.024*span(w)*math.sin(math.pi*(h-.038)/.992),w,h) for h in reversed(levels)])
    for h in levels:
        cords.append([xyz(rear(h)+.024*span(w)*math.sin(math.pi*(h-.038)/.992),w,h+.0018) for w in widths])
    for d in roof_depth[:-1]:
        cords.append([xyz(d,w,1.036-.016*span(w)*math.sin(math.pi*(d-.018)/.33)) for w in widths])
    for w in [-.963,.963]:
        for h in levels[:-1]:
            cords.append([xyz(.016 + (rear(h)-.016)*j/7,w,h) for j in range(8)])
        for j in range(8):
            t = j/7
            cords.append([xyz(.016+(rear(h)-.016)*t,w+math.copysign(.002,w),h) for h in levels])
    for w in widths[1:-1:2]:
        cords.append([xyz(.018,w,1.034), xyz(.026,w,1.09), xyz(.015,w,1.119),
                      xyz(-.014,w,1.119), xyz(-.023,w,1.094)])
    for sign in [-1,1]:
        for h in levels[1:-1:2]:
            cords.append([xyz(.016,sign*.963,h), xyz(.024,sign*.993,h),
                          xyz(.012,sign*1.021,h), xyz(-.012,sign*1.019,h)])
    tubes(cords, .0024, 0, name + " | siatka 3D", key + "-net", net_material)

    for sign in [-1, 1]:
        for index, h in enumerate([.17, .84]):
            joint = f"{key}-joint-{sign}-{index}"
            fittings(xyz(.032,sign*1.052,h), side, name + " | płytka montażowa", joint)
            for offset in [-.033,.033]:
                fittings(xyz(.044,sign*1.052+offset,h), side, name + " | łeb śruby", joint + str(offset), bolt=True)

goals = [o for o in structure.objects if o.get("group") == "goals"]
deps = bpy.context.evaluated_depsgraph_get()
result = [part for part in old if part["group"] != "goals"]
for obj in goals:
    evaluated = obj.evaluated_get(deps)
    mesh = evaluated.to_mesh()
    mesh.calc_loop_triangles()
    world = [obj.matrix_world @ vertex.co for vertex in mesh.vertices]
    vertices = [[round(v.x,6), round(v.z,6), round(-v.y,6)] for v in world]
    result.append(dict(id=obj["sourceId"], label=obj.name, group="goals", v=vertices,
                       f=[list(t.vertices) for t in mesh.loop_triangles],
                       uv=[[0,0]] * len(vertices), artwork=False))
    evaluated.to_mesh_clear()
(OUT / "street15-r3.json").write_text(json.dumps(result,separators=(",",":"))+"\n")

bpy.ops.object.select_all(action="DESELECT")
for obj in structure.objects:
    obj.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(OUT/"street15-r3.glb"), export_format="GLB",
                          use_selection=True, export_extras=True, export_apply=True)
bpy.ops.object.select_all(action="DESELECT")
bpy.context.preferences.filepaths.save_version = 0
scene.render.filepath = "//street15-r3.png"
bpy.ops.wm.save_as_mainfile(filepath=str(OUT/"street15-r3.blend"), compress=True)
bpy.ops.render.render(write_still=True)

camera = scene.camera
camera.location = (-11.8, -3.1, 2.6)
camera.rotation_euler = (Vector((-7.69,0,.55))-camera.location).to_track_quat("-Z","Y").to_euler()
camera.data.ortho_scale = 3.45
scene.render.resolution_x, scene.render.resolution_y = 1100, 760
scene.render.filepath = "//street15-r3-goal.png"
bpy.ops.render.render(write_still=True)
