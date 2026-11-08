"""Apply the goal rail removal to the legacy Studio modular GLB."""
import sys
from pathlib import Path

import bmesh
import bpy

source = Path(sys.argv[sys.argv.index("--") + 1]).resolve()
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(source))
goal = next(o for o in bpy.context.scene.objects if "bramka" in o.name)
mesh = bmesh.new()
mesh.from_mesh(goal.data)
unwanted = [v for v in mesh.verts if .3784 < v.co.z < .4036 and abs(v.co.x) > .5024]
assert len(unwanted) == 128
bmesh.ops.delete(mesh, geom=unwanted, context="VERTS")
mesh.to_mesh(goal.data)
mesh.free()
bpy.ops.export_scene.gltf(filepath=str(Path(__file__).resolve().with_name("oct-goal.glb")), export_format="GLB")
