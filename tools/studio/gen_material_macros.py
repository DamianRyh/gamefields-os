#!/usr/bin/env python3
"""Generated macro illustrations for Studio materials that have no photo yet (Akryl Hard Court, Płyty gumowe,
Maty gumowe). Procedural textures, not manufacturer photos; replace with licensed photos when available.

Usage: python3 tools/studio/gen_material_macros.py   (writes public/surfaces/catalogue/*.webp and updates manifest.json)
"""
import hashlib, json, pathlib
import numpy as np
from PIL import Image, ImageFilter

OUT = pathlib.Path(__file__).resolve().parents[2] / "integrations/studio/canvas-editor/public/surfaces/catalogue"
W, H = 1448, 1086
rng = np.random.default_rng(14112026)

def noise(scale, sigma):
    n = rng.random((H // scale + 2, W // scale + 2))
    img = Image.fromarray((n * 255).astype("uint8")).resize((W, H), Image.BICUBIC).filter(ImageFilter.GaussianBlur(sigma))
    return np.asarray(img, dtype=np.float32) / 255

def shade(base, light):
    """Soft directional light so the macro does not look flat."""
    y, x = np.mgrid[0:H, 0:W]
    grad = 0.92 + 0.12 * (1 - (x / W * 0.6 + y / H * 0.4))
    return np.clip(base * grad[..., None] * light[..., None], 0, 255)

def granules(colors, density, rmin, rmax):
    """Rubber granules: many small irregular blobs in the given colours."""
    img = Image.new("RGB", (W, H), colors[0])
    px = img.load()
    count = int(W * H * density)
    xs, ys = rng.integers(0, W, count), rng.integers(0, H, count)
    rs = rng.integers(rmin, rmax + 1, count)
    cs = rng.integers(0, len(colors), count)
    arr = np.asarray(img).copy()
    for x, y, r, c in zip(xs, ys, rs, cs):
        col = np.array(colors[c], dtype=np.int16) + rng.integers(-18, 19, 3)
        y0, y1, x0, x1 = max(0, y - r), min(H, y + r), max(0, x - r), min(W, x + r)
        yy, xx = np.mgrid[y0:y1, x0:x1]
        mask = (yy - y) ** 2 / (r * rng.uniform(.6, 1)) ** 2 + (xx - x) ** 2 / (r * rng.uniform(.6, 1)) ** 2 <= 1
        arr[y0:y1, x0:x1][mask] = np.clip(col, 0, 255)
    return arr.astype(np.float32)

def save(name, arr):
    path = OUT / f"{name}-macro.webp"
    Image.fromarray(np.clip(arr, 0, 255).astype("uint8")).save(path, "WEBP", quality=82, method=6)
    return path

def akryl():
    # Hard court: smooth acrylic layers with fine sand texture, a white court line.
    base = np.zeros((H, W, 3), np.float32) + np.array([38, 104, 140], np.float32)
    grain = (rng.random((H, W)) - .5) * 26
    fine = (noise(6, 1.2) - .5) * 30
    arr = base + (grain + fine)[..., None]
    outer = np.array([46, 122, 84], np.float32)
    y, x = np.mgrid[0:H, 0:W]
    edge = (x * 0.42 + y) > H * 1.18
    arr[edge] = outer + (grain[edge] + fine[edge])[..., None] * 1.0
    line = np.abs((x * 0.42 + y) - H * 1.18) < 26
    arr[line] = np.array([238, 238, 232], np.float32) + (grain[line] * .5)[..., None]
    return shade(arr, 0.97 + noise(40, 20) * 0.06)

def plyty():
    # Stabilised rubber slabs 50 × 50 cm: red EPDM top, visible joints between slabs.
    arr = granules([(150, 52, 40), (128, 42, 34), (170, 66, 50), (40, 34, 32)], 0.012, 3, 7)
    arr = np.asarray(Image.fromarray(arr.astype("uint8")).filter(ImageFilter.GaussianBlur(0.6)), np.float32)
    y, x = np.mgrid[0:H, 0:W]
    joint = (np.abs((x % 724) - 2) < 4) | (np.abs((y % 724) - 2) < 4)
    arr[joint] = arr[joint] * 0.35
    return shade(arr, 0.95 + noise(30, 14) * 0.1)

def maty():
    # Continuous rubber mats / rolls: black SBR with coloured EPDM flecks and one glued seam.
    arr = granules([(36, 36, 38), (48, 48, 50), (28, 28, 30), (36, 36, 38), (36, 36, 38), (196, 70, 52), (60, 140, 90)], 0.014, 2, 5)
    arr = np.asarray(Image.fromarray(arr.astype("uint8")).filter(ImageFilter.GaussianBlur(0.5)), np.float32)
    y, x = np.mgrid[0:H, 0:W]
    seam = np.abs(x - (W * 0.62 + (y - H / 2) * 0.08)) < 3
    arr[seam] = arr[seam] * 0.45
    return shade(arr, 0.95 + noise(30, 14) * 0.1)

def main():
    manifest_path = OUT / "manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    items = {i["id"]: i for i in manifest["items"]}
    for name, fn in [("akryl", akryl), ("plyty-gumowe", plyty), ("maty-gumowe", maty)]:
        path = save(name, fn())
        data = path.read_bytes()
        items[name] = {"id": name, "asset": path.name, "sha256": hashlib.sha256(data).hexdigest(), "bytes": len(data),
                       "source": "tools/studio/gen_material_macros.py (procedural illustration, 14.11.2026; replace with a licensed photo)"}
        print(path.name, len(data))
    manifest["items"] = list(items.values())
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

if __name__ == "__main__":
    main()
