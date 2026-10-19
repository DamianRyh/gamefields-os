# Street Football 15 × 10

Product ID: `street-football-15x10`. Product manifest: `public/products/street-football-15x10/product.json`.
Public static route: `?view=street-football-15x10`. App route: `/products/street-football-15x10`.

The owner supplied the Blender concept. Its original generator is retained in `models/street-football-15x10/build_pitch.py`; `prepare_web.py` removes all marking/text objects and replaces the turf with a neutral 20 cm slab. To reproduce, run the original generator in Blender, then open its `boisko_15x10.blend` and run `prepare_web.py`. It writes to a sibling `gamefields-web/` directory. Copy its GLBs and final Blender file to the public product folder as in the current package. `render_preview.py` renders the packaged model from repository root.

GLB contains exactly two named nodes and two meshes: `Murawa` and `Konstrukcja`. Multiple material primitives become child meshes in Three.js. The top surface has `Nawierzchnia_baza`, its sides/bottom have `Nawierzchnia_boki`. Panel material is `Panele - kolor edytowalny`; steel uses `Stal ocynkowana`. The viewer changes only the targeted material and retains the same loaded geometry. Source files contain no line/text meshes or textures. Surface top stays at Blender Z=0 (GLB Y=0), bottom at -0.20 m. UVs cover the full 15 × 10 m envelope; original 0.65 m corner cuts remain.

Product page supports six panel presets, a custom panel color, independent surface color, reset, local JSON configuration export, the existing WordPress contact route and four native-model downloads. It does not submit forms or calculate a price. Downloaded GLBs preserve standard materials; chosen colors are exported in the JSON configuration. No external paid assets or new licenses were added.

Validation: source SHA-256/component integrity; two-node GLB/material/UV/thickness/bounds audit; headless WebGL visible recoloring; custom colors; reset without model reload; JSON download; all four asset URLs; 390 px overflow check; source-library integration; existing modular/Panna Kids regression. Desktop/mobile captures are generated under ignored `outputs/street15/`.
