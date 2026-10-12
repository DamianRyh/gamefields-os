import { z } from "zod";
import { COURT_PRESETS } from "./domain";
import {
  buildCircularModularLayout,
  buildRectangularModularLayout,
} from "./modular";
import {
  applyProductModules,
  summarizeModularProduct,
} from "./modular-product";
import { modularLayoutTo3DManifest } from "./modular-3d";
import { modularLayoutToStructuralModel } from "./modular-structural";

// Resource/preview limits only; these are not approved production dimensions.
export const modularRequestSchema = z.object({
  shape: z.enum(["RECTANGLE", "CIRCLE"]).default("RECTANGLE"),
  lengthM: z.number().finite().positive().max(120).default(15),
  widthM: z.number().finite().positive().max(90).default(10),
  diameterM: z.number().finite().positive().max(20).default(7),
  goalCount: z.number().int().min(0).max(2).default(2),
  gateCount: z.number().int().min(0).max(2).default(1),
  brandingPanelCount: z.number().int().min(0).max(200).default(4),
  ballStopHeightM: z.number().finite().min(0).max(5).optional(),
});
export type ModularRequest = z.input<typeof modularRequestSchema>;
export function generateModularProduct(raw: ModularRequest) {
  const request = modularRequestSchema.parse(raw);
  const geometry =
    request.shape === "CIRCLE"
      ? buildCircularModularLayout(request.diameterM)
      : buildRectangularModularLayout(request.lengthM, request.widthM);
  const layout = applyProductModules(geometry, request);
  const preset =
    COURT_PRESETS[
      request.shape === "CIRCLE" ? "GF-PANNA-7000" : "GF-3V3-15X10"
    ];
  const structuralModel = modularLayoutToStructuralModel(layout, preset);
  const scene3d = modularLayoutTo3DManifest(layout, preset.boardHeightM);
  const productSummary = summarizeModularProduct(layout);
  return {
    geometry,
    layout,
    structuralModel,
    scene3d,
    productSummary,
    engineeringGate: {
      status: "REQUIRES_ENGINEER_REVIEW" as const,
      approved: false as const,
      notes: [
        "Prototype geometry and assumed fixed supports are not a verified structural design.",
        "Goal/gate headers, corner connections, upper-layer posts, anchors, wind actions and ground conditions require engineer confirmation.",
      ],
    },
  };
}
export type ModularResponse = ReturnType<typeof generateModularProduct>;
