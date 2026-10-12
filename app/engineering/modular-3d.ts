import type { ModularLayout } from "./modular";

export type Modular3DComponentType = "PANEL_STANDARD" | "POST_STANDARD";

export interface Modular3DInstance {
  id: string;
  component: Modular3DComponentType;
  position: { x: number; y: number; z: number };
  rotationDeg: { x: number; y: number; z: number };
  dimensionsM?: { x: number; y: number; z: number };
  sourcePanelId?: string;
}

export interface Modular3DManifest {
  schema: "GF-MODULAR-3D-1.0";
  layoutSchema: "GF-MODULAR-GEOMETRY-1.0";
  instances: Modular3DInstance[];
  componentLibrary: {
    PANEL_STANDARD: { assetKey: string; nominalLengthM: number };
    POST_STANDARD: { assetKey: string };
  };
  notes: string[];
}

const r3 = (v: number) => Math.round(v * 1000) / 1000;

export function modularLayoutTo3DManifest(layout: ModularLayout, boardHeightM = 1): Modular3DManifest {
  const instances: Modular3DInstance[] = [];
  const postKeys = new Set<string>();

  for (const panel of layout.panels) {
    instances.push({
      id: `3D-${panel.id}`,
      component: "PANEL_STANDARD",
      position: {
        x: r3((panel.start.x + panel.end.x) / 2),
        y: r3((panel.start.y + panel.end.y) / 2),
        z: r3(boardHeightM / 2),
      },
      rotationDeg: { x: 0, y: 0, z: panel.angleDeg },
      dimensionsM: { x: panel.lengthM, y: 0.06, z: boardHeightM },
      sourcePanelId: panel.id,
    });

    for (const point of [panel.start, panel.end]) {
      const key = `${r3(point.x)}|${r3(point.y)}`;
      if (postKeys.has(key)) continue;
      postKeys.add(key);
      instances.push({
        id: `3D-POST-${String(postKeys.size).padStart(3, "0")}`,
        component: "POST_STANDARD",
        position: { x: r3(point.x), y: r3(point.y), z: r3(boardHeightM / 2) },
        rotationDeg: { x: 0, y: 0, z: 0 },
        dimensionsM: { x: 0.08, y: 0.08, z: boardHeightM },
      });
    }
  }

  return {
    schema: "GF-MODULAR-3D-1.0",
    layoutSchema: "GF-MODULAR-GEOMETRY-1.0",
    instances,
    componentLibrary: {
      PANEL_STANDARD: { assetKey: "gamefields/panel-standard", nominalLengthM: layout.moduleWidthM },
      POST_STANDARD: { assetKey: "gamefields/post-standard" },
    },
    notes: [
      "Each module is a separate 3D instance; no whole-court X/Y scaling is required.",
      "GLB/mesh assets can be swapped behind stable assetKey values without changing layout logic.",
      "Goal, gate and corner component assets will be introduced as explicit special module types once product geometry is confirmed.",
    ],
  };
}
