import type { ModularLayout } from "./modular";
import {
  componentByAssetKey,
  COMPONENT_LIBRARY_SCHEMA,
} from "./component-library";
import type {
  ModularProductLayout,
  ProductModuleRole,
} from "./modular-product";

export type Modular3DComponentType =
  | "PANEL_STANDARD"
  | "PANEL_BRANDING"
  | "GOAL_MODULE"
  | "GATE_MODULE"
  | "POST_STANDARD"
  | "CORNER_STANDARD"
  | "BALLSTOP_PANEL"
  | "BALLSTOP_POST";

export interface Modular3DInstance {
  id: string;
  component: Modular3DComponentType;
  position: { x: number; y: number; z: number };
  rotationDeg: { x: number; y: number; z: number };
  dimensionsM?: { x: number; y: number; z: number };
  sourcePanelId?: string;
  assetKey: string;
  componentId?: string;
  dimensionStatus?: "PROTOTYPE_BOUNDS";
}

export interface Modular3DManifest {
  schema: "GF-MODULAR-3D-1.2";
  layoutSchema: "GF-MODULAR-GEOMETRY-1.0" | "GF-MODULAR-PRODUCT-1.2";
  instances: Modular3DInstance[];
  componentLibrary: Record<
    Modular3DComponentType,
    { assetKey: string; nominalLengthM?: number }
  >;
  componentLibrarySchema: typeof COMPONENT_LIBRARY_SCHEMA;
  notes: string[];
}

const r3 = (v: number) => Math.round(v * 1000) / 1000;

function roleToComponent(role: ProductModuleRole | "panel"): {
  component: Modular3DComponentType;
  assetKey: string;
} {
  switch (role) {
    case "goal":
      return { component: "GOAL_MODULE", assetKey: "gamefields/goal-module" };
    case "gate":
      return { component: "GATE_MODULE", assetKey: "gamefields/gate-module" };
    case "branding":
      return {
        component: "PANEL_BRANDING",
        assetKey: "gamefields/panel-branding",
      };
    default:
      return {
        component: "PANEL_STANDARD",
        assetKey: "gamefields/panel-standard",
      };
  }
}

export function modularLayoutTo3DManifest(
  layout: ModularLayout | ModularProductLayout,
  boardHeightM = 1,
): Modular3DManifest {
  const instances: Modular3DInstance[] = [];
  const postKeys = new Set<string>();
  const product =
    layout.schema === "GF-MODULAR-PRODUCT-1.2"
      ? (layout as ModularProductLayout)
      : null;

  for (const panel of layout.panels) {
    const mapped = roleToComponent(
      (panel as { role?: ProductModuleRole }).role ?? "panel",
    );
    instances.push({
      id: `3D-${panel.side ?? "C"}-${panel.index}`,
      component: mapped.component,
      assetKey: mapped.assetKey,
      position: {
        x: r3((panel.start.x + panel.end.x) / 2),
        y: r3((panel.start.y + panel.end.y) / 2),
        z: r3(boardHeightM / 2),
      },
      rotationDeg: { x: 0, y: 0, z: panel.angleDeg },
      dimensionsM: {
        x: panel.lengthM,
        y: mapped.component === "GOAL_MODULE" ? 0.18 : 0.06,
        z: boardHeightM,
      },
      sourcePanelId: panel.id,
    });

    for (const point of [panel.start, panel.end]) {
      const key = `${r3(point.x)}|${r3(point.y)}`;
      if (postKeys.has(key)) continue;
      postKeys.add(key);
      instances.push({
        id: `3D-POST-${String(postKeys.size).padStart(3, "0")}`,
        component: "POST_STANDARD",
        assetKey: "gamefields/post-standard",
        position: { x: r3(point.x), y: r3(point.y), z: r3(boardHeightM / 2) },
        rotationDeg: { x: 0, y: 0, z: 0 },
        dimensionsM: { x: 0.08, y: 0.08, z: boardHeightM },
      });
    }
  }

  if (product?.productOptions.ballStopHeightM) {
    for (const post of instances.filter(
      (i) => i.component === "POST_STANDARD",
    )) {
      instances.push({
        id: `${post.id}-UPPER`,
        component: "BALLSTOP_POST",
        assetKey: "gamefields/ballstop-post",
        position: {
          ...post.position,
          z: r3(boardHeightM + product.productOptions.ballStopHeightM / 2),
        },
        rotationDeg: { x: 0, y: 0, z: 0 },
        dimensionsM: {
          x: 0.08,
          y: 0.08,
          z: product.productOptions.ballStopHeightM,
        },
      });
    }
  }

  if (product) {
    for (const corner of product.specialModules.corners) {
      instances.push({
        id: `3D-${corner.id}`,
        component: "CORNER_STANDARD",
        assetKey: "gamefields/corner-standard",
        position: { x: corner.x, y: corner.y, z: r3(boardHeightM / 2) },
        rotationDeg: { x: 0, y: 0, z: 0 },
        dimensionsM: { x: 0.18, y: 0.18, z: 0.18 },
      });
    }

    if (product.productOptions.ballStopHeightM > 0) {
      for (const panel of product.panels) {
        instances.push({
          id: `3D-NET-${panel.id}`,
          component: "BALLSTOP_PANEL",
          assetKey: "gamefields/ballstop-panel",
          position: {
            x: r3((panel.start.x + panel.end.x) / 2),
            y: r3((panel.start.y + panel.end.y) / 2),
            z: r3(boardHeightM + product.productOptions.ballStopHeightM / 2),
          },
          rotationDeg: { x: 0, y: 0, z: panel.angleDeg },
          dimensionsM: {
            x: panel.lengthM,
            y: 0.02,
            z: product.productOptions.ballStopHeightM,
          },
          sourcePanelId: panel.id,
        });
      }
    }
  }

  return {
    schema: "GF-MODULAR-3D-1.2",
    layoutSchema: layout.schema,
    instances: instances.map((instance) => ({
      ...instance,
      componentId: componentByAssetKey(instance.assetKey).id,
      dimensionStatus: "PROTOTYPE_BOUNDS" as const,
    })),
    componentLibrarySchema: COMPONENT_LIBRARY_SCHEMA,
    componentLibrary: {
      PANEL_STANDARD: {
        assetKey: "gamefields/panel-standard",
        nominalLengthM: layout.moduleWidthM,
      },
      PANEL_BRANDING: {
        assetKey: "gamefields/panel-branding",
        nominalLengthM: layout.moduleWidthM,
      },
      GOAL_MODULE: {
        assetKey: "gamefields/goal-module",
        nominalLengthM: layout.moduleWidthM,
      },
      GATE_MODULE: {
        assetKey: "gamefields/gate-module",
        nominalLengthM: layout.moduleWidthM,
      },
      POST_STANDARD: { assetKey: "gamefields/post-standard" },
      CORNER_STANDARD: { assetKey: "gamefields/corner-standard" },
      BALLSTOP_POST: { assetKey: "gamefields/ballstop-post" },
      BALLSTOP_PANEL: {
        assetKey: "gamefields/ballstop-panel",
        nominalLengthM: layout.moduleWidthM,
      },
    },
    notes: [
      "Each physical product element is emitted as a separate 3D instance; the whole court is never stretched.",
      "Stable assetKey values are the contract for swapping prototype primitives to final GLB/PBR assets.",
      "All dimensions are prototype placement bounds, not confirmed manufacturing dimensions. GLB assets must follow the catalogue units/axis/origin contract; do not stretch a final asset to fit a court.",
      "Special modules remain product-rule geometry until final Gamefields manufacturing dimensions are confirmed.",
    ],
  };
}
