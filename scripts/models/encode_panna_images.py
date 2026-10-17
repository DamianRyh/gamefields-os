"""Encode studio renders for delivery. Requires Pillow in the asset-authoring environment."""
from pathlib import Path
from PIL import Image
root=Path(__file__).resolve().parents[2]
for name in ['perspective','overhead','detail']:
    source=root/'.sites-runtime/panna-kids-render'/f'{name}.png'
    target=root/'public/products/panna-kids'/f'{name}.webp'
    Image.open(source).save(target,quality=90,method=6)
