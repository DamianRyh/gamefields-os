#!/usr/bin/env python3
"""Shop macros for Beton and Malowanie built from a real CC0 photo (16.11.2026).

Source: Poly Haven "Concrete Floor 03" (photography Matterfield, processing Rob Tuytel), CC0 1.0,
https://polyhaven.com/a/concrete_floor_03 — 2K diffuse map, not stored in the repository.

  beton-macro.webp      the photo graded to a light, neutral grey (fresh slab), with one saw-cut control joint
  malowanie-macro.webp  the same concrete under sport paint: two colours of a pattern and white game lines;
                        the photo's grain stays visible through the paint

Usage: python3 tools/studio/photo_material_macros.py concrete_floor_03_diff_2k.jpg
"""
import hashlib, json, pathlib, sys
import numpy as np
from PIL import Image, ImageFilter

OUT = pathlib.Path(__file__).resolve().parents[2] / "integrations/studio/canvas-editor/public/surfaces/catalogue"
W, H = 1448, 1086
SOURCE = "Poly Haven Concrete Floor 03 (Matterfield / Rob Tuytel), CC0 1.0, https://polyhaven.com/a/concrete_floor_03; graded by tools/studio/photo_material_macros.py"

def load(path):
    img = Image.open(path).convert("RGB")
    s = img.size[0]
    img = img.crop((0, (s - s * H // W) // 2, s, (s - s * H // W) // 2 + s * H // W)).resize((W, H), Image.LANCZOS)
    lum = np.asarray(img.convert("L"), np.float32)
    return lum / lum.mean()  # 1.0 = average brightness, keeps the photo's grain and pores

def light():
    y, x = np.mgrid[0:H, 0:W]
    return 0.93 + 0.12 * (1 - (x / W * 0.6 + y / H * 0.4))

def beton(detail):
    grey = np.array([176, 174, 168], np.float32)
    arr = grey * (1 + (detail[..., None] - 1) * 1.15) * light()[..., None]
    y, x = np.mgrid[0:H, 0:W]
    cut = W * 0.66 + (y - H / 2) * 0.025
    arr[np.abs(x - cut) < 3.5] *= 0.45
    arr[np.abs(x - cut - 5) < 1.5] *= 1.06
    return arr

def malowanie(detail):
    y, x = np.mgrid[0:H, 0:W]
    blue, red, white = np.array([36, 87, 214], np.float32), np.array([210, 58, 38], np.float32), np.array([240, 238, 230], np.float32)
    r = np.sqrt(((x - W * 0.55) / (W * 0.62)) ** 2 + ((y - H * 1.12) / (H * 0.78)) ** 2)
    arr = np.where((r < 1)[..., None], red, blue)
    lines = (np.abs(r - 1) < 0.0075) | (np.abs(y - H * 0.24 - (x - W / 2) * 0.05) < 14)
    arr[lines] = white
    soft = np.asarray(Image.fromarray(np.clip(detail * 128, 0, 255).astype("uint8")).filter(ImageFilter.GaussianBlur(0.6)), np.float32) / 128
    return arr * (1 + (soft[..., None] - 1) * 0.55) * light()[..., None]

def main():
    detail = load(sys.argv[1])
    manifest_path = OUT / "manifest.json"
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    items = {i["id"]: i for i in manifest["items"]}
    for name, arr in [("beton", beton(detail)), ("malowanie", malowanie(detail))]:
        path = OUT / f"{name}-macro.webp"
        Image.fromarray(np.clip(arr, 0, 255).astype("uint8")).save(path, "WEBP", quality=84, method=6)
        data = path.read_bytes()
        items[name] = {"id": name, "asset": path.name, "sha256": hashlib.sha256(data).hexdigest(), "bytes": len(data), "source": SOURCE}
        print(path.name, len(data))
    manifest["items"] = list(items.values())
    manifest_path.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

if __name__ == "__main__":
    main()
