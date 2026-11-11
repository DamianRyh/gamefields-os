"""Produce four structure-only homepage models and their transparent posters."""
import hashlib
import json
import math
import sys
from pathlib import Path

import bpy
from mathutils import Vector

OUT = Path(__file__).resolve().parent / "assets"
ROOT = OUT.parents[4]
PUBLIC = ROOT / "work/studio-street15-r2/.sites-checkout/public/arenas"
sources = {
    "play": (PUBLIC / "panna-play-o1-v2.glb", 35),
    "court": (PUBLIC / "panna-court-v6.glb", 34),
    "ring": (PUBLIC / "boisko-w1.glb", 35),
    "octa": (ROOT / "models/octagon/revision-2/gamefields-panna-octa-r2.glb", 31),
}
if "--" in sys.argv:
    args = list(map(Path, sys.argv[sys.argv.index("--")+1:]))
    if len(args) != len(sources):
        raise ValueError("Pass Play, Court, Ring and Octa GLB paths, in that order")
    sources = {key:(path.resolve(), angle) for (key,(_,angle)),path in zip(sources.items(),args)}

names = {"panels":"Panele | lakier proszkowy", "frame":"Rama | lakier proszkowy",
         "goals":"Bramki | lakier proszkowy", "hardware":"Łączniki | ocynk"}
colors = {"panels": "#D9142B", "frame": "#2B2226", "goals": "#2B2226", "hardware": "#A0A5A6"}
def linear(c):
    return c / 12.92 if c <= .04045 else ((c + .055) / 1.055)**2.4

def material(role):
    m = bpy.data.materials.new(names[role])
    m.use_nodes = True
    color = tuple(linear(int(colors[role][i:i+2],16)/255) for i in (1,3,5))
    m.diffuse_color = (*color,1)
    n = m.node_tree.nodes["Principled BSDF"]
    n.inputs["Base Color"].default_value = m.diffuse_color
    n.inputs["Roughness"].default_value = .38 if role != "hardware" else .3
    n.inputs["Metallic"].default_value = .20 if role != "hardware" else .74
    n.inputs["Clearcoat"].default_value = .12
    return m

def role_for(obj, key):
    tags = str(obj.get("category", "")), str(obj.get("group", ""))
    label = obj.name.lower()
    assert not any(word in label for word in ("nawierz", "podło", "podlo", "floor", "muraw", "foundation")), obj.name
    assert not set(tags) & {"floor","foundation","surface-edge"}
    if "hardware" in tags:
        return "hardware"
    if "panels" in tags or "sheet" in tags or "blacha" in label:
        return "panels"
    if "goals" in tags or "br1" in label or any(m.name.startswith("Bramki") for m in obj.data.materials):
        return "goals"
    assert key == "ring" or "frame" in tags or "steel" in tags, obj.name
    return "frame"

report = {}
for key, (path, azimuth) in sources.items():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.unit_settings.system = "METRIC"
    bpy.ops.import_scene.gltf(filepath=str(path))
    mats = {role:material(role) for role in names}
    parts = [o for o in scene.objects if o.type == "MESH"]
    counts = dict.fromkeys(names, 0)
    assert parts
    for obj in parts:
        role = role_for(obj,key)
        obj["group"] = role
        counts[role] += 1
        obj.data.materials.clear()
        obj.data.materials.append(mats[role])
        for polygon in obj.data.polygons:
            polygon.material_index = 0
        # CAD shape, fasteners, edge normals and real perforations are preserved.
        # Paint is uniform on these exports, so CAD texture coordinates are redundant.
        while obj.data.uv_layers:
            obj.data.uv_layers.remove(obj.data.uv_layers[0])
    assert all(counts[k] for k in ("frame","panels","goals")), (key,counts)
    bpy.context.view_layer.update()
    points = [obj.matrix_world @ Vector(p) for obj in parts for p in obj.bound_box]
    low = Vector(tuple(min(p[i] for p in points) for i in range(3)))
    high = Vector(tuple(max(p[i] for p in points) for i in range(3)))
    center = (low + high) / 2
    assert -.08 < low.z < .10 and .8 < high.z < 1.7, (key,low,high)
    scene["Presentation"] = "Konstrukcja bez nawierzchni, baner Gamefields"
    glb = OUT / f"panna-{key}.glb"
    bpy.ops.export_scene.gltf(filepath=str(glb),export_format="GLB",export_extras=True,
                              export_draco_mesh_compression_enable=True,export_draco_position_quantization=16)
    scene.world = bpy.data.worlds.new("Neutralne studio")
    scene.world.use_nodes = True
    scene.world.node_tree.nodes["Background"].inputs["Strength"].default_value = .48

    a = math.radians(azimuth)
    camera_pos = center + Vector((13*math.sin(a),-13*math.cos(a),7.25))
    bpy.ops.object.camera_add(location=camera_pos)
    camera = bpy.context.object
    camera.rotation_euler = (center-camera_pos).to_track_quat("-Z","Y").to_euler()
    camera.data.type = "ORTHO"
    rotation = camera.rotation_euler.to_matrix().transposed()
    projected = [rotation @ (p-center) for p in points]
    width = max(p.x for p in projected) - min(p.x for p in projected)
    height = max(p.y for p in projected) - min(p.y for p in projected)
    camera.data.ortho_scale = max(width, height * 1200/675) * 1.13
    scene.camera = camera
    for loc, energy, size in [((2,-4,7),1600,6),((-5,0,4),760,5),((3,5,6),2000,4)]:
        bpy.ops.object.light_add(type="AREA", location=center + Vector(loc))
        light = bpy.context.object
        light.rotation_euler = (center-light.location).to_track_quat("-Z","Y").to_euler()
        light.data.energy, light.data.size = energy, size
    scene.render.engine = "CYCLES"
    scene.cycles.samples = 24
    scene.cycles.use_denoising = True
    scene.render.resolution_x, scene.render.resolution_y = 1200,675
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = True
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.filepath = str(OUT / f"panna-{key}.png")
    bpy.context.preferences.filepaths.save_version = 0
    bpy.ops.wm.save_as_mainfile(filepath=str(OUT/f"panna-{key}.blend"),compress=True)
    bpy.ops.render.render(write_still=True)
    report[key] = {"source":path.name,"sourceSha256":hashlib.sha256(path.read_bytes()).hexdigest(),
                   "parts":counts,"height_m":round(high.z-low.z,5),"bytes":glb.stat().st_size,
                   "glbSha256":hashlib.sha256(glb.read_bytes()).hexdigest()}
(OUT / "build-receipt.json").write_text(json.dumps(report,indent=2)+"\n")
