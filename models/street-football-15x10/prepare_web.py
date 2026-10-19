import bpy, os, json, hashlib
from mathutils import Vector

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'gamefields-web')
os.makedirs(OUT, exist_ok=True)
scene = bpy.context.scene
groups = {'Murawa': [], 'Konstrukcja': []}
for o in list(scene.objects):
    collections = {c.name for c in o.users_collection}
    if o.name == 'Linia srodkowa':
        bpy.data.objects.remove(o, do_unlink=True)
    elif '04_Oznakowanie' in collections:
        bpy.data.objects.remove(o, do_unlink=True)
    elif '01_Nawierzchnia' in collections:
        groups['Murawa'].append(o)
    elif collections & {'02_Bandy_modulowe', '03_Bramki'}:
        groups['Konstrukcja'].append(o)
    else:
        bpy.data.objects.remove(o, do_unlink=True)

bpy.data.materials['Czarne wypelnienie band'].name = 'Panele - kolor edytowalny'

# Neutral reusable slab. Top UV covers the complete 15 x 10 m envelope.
grass = bpy.data.materials.new('Nawierzchnia_baza')
grass.use_nodes = True
grass.diffuse_color = (0.65,0.65,0.65,1)
bsdf = grass.node_tree.nodes.get('Principled BSDF')
bsdf.inputs['Base Color'].default_value = grass.diffuse_color
bsdf.inputs['Roughness'].default_value = 0.9
side = grass.copy()
side.name = 'Nawierzchnia_boki'
for o in groups['Murawa']:
    if '01_Nawierzchnia' in {c.name for c in o.users_collection}:
        o.data.materials.clear()
        o.data.materials.append(grass)
        o.data.materials.append(side)
        for mod in o.modifiers:
            if mod.type == 'SOLIDIFY':
                mod.thickness = 0.20
                mod.offset = -1
                mod.material_offset = 1
                mod.material_offset_rim = 1
        uv = o.data.uv_layers.new(name='UVMap')
        for loop in o.data.loops:
            v = o.data.vertices[loop.vertex_index].co
            uv.data[loop.index].uv = ((v.x+7.5)/15, (v.y+5)/10)

report = {'units': 'meters', 'source': 'boisko_15x10.blend', 'objects': {}}
for name, objects in groups.items():
    bpy.ops.object.select_all(action='DESELECT')
    for o in objects:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objects[0]
    bpy.ops.object.convert(target='MESH')
    bpy.ops.object.join()
    o = bpy.context.object
    o.name = name
    o.data.name = name
    scene.cursor.location = (0,0,0)
    bpy.ops.object.origin_set(type='ORIGIN_CURSOR')
    bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
    # Deduplicate material slots left by joining modular elements.
    mats = list(o.data.materials)
    unique = list(dict.fromkeys(mats))
    indices = [unique.index(mats[p.material_index]) for p in o.data.polygons]
    o.data.materials.clear()
    for m in unique:
        o.data.materials.append(m)
    for p, idx in zip(o.data.polygons, indices):
        p.material_index = idx
    o.data.calc_loop_triangles()
    report['objects'][name] = {'vertices': len(o.data.vertices), 'triangles': len(o.data.loop_triangles), 'dimensions_blender_xyz': list(o.dimensions), 'materials': [m.name for m in unique]}

assert len(scene.objects) == 2
surface = bpy.data.objects['Murawa']
assert abs(surface.dimensions.z - 0.20) < 0.00001
assert len(surface.data.materials) == 2
assert len(surface.data.vertices) == 16
report['surface'] = {'thickness_m': 0.20, 'top_z': 0, 'bottom_z': -0.20, 'markings': False, 'top_material': 'Nawierzchnia_baza', 'uv': 'U=(X+7.5)/15; V=(Y+5)/10', 'neutral_base': True}
scene.camera = None
bpy.ops.object.select_all(action='SELECT')
bpy.context.preferences.filepaths.save_version = 0
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(OUT, 'boisko-15x10-dwa-obiekty.blend'))
bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, 'boisko-15x10.glb'), export_format='GLB', use_selection=True, export_cameras=False, export_lights=False)
for name in groups:
    bpy.ops.object.select_all(action='DESELECT')
    bpy.data.objects[name].select_set(True)
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUT, name.lower()+'.glb'), export_format='GLB', use_selection=True)
for filename in ['boisko-15x10.glb', 'murawa.glb', 'konstrukcja.glb']:
    with open(os.path.join(OUT,filename), 'rb') as f:
        data=f.read()
    report[filename]={'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}
with open(os.path.join(OUT,'validation.json'),'w') as f:
    json.dump(report,f,indent=2)
print('WEB_EXPORT_OK', json.dumps(report))
