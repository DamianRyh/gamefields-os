"""Check the actual GLB bytes, including the axes and bounds after node transforms."""
import hashlib
import json
import math
import struct
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent

def read(path):
    raw = path.read_bytes()
    magic, version, total, length, kind = struct.unpack_from("<4sIII4s", raw)
    assert (magic, version, total, kind) == (b"glTF", 2, len(raw), b"JSON"), path
    doc = json.loads(raw[20:20 + length])
    chunk_length, chunk_kind = struct.unpack_from("<I4s", raw, 20 + length)
    assert chunk_kind == b"BIN\0" and 28 + length + chunk_length == len(raw)
    return doc, raw[28 + length:], raw

def points(doc, binary, accessor):
    a = doc["accessors"][accessor]
    v = doc["bufferViews"][a["bufferView"]]
    assert a["type"] == "VEC3" and a["componentType"] == 5126
    start = v.get("byteOffset", 0) + a.get("byteOffset", 0)
    return [struct.unpack_from("<fff", binary, start + i * v.get("byteStride", 12)) for i in range(a["count"])]

def world(node, point):
    assert "matrix" not in node and "children" not in node
    qx, qy, qz, qw = node.get("rotation", (0, 0, 0, 1))
    x, y, z = (a * b for a, b in zip(point, node.get("scale", (1, 1, 1))))
    a, b, c = 2 * (qy * z - qz * y), 2 * (qz * x - qx * z), 2 * (qx * y - qy * x)
    return tuple(u + t for u, t in zip(
        (x + qw*a + qy*c - qz*b, y + qw*b + qz*a - qx*c, z + qw*c + qx*b - qy*a),
        node.get("translation", (0, 0, 0)),
    ))

def inspect(path):
    doc, binary, raw = read(path)
    bounds, triangles = {}, 0
    for node in doc["nodes"]:
        vertices = []
        for primitive in doc["meshes"][node["mesh"]]["primitives"]:
            a = primitive["attributes"]
            assert primitive.get("mode", 4) == 4
            positions = points(doc, binary, a["POSITION"])
            normals = points(doc, binary, a["NORMAL"])
            assert len(positions) == len(normals)
            assert all(abs(math.hypot(*n) - 1) < 0.0001 for n in normals)
            vertices.extend(world(node, p) for p in positions)
            count = doc["accessors"][primitive["indices"]]["count"]
            assert count % 3 == 0
            triangles += count // 3
        assert all(math.isfinite(v) for point in vertices for v in point)
        bounds[node["name"]] = tuple(f(values) for values in zip(*vertices) for f in (min, max))
    return doc, bounds, {"bytes": len(raw), "sha256": hashlib.sha256(raw).hexdigest(), "triangles": triangles}

_, old, original = inspect(ROOT.parent / "octagon.glb")
court, structure, structure_stats = inspect(ROOT / "gamefields-panna-octa-r2.glb")
floor, surface, surface_stats = inspect(ROOT / "gamefields-panna-octa-surface.glb")
assert set(surface) == {"Nawierzchnia"}
assert set(structure).isdisjoint(surface)
assert set(structure) | set(surface) == set(old)
assert len({n["extras"]["sourceId"] for n in court["nodes"]}) == 26
assert Counter(n["extras"]["group"] for n in court["nodes"]) == {"frame": 16, "panels": 8, "goals": 2}
assert floor["nodes"][0]["extras"]["group"] == "floor"
assert "TEXCOORD_0" in floor["meshes"][0]["primitives"][0]["attributes"]
assert all("TEXCOORD_0" in p["attributes"] for n in court["nodes"] if n["extras"]["group"] == "panels" for p in court["meshes"][n["mesh"]]["primitives"])
assert {m["name"].split(" ")[0] for m in court["materials"]} == {"Rama", "Wypelnienie", "Bramki"}
delta = max(abs(a - b) for name, box in (structure | surface).items() for a, b in zip(box, old[name]))
assert delta <= 0.0015, delta
assert abs(min(box[2] for box in structure.values())) < 1e-6
assert abs(max(box[3] for box in structure.values()) - 1.218) < 1e-5
assert abs(surface["Nawierzchnia"][2] + 0.2) < 1e-6

hero, _, hero_raw = read(ROOT / "gamefields-panna-octa-hero.glb")
assert {n["name"] for n in hero["nodes"]} == set(structure)
assert [m["name"] for m in hero["materials"]] == [m["name"] for m in court["materials"]]
assert "KHR_draco_mesh_compression" in hero["extensionsRequired"]
hero_triangles = sum(hero["accessors"][p["indices"]]["count"] // 3 for m in hero["meshes"] for p in m["primitives"])
assert hero_triangles == structure_stats["triangles"]
report = {
    "source": original, "structure": structure_stats, "surface": surface_stats,
    "hero": {"bytes": len(hero_raw), "sha256": hashlib.sha256(hero_raw).hexdigest(), "triangles": hero_triangles},
    "max_bounds_delta_m": delta, "status": "PASS",
}
(ROOT / "verification.json").write_text(json.dumps(report, indent=2) + "\n")
print(json.dumps(report, indent=2))
