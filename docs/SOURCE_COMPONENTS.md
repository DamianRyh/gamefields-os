# Uploaded GAMEFIELDS Blender models

The three supplied GLB files are preserved byte-for-byte under `public/models/gamefields/source/`. `library.json` records their SHA-256 digests, imported mesh counts and model-measured bounding boxes. They were exported by Blender's glTF exporter v3.6.28.

## Reusable geometry

Twelve source-named assemblies are extracted: K1–K4, S1, PO1–PO3, RW1–RW2, ST1 and E1. Selection is explicit in `scripts/models/extract_components.py`; source node names are stored in the catalogue. These names identify source groups, not certified manufacturing SKUs or verified functional classifications. Source-authored extras (including sheet/perforation labels where present) are preserved as metadata, not silently treated as confirmed product specifications.

Only rigid rotation/translation is applied. Components are centred horizontally, placed on the ground and exported as glTF Y-up. All source submeshes and authored material slots are retained. No model is stretched, simplified or substituted with the old 1.5 m placeholders. Geometry audit compares the source and exported triangle areas and verifies output bounding boxes/origins.

To reproduce with Blender 4.3:

```sh
blender --background --factory-startup --python scripts/models/extract_components.py
pnpm test:source-components
```

Blender is needed only for re-extraction; CI validates committed assets using Three.js and does not require Blender.

## Viewer and K1 placement study

`/engineering/source-models` provides WebGL orbit/zoom/pan views of the three original assemblies, all twelve extracted groups, and a repeat study with one to eight independent K1 instances. GLTFLoader clones retain unit scale and share geometry/material resources. Every reload releases WebGL and material/texture resources.

K1 pitch is measured from the centres of source groups `K1_-1_0` and `K1_-1_1` (~2.06 m). This is observed source placement, not a validated connection point or assembly tolerance. The repeat study displays component and submesh counts; it is not a complete court, production BOM, structural calculation or price quote. Repetition is intentionally unavailable for curved components: adding arbitrary fixed-radius arcs to the generic polygon engine would fabricate a compatible product geometry.

The measured library is exposed additively through `/api/engineering/components` alongside the existing twelve conceptual component contracts. Manufacturing dimensions, connection points, weight, physical material confirmation and engineer approval remain unconfirmed. The actual source components are UNPRICED; old budgetary placeholder rates are not reused.

## Public review

The existing Pages distribution copies `public/models/gamefields/` into its static asset directory. Use `?view=source` on the public review URL to open native models directly; the original modular configurator is retained. `pnpm test:modular:review` exercises model loading, all extracted components, K1 repetition at unit scale, mobile layout and catalogue navigation.

## Next production prerequisite

Confirm which named groups constitute saleable panel/goal/post SKUs, physical connector positions, allowable assembly rules (especially curved modules), drawing dimensions and supplier pricing. Then bind confirmed SKUs to the product pipeline and engineer-reviewed structural assemblies. Full source models are review references, not auto-approved structural designs.

## Native models inside the modular configurator

`/engineering/modular-3d` now includes a product selector for P1, Panna Kids O1 and W1 alongside the preserved conceptual system. Native mode reuses the source/component viewer and the K1 instance-count study directly inside the configurator. The static distribution supplies its relative asset base to the same page. Share a native selection with `?view=viewer&product=boisko-w1`; production uses `/engineering/modular-3d?product=boisko-w1`.

Native mode hides the conceptual dimension controls, structural results and budget rather than assigning 1.5 m placeholder rules or rates to actual geometry. All original court GLBs retain unit scale; K1 copies add/remove actual meshes at the observed pitch. K1 always identifies P1 as its source, even when accessed after selecting another court. Full native court resizing, source-backed StructuralModel and manufacturing BOM/cost remain dependent on confirmed assembly rules and supplier data. Embedded source selection and the product picker remain synchronized, with URL selection restored on reload.
