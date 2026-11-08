"""Remove the two horizontal side rails on each Panna Octa goal."""
import json
from pathlib import Path
import sys

import bmesh
import bpy
from mathutils import Vector

OUT = Path(__file__).resolve().parent
ROOT = OUT.parents[2]
bpy.ops.wm.open_mainfile(filepath=str(OUT.parent / "revision-2/panna-octa-r2.blend"))
scene = bpy.context.scene
structure = [o for o in scene.objects if o.type == "MESH" and o.get("group") != "floor"]
goals = [o for o in structure if o.get("group") == "goals"]
assert len(goals) == 2

for goal in goals:
    mesh = bmesh.new()
    mesh.from_mesh(goal.data)
    unwanted = [v for v in mesh.verts if .3784 < v.co.z < .4036 and abs(v.co.x) > .5024]
    assert len(unwanted) == 32, (goal.name, len(unwanted))
    removed = set(unwanted)
    faces = [f for f in mesh.faces if all(v in removed for v in f.verts)]
    assert len(faces) == 32
    bmesh.ops.delete(mesh, geom=unwanted, context="VERTS")
    assert all(e.is_manifold for e in mesh.edges)
    mesh.to_mesh(goal.data)
    mesh.free()
    goal.data.update()

next(o.active_material for o in structure if o.get("group") == "panels").name = "Panele | lakier proszkowy"
scene["Project"] = "Panna Octa GF-CT-008 R3"
bpy.ops.wm.save_as_mainfile(filepath=str(OUT / "panna-octa-r3.blend"), compress=True)

for obj in structure:
    obj.select_set(True)
for compressed, name in [(False, "panna-octa-r3.glb"), (True, "panna-octa-r3-hero.glb")]:
    bpy.ops.export_scene.gltf(filepath=str(OUT / name), export_format="GLB",
        use_selection=True, export_apply=True, export_extras=True,
        export_draco_mesh_compression_enable=compressed, export_draco_position_quantization=18)

source = ROOT / "models/octagon/studio-mesh.json"
meshes = json.loads(source.read_text())
for goal in (m for m in meshes if m["group"] == "goals"):
    old = goal["v"]
    keep = [i for i, (x, y, z) in enumerate(old) if not (.3784 < y < .4036 and abs(x) > .5024)]
    assert len(old) - len(keep) == 128
    mapping = {old_id: new_id for new_id, old_id in enumerate(keep)}
    goal["v"] = [old[i] for i in keep]
    goal["uv"] = [goal["uv"][i] for i in keep]
    original_faces = goal["f"]
    goal["f"] = [[mapping[i] for i in f] for f in original_faces if all(i in mapping for i in f)]
    assert len(original_faces) - len(goal["f"]) == 64
(OUT / "octagon.json").write_text(json.dumps(meshes, separators=(",", ":")))

if "--export-only" not in sys.argv:
    scene.render.resolution_x, scene.render.resolution_y = 1200, 675
    scene.render.filepath = str(OUT / "panna-octa.png")
    bpy.ops.render.render(write_still=True)
    scene.render.engine = "BLENDER_WORKBENCH"
    scene.display.shading.light = "STUDIO"
    scene.display.shading.color_type = "MATERIAL"
    scene.display.shading.show_cavity = True
    scene.camera.data.ortho_scale = 1.9
    scene.render.resolution_x, scene.render.resolution_y = 920, 680
    for side in (-1, 1):
        scene.camera.location = (1.5, side * 4.4, 1.5)
        aim = Vector((0, side * 2.6, .36))
        scene.camera.rotation_euler = (aim - scene.camera.location).to_track_quat("-Z", "Y").to_euler()
        scene.render.filepath = str(OUT / ("bramka-polnoc.png" if side == 1 else "bramka-poludnie.png"))
        bpy.ops.render.render(write_still=True)
