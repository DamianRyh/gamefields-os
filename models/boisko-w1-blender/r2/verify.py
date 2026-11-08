"""Verify the exported Ring assembly and the two web variants."""
import hashlib
import json
import math
import struct
from collections import Counter
from pathlib import Path

OUT = Path(__file__).resolve().parent

def read(name):
    raw = (OUT / name).read_bytes()
    magic, version, size, length, chunk = struct.unpack_from("<4sIII4s", raw)
    assert (magic, version, size, chunk) == (b"glTF", 2, len(raw), b"JSON")
    return raw,json.loads(raw[20:20+length]),28+length

def points(raw, doc, offset, accessor):
    a = doc["accessors"][accessor]
    view = doc["bufferViews"][a["bufferView"]]
    assert a["type"] == "VEC3" and a["componentType"] == 5126
    start=offset+view.get("byteOffset",0)+a.get("byteOffset",0)
    return (struct.unpack_from("<fff",raw,start+i*view.get("byteStride",12)) for i in range(a["count"]))

raw, doc, binary = read("panna-ring-r2.glb")
hero, web, _ = read("panna-ring.glb")
ids = lambda data: {n["extras"]["sourceId"] for n in data["nodes"]}
assert ids(doc) == ids(web)
assert len(ids(doc)) == len(doc["nodes"])
counts = Counter(n["extras"]["group"] for n in doc["nodes"])
assert set(counts) == {"frame","goals","panels","hardware"}
assert counts["panels"] == 24
top = [n for n in doc["nodes"] if n["extras"].get("wieniec")]
assert len(top) == 8
radius = []
for n in top:
    assert "rotation" not in n and "translation" not in n and "scale" not in n
    for p in doc["meshes"][n["mesh"]]["primitives"]:
        for x,y,z in points(raw,doc,binary,p["attributes"]["POSITION"]):
            assert .96999 <= y <= 1.000001
            radius.append(math.hypot(x,z))
assert abs(min(radius)-2.495) < 1e-5
assert abs(max(radius)-2.545) < 1e-5
bounds=json.loads((OUT/"bounds.json").read_text())
assert set(bounds)==ids(doc)
assert all(a>=-.000001 and b<=1.000001 for a,b in bounds.values())
for asset in (doc,web):
    panels = next(m for m in asset["materials"] if m["name"].startswith("Panele"))
    assert panels["alphaMode"] == "MASK"
    assert panels["pbrMetallicRoughness"]["baseColorTexture"]["texCoord"] == 1
    assert len(asset["images"]) == 1
assert "KHR_draco_mesh_compression" in web["extensionsRequired"]
report={"status":"PASS","diameterOutside_m":5.09,"diameterInside_m":4.99,"height_m":1,
        "counts":dict(counts),"heroBytes":len(hero),"sourceBytes":len(raw),
        "heroSHA256":hashlib.sha256(hero).hexdigest(),"sourceSHA256":hashlib.sha256(raw).hexdigest()}
(OUT/"verification.json").write_text(json.dumps(report,indent=2)+"\n")
print(report)
