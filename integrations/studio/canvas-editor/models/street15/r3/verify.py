"""Check the actual R3 JSON/GLB against R2 before use in Studio."""
import hashlib
import json
import math
import struct
import sys
from pathlib import Path

out = Path(__file__).resolve().parent
base = Path(sys.argv[1]) if len(sys.argv) > 1 else out.parent / "street15-r2" / "street15-r2.json"
old = json.loads(base.read_text())
new = json.loads((out / "street15-r3.json").read_text())
assert [m for m in old if m["group"] != "goals"] == [m for m in new if m["group"] != "goals"]
assert len(new) == len({m["id"] for m in new})
goals = [m for m in new if m["group"] == "goals"]
for mesh in goals:
    v = mesh["v"]
    assert len(mesh["uv"]) == len(v)
    assert all(math.isfinite(value) for p in v for value in p)
    assert all(len(f) == 3 and all(0 <= i < len(v) for i in f) for f in mesh["f"])

for end, sign in [("west", -1), ("east", 1)]:
    parts = {m["id"]: m for m in goals if m["id"].startswith(f"goal-{end}-")}
    assert len(parts) == 16
    points = [v for m in parts.values() for v in m["v"]]
    assert min(sign*x for x, y, z in points) >= 7.474
    assert 8.31 < max(sign*x for x, y, z in points) <= 8.325
    assert 1.12 < max(y for x, y, z in points) <= 1.125
    portal = parts[f"goal-{end}-portal"]["v"]
    assert not any(y < 1 and abs(z) < .973 for _, y, z in portal)
    net = parts[f"goal-{end}-net"]
    assert len(net["f"]) > 3500
    assert not any(abs(z)<.90 and y<.99 and sign*x < 7.84 for x,y,z in net["v"])

glb = (out / "street15-r3.glb").read_bytes()
magic, version, length, json_len = struct.unpack_from("<4sIII", glb)
assert (magic, version, length) == (b"glTF", 2, len(glb))
doc = json.loads(glb[20:20+json_len])
nodes = {node["extras"]["sourceId"]: node for node in doc["nodes"]}
assert set(nodes) == {m["id"] for m in new if m["group"] in ("frame", "panels", "goals")}
for end in ["east", "west"]:
    net = nodes[f"goal-{end}-net"]
    primitive = doc["meshes"][net["mesh"]]["primitives"][0]
    assert doc["materials"][primitive["material"]]["name"] == "Siatka | plecionka szara"

report = {
    "status": "PASS", "changed": "both goals", "unchanged_meshes": len(new)-len(goals),
    "goal_meshes": len(goals), "net_meshes": 2,
    "goal_triangles": sum(len(m["f"]) for m in goals),
    "sha256": {name: hashlib.sha256((out / name).read_bytes()).hexdigest() for name in
               ("street15-r3.blend", "street15-r3.glb", "street15-r3.json")},
}
(out / "verification.json").write_text(json.dumps(report, indent=2) + "\n")
print(json.dumps(report))
