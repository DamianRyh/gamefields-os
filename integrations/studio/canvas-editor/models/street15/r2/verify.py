"""Check Blender's exported geometry against the prior Studio assembly."""
from collections import Counter
from pathlib import Path
import hashlib
import json
import math
import struct

out = Path(__file__).resolve().parent
old = json.loads((out.parent / "studio-mesh.json").read_text())
new = json.loads((out / "street15-r2.json").read_text())
groups = Counter(m["group"] for m in new)
assert groups["floor"] == groups["surface-edge"] == 1
assert groups["panels"] == 24
assert len({m["id"] for m in new}) == len(new)
assert {m["id"] for m in new if m["group"] == "panels"} == {m["id"] for m in old if m["group"] == "panels"}
assert max(y for m in new if m["group"] == "frame" for _, y, _ in m["v"]) == 1
for m in new:
    assert len(m["uv"]) == len(m["v"])
    assert all(math.isfinite(x) for v in m["v"] for x in v)
    assert all(len(f) == 3 and all(0 <= i < len(m["v"]) for i in f) for f in m["f"])
    if m["group"] == "panels":
        uvs = list(zip(*m["uv"]))
        assert m["artwork"] and all(min(axis) < .01 and max(axis) > .99 for axis in uvs)

def top_faces(model):
    m = next(m for m in model if m["group"] == "floor")
    return sorted(sorted((m["v"][i], m["uv"][i]) for i in f) for f in m["f"])

assert top_faces(new) == top_faces(old)
for end in ("east", "west"):
    goals = [m for m in new if m["id"].startswith(f"goal-{end}-")]
    assert len(goals) == 28 and all(m["group"] == "goals" for m in goals)
    vertices = [v for m in goals for v in m["v"]]
    assert abs(max(map(lambda p: abs(p[0]), vertices)) - 8.325) < .001
    assert max(p[1] for p in vertices) == 1.125
    assert max(p[2] for p in vertices) == 1.025

glb = (out / "street15-r2.glb").read_bytes()
magic, version, length, json_len = struct.unpack_from("<4sIII", glb)
assert (magic, version, length) == (b"glTF", 2, len(glb))
doc = json.loads(glb[20:20+json_len])
assert {n["extras"]["sourceId"] for n in doc["nodes"]} == {m["id"] for m in new if m["group"] in ("frame", "panels", "goals")}
report = {
    "status": "PASS", "groups": dict(groups), "triangles": sum(len(m["f"]) for m in new),
    "playing_envelope_m": [15, 10], "panel_height_m": 1, "surface_display_edge_m": .065,
    "sha256": {name: hashlib.sha256((out / name).read_bytes()).hexdigest() for name in
               ("street15-r2.blend", "street15-r2.glb", "street15-r2.json")},
}
(out / "verification.json").write_text(json.dumps(report, indent=2) + "\n")
print(json.dumps(report))
