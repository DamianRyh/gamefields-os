#!/usr/bin/env python3
"""Portrait poster versions of the 12 Signature surfaces.

The Studio drawings are 600x400 landscape courts. A poster is portrait in A-series proportion
(1:1.414; 50x70 cm differs by ~1%). Each drawing is turned 90 degrees and scaled uniformly by
425/400 so its art covers the whole sheet (about 3% of each goal end is trimmed), and the court
lines are redrawn on the poster with an even 15-unit margin on all four sides.
"""
import importlib.util, pathlib, sys
HERE = pathlib.Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("art", HERE / "signature_art.py")
art = importlib.util.module_from_spec(spec); spec.loader.exec_module(art)

W, H, M = 425, 600, 15          # poster units, margin
CX, CY = W / 2, H / 2
LINES = (f'<g fill="none" stroke="#fff" stroke-width="2">'
         f'<rect x="{M}" y="{M}" width="{W-2*M}" height="{H-2*M}"/>'
         f'<path d="M{M} {CY}H{W-M}M{CX-75} {M}v70h150v-70M{CX-75} {H-M}v-70h150v70"/>'
         f'<circle cx="{CX}" cy="{CY}" r="45"/></g>')
out = HERE / "assets" / "posters"
for name, (bg, body) in art.ART.items():
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W*4}" height="{H*4}">'
           f'<rect width="{W}" height="{H}" fill="{bg}"/>'
           f'<g transform="translate({CX} {CY}) rotate(90) scale({W/400}) translate(-300 -200)">{body}</g>'
           f'{LINES}</svg>')
    (out / f"{name}.svg").write_text(svg, encoding="utf-8")
print(len(art.ART), "posters")
