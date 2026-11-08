"""Build the Gamefields presentation revision of the 15 × 10 m assembly."""
import json
import math
from pathlib import Path

import bpy
from mathutils import Vector

OUT = Path(__file__).resolve().parent
BASE = json.loads((OUT.parent / "studio-mesh.json").read_text())
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.unit_settings.system = "METRIC"

def collection(name):
    result = bpy.data.collections.new(name)
    scene.collection.children.link(result)
    return result

structure = collection("Street Arena 15 | konstrukcja")
surface = collection("Street Arena 15 | nawierzchnia")
presentation = collection("Studio | światło i kamera")

def material(name, color, metallic, roughness):
    result = bpy.data.materials.new(name)
    result.use_nodes = True
    shader = result.node_tree.nodes.get("Principled BSDF")
    shader.inputs["Base Color"].default_value = (*color, 1)
    shader.inputs["Metallic"].default_value = metallic
    shader.inputs["Roughness"].default_value = roughness
    result.diffuse_color = (*color, 1)
    return result

materials = {
    "frame": material("Rama | lakier proszkowy", (.036, .047, .056), .27, .37),
    "goals": material("Bramki | lakier proszkowy", (.036, .047, .056), .27, .38),
    "panels": material("Panele | czerwień", (.56, .012, .035), .08, .45),
    "floor": material("Nawierzchnia", (.14, .19, .17), 0, .80),
    "surface-edge": material("Krawędź nawierzchni", (.14, .15, .14), 0, .82),
}

def finish(obj, part_id, group, target=structure):
    for previous in list(obj.users_collection):
        previous.objects.unlink(obj)
    target.objects.link(obj)
    obj.data.materials.append(materials[group])
    obj["sourceId"], obj["group"], obj["artwork"] = part_id, group, group == "panels"
    return obj

def box(name, part_id, group, center, size, angle=0, bevel=.004):
    bpy.ops.mesh.primitive_cube_add(size=1, location=center)
    obj = bpy.context.object
    obj.name = name
    obj.dimensions = size
    obj.rotation_euler.z = angle
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    modifier = obj.modifiers.new("Faza profilu", "BEVEL")
    modifier.width, modifier.segments = bevel, 2
    modifier.harden_normals = True
    obj.modifiers.new("Normalne płaszczyzn", "WEIGHTED_NORMAL")
    return finish(obj, part_id, group)

# Same clipped footprint and 24 modules as the existing design. The inside of the
# longest rail remains outside the field. Matching anchors are shared at joints.
outline = [(-7.5, -4.35), (-6.85, -5), (6.85, -5), (7.5, -4.35),
           (7.5, 4.35), (6.85, 5), (-6.85, 5), (-7.5, 4.35)]
panel_sources = [part for part in BASE if part["group"] == "panels"]
panel_centers = {
    part["id"]: Vector(tuple((min(axis) + max(axis)) / 2 for axis in zip(*part["v"])))
    for part in panel_sources
}
posts = {}

def segment(a, b):
    a, b = Vector(a), Vector(b)
    direction = (b - a).normalized()
    normal = Vector((direction.y, -direction.x))
    length = (b - a).length
    count = math.ceil(length / 2.3)
    step = length / count
    angle = math.atan2(direction.y, direction.x)

    def position(along, offset, height):
        point = a + direction * along + normal * offset
        return (*point, height)

    for i in range(count):
        middle = (i + .5) * step
        x, y, z = position(middle, .029, .5)
        center = Vector((x, z, -y))
        old = min(panel_sources, key=lambda panel: (panel_centers[panel["id"]] - center).length_squared)
        panel_sources.remove(old)
        part = old["id"]
        panel = box(old["label"], part, "panels", position(middle, .029, .5),
                    (step - .041, .018, .904), angle, .0025)
        panel["panelWidth"] = step - .041
        for suffix, z in [("bottom", .027), ("top", .973)]:
            box("Profil obwodowy " + suffix, part + "-" + suffix, "frame",
                position(middle, .029, z), (step - .028, .053, .054), angle)
        if step > 1.4:
            for side in [-1, 1]:
                box("Żebro modułu", part + "-rib-" + str(side), "frame",
                    position(middle + side * step / 6, .029, .5), (.036, .042, .908), angle, .003)
            for end in [-1, 1]:
                for top in [-1, 1]:
                    brace = box("Ukośne wzmocnienie", f"{part}-brace-{end}-{top}", "frame",
                                position(middle + end * (step / 2 - .082), .029, .5 + top * .401),
                                (.204, .044, .037), angle, .003)
                    brace.rotation_euler.y = -top * end * math.pi / 4
        for end in (i * step, (i + 1) * step):
            point = a + direction * end
            key = tuple(round(axis, 6) for axis in point)
            posts.setdefault(key, []).append((point, normal, angle))

for i, a in enumerate(outline):
    b = outline[(i + 1) % len(outline)]
    if a[0] == b[0]:
        ys = (-4.35, -1, 1, 4.35) if a[1] < b[1] else (4.35, 1, -1, -4.35)
        segment((a[0], ys[0]), (a[0], ys[1]))
        segment((a[0], ys[2]), (a[0], ys[3]))
    else:
        segment(a, b)
assert not panel_sources

for i, anchors in enumerate(posts.values(), 1):
    point, normal, angle = anchors[0]
    if len(anchors) > 1:
        normal = (normal + anchors[1][1]).normalized()
    x, y = point + .032 * normal
    # Place the post at the module edge without narrowing the goal mouth.
    if abs(abs(x) - 7.532) < .01 and abs(abs(y) - 1) < .01:
        y += math.copysign(.028, y)
    name = f"Słupek {i:02d}"
    box(name, f"post-{i}", "frame", (x, y, .503), (.064, .058, .994), angle)
    box(name + " | stopa", f"foot-{i}", "frame", (x, y, .006), (.115, .090, .012), angle, .003)

def tube(points, radius, name, part_id):
    curve = bpy.data.curves.new(name, "CURVE")
    curve.dimensions = "3D"
    curve.bevel_depth, curve.bevel_resolution = radius, 2
    curve.use_fill_caps = True
    line = curve.splines.new("POLY")
    line.points.add(len(points) - 1)
    for point, xyz in zip(line.points, points):
        point.co = (*xyz, 1)
    obj = bpy.data.objects.new(name, curve)
    structure.objects.link(obj)
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.convert(target="MESH")
    return finish(bpy.context.object, part_id, "goals")

for side in [-1, 1]:
    name = "Bramka lewa" if side < 0 else "Bramka prawa"
    key = "goal-west" if side < 0 else "goal-east"
    def xyz(depth, width, height):
        return (side * (7.5 + depth), width, height)

    r = .135
    for index, z in enumerate([.025, .55, 1.10]):
        hoop = [xyz(0, -1, z)]
        for center, angles in [(-1 + r, (-90, 0)), (1 - r, (0, 90))]:
            for i in range(7):
                angle = math.radians(angles[0] + i * (angles[1] - angles[0]) / 6)
                hoop.append(xyz(.8 - r + r * math.cos(angle), center + r * math.sin(angle), z))
        hoop.append(xyz(0, 1, z))
        tube(hoop, .025 if index != 1 else .013, name + " | pałąk", f"{key}-hoop-{index}")
    tube([xyz(0, -1, 1.10), xyz(0, 1, 1.10)], .025, name + " | poprzeczka", key + "-crossbar")
    for width in [-1, 1]:
        tube([xyz(0, width, .025), xyz(0, width, 1.10)], .025, name + " | słupek", f"{key}-post-{width}")
    for j in range(-5, 6):
        width = j * .157
        tube([xyz(.8, width, .025), xyz(.8, width, 1.10)], .011, name + " | wypełnienie tyłu", f"{key}-rear-{j}")
        tube([xyz(0, width, 1.10), xyz(.8, width, 1.10)], .011, name + " | wypełnienie góry", f"{key}-roof-{j}")

# Preserve the existing UVs, exact playing polygon and texture origin.
for old in BASE:
    if old["group"] not in ("floor", "foundation"):
        continue
    group = "floor" if old["group"] == "floor" else "surface-edge"
    coords = [(x, -z, max(y, -.065)) for x, y, z in old["v"]]
    mesh = bpy.data.meshes.new(group)
    mesh.from_pydata(coords, [], old["f"])
    obj = bpy.data.objects.new(old["label"], mesh)
    finish(obj, old["id"], group, surface)

def export_json():
    result = []
    deps = bpy.context.evaluated_depsgraph_get()
    for obj in [*structure.objects, *surface.objects]:
        evaluated = obj.evaluated_get(deps)
        mesh = evaluated.to_mesh()
        mesh.calc_loop_triangles()
        world = [obj.matrix_world @ v.co for v in mesh.vertices]
        vertices = [[round(v.x, 6), round(v.z, 6), round(-v.y, 6)] for v in world]
        group = obj["group"]
        uvs = [[(v.x + 7.5) / 15, (v.y + 5) / 10] for v in world]
        if group == "panels":
            uvs = [[v.co.x / obj["panelWidth"] + .5, v.co.z / .904 + .5] for v in mesh.vertices]
        uv = obj.data.uv_layers.new(name="Gamefields UV") if obj.data.uv_layers.active is None else obj.data.uv_layers.active
        if group == "panels":
            for loop in obj.data.loops:
                v = obj.data.vertices[loop.vertex_index].co
                uv.data[loop.index].uv = (v.x / obj["panelWidth"] + .5, v.z / .904 + .5)
        elif group in ("floor", "surface-edge"):
            for loop in obj.data.loops:
                v = obj.data.vertices[loop.vertex_index].co
                uv.data[loop.index].uv = ((v.x + 7.5) / 15, (v.y + 5) / 10)
        result.append(dict(id=obj["sourceId"], label=obj.name, group=group, v=vertices,
                           f=[list(t.vertices) for t in mesh.loop_triangles], uv=uvs, artwork=obj["artwork"]))
        evaluated.to_mesh_clear()
    (OUT / "street15-r2.json").write_text(json.dumps(result, separators=(",", ":")) + "\n")

export_json()
bpy.ops.object.select_all(action="DESELECT")
for obj in structure.objects:
    obj.select_set(True)
bpy.ops.export_scene.gltf(filepath=str(OUT / "street15-r2.glb"), export_format="GLB",
                          use_selection=True, export_extras=True, export_apply=True)

def stage(obj):
    for old in list(obj.users_collection):
        old.objects.unlink(obj)
    presentation.objects.link(obj)

bpy.ops.object.camera_add(location=(18, -24, 17))
camera = bpy.context.object
camera.rotation_euler = (Vector((0, 0, .45)) - camera.location).to_track_quat("-Z", "Y").to_euler()
camera.data.type, camera.data.ortho_scale = "ORTHO", 20.2
scene.camera = camera
stage(camera)
for location, energy, size in [((2, -7, 13), 3900, 9), ((-8, 2, 7), 2200, 9), ((7, 7, 9), 4000, 8)]:
    bpy.ops.object.light_add(type="AREA", location=location)
    light = bpy.context.object
    light.rotation_euler = (-light.location).to_track_quat("-Z", "Y").to_euler()
    light.data.energy, light.data.size = energy, size
    stage(light)
scene.world = bpy.data.worlds.new("Neutralne światło")
scene.world.use_nodes = True
scene.world.node_tree.nodes["Background"].inputs["Strength"].default_value = .6
scene.render.engine = "CYCLES"
scene.cycles.samples = 24
scene.cycles.use_denoising = True
scene.render.resolution_x, scene.render.resolution_y = 1200, 800
scene.render.resolution_percentage = 100
scene.render.film_transparent = True
scene.render.filepath = "//street15-r2.png"
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(OUT / "street15-r2.blend"), compress=True)
bpy.ops.render.render(write_still=True)
