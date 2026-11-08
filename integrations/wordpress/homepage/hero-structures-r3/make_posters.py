from pathlib import Path

from PIL import Image

assets = Path(__file__).resolve().parent / "assets"
for model in ("play", "court", "ring", "octa"):
    source = Image.open(assets / f"panna-{model}.png").convert("RGBA")
    assert source.getpixel((0, 0))[3] == 0, model
    for width in (720, 1200):
        image = source.resize((width, round(source.height * width / source.width)), Image.Resampling.LANCZOS)
        image.save(assets / f"panna-{model}-{width}.webp", quality=86, method=6)
