"""Rebuild the presentation asset from the dimensioned Octa Blender assembly."""
import sys
from pathlib import Path

import bmesh
import bpy
from mathutils import Vector


OUT = Path(__file__).resolve().parent
SOURCE = OUT.parent / "octagon.blend"
bpy.ops.wm.open_mainfile(filepath=str(SOURCE))
scene = bpy.context.scene
floor = next(obj for obj in scene.objects if obj.get("group") == "floor")
structure = [obj for obj in scene.objects if obj.type == "MESH" and obj != floor]
surface_collection = bpy.data.collections.new("Nawierzchnia – osobny eksport")
scene.collection.children.link(surface_collection)
for collection in list(floor.users_collection):
    collection.objects.unlink(floor)
surface_collection.objects.link(floor)

for obj in [*structure, floor]:
    obj["sourceId"] = "floor" if obj == floor else obj.name.replace(" ", "-")
    obj["artwork"] = False
    obj["revision"] = "OCTA-R2"
    source_mesh = obj.data
    if obj == floor:
        batches = [len(source_mesh.polygons)]
    elif obj.name.startswith("Slup"):
        batches = [16, 6, 6]
    else:
        batches = [16] * (len(source_mesh.polygons) // 16)
    assert sum(batches) == len(source_mesh.polygons), obj.name

    # The source stores independent hollow profiles as consecutive face batches.
    # Weld within each solid so touching profiles keep their own closed shells.
    vertices, faces, source_uvs = [], [], []
    uv_layer = source_mesh.uv_layers.active
    polygons = list(source_mesh.polygons)
    start = 0
    for size in batches:
        index = {}
        for face in polygons[start:start + size]:
            corners = []
            for i in face.vertices:
                position = tuple(source_mesh.vertices[i].co)
                if position not in index:
                    index[position] = len(vertices)
                    vertices.append(position)
                corners.append(index[position])
            faces.append(corners)
            if uv_layer:
                source_uvs.extend(tuple(uv_layer.data[i].uv) for i in face.loop_indices)
        start += size
    refined = bpy.data.meshes.new(source_mesh.name + " R2")
    refined.from_pydata(vertices, [], faces)
    for material in source_mesh.materials:
        refined.materials.append(material)
    if uv_layer:
        uv = refined.uv_layers.new(name=uv_layer.name)
        for item, coordinate in zip(uv.data, source_uvs):
            item.uv = coordinate
    mesh = bmesh.new()
    mesh.from_mesh(refined)
    bmesh.ops.recalc_face_normals(mesh, faces=list(mesh.faces))
    assert all(edge.is_manifold for edge in mesh.edges), obj.name
    mesh.to_mesh(refined)
    mesh.free()
    refined.update()
    obj.data = refined
    bevel = obj.modifiers.new("Zaokrąglone krawędzie profili", "BEVEL")
    bevel.width = 0.0012 if obj.get("group") != "floor" else 0.003
    bevel.segments = 2
    bevel.affect = "EDGES"
    bevel.harden_normals = True
    bevel.limit_method = "ANGLE"

coats = {
    "frame": ((0.024, 0.019, 0.022, 1), 0.36),
    "goals": ((0.024, 0.019, 0.022, 1), 0.40),
    "panels": ((0.694, 0.007, 0.025, 1), 0.41),
}
for group, (color, roughness) in coats.items():
    material = next(obj.active_material for obj in structure if obj.get("group") == group)
    material.diffuse_color = color
    bsdf = material.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Base Color"].default_value = color
    bsdf.inputs["Roughness"].default_value = roughness
    bsdf.inputs["Metallic"].default_value = 0.22
    bsdf.inputs["Clearcoat"].default_value = 0.14

scene["Project"] = "Panna Octa – GF-CT-008"

def export(name, objects, draco=False):
    bpy.ops.object.select_all(action="DESELECT")
    for obj in objects:
        obj.select_set(True)
    bpy.ops.export_scene.gltf(
        filepath=str(OUT / name),
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_extras=True,
        export_draco_mesh_compression_enable=draco,
        export_draco_position_quantization=18,
    )

export("gamefields-panna-octa-r2.glb", structure)
export("gamefields-panna-octa-hero.glb", structure, draco=True)
export("gamefields-panna-octa-surface.glb", [floor])
bpy.ops.object.select_all(action="DESELECT")
floor.hide_render = True
floor.hide_set(True)

bpy.ops.object.camera_add(location=(8.5, -11, 7.6))
camera = bpy.context.object
camera.rotation_euler = (Vector((0, 0, 0.58)) - camera.location).to_track_quat("-Z", "Y").to_euler()
camera.data.type = "ORTHO"
camera.data.ortho_scale = 7.75
scene.camera = camera

def area(name, location, energy, size):
    bpy.ops.object.light_add(type="AREA", location=location)
    light = bpy.context.object
    light.name = name
    light.rotation_euler = (-light.location).to_track_quat("-Z", "Y").to_euler()
    light.data.energy = energy
    light.data.size = size

area("Światło główne", (1, -4, 7), 1800, 5)
area("Wypełnienie", (-5, -1, 4), 1200, 5)
area("Kontra", (2, 4, 6), 1950, 4)
scene.world.use_nodes = True
scene.world.node_tree.nodes.get("Background").inputs["Strength"].default_value = 0.45
scene.render.engine = "CYCLES"
scene.cycles.samples = 20
scene.cycles.use_denoising = True
scene.render.resolution_x = 1080
scene.render.resolution_y = 780
scene.render.resolution_percentage = 100
scene.render.film_transparent = True
scene.render.image_settings.color_mode = "RGBA"
scene.render.filepath = "//gamefields-panna-octa-r2.png"

bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=str(OUT / "panna-octa-r2.blend"), compress=True)
if "--export-only" not in sys.argv:
    bpy.ops.render.render(write_still=True)
