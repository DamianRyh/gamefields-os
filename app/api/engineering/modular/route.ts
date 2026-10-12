import { NextResponse } from "next/server";
import { COURT_PRESETS } from "../../../engineering/domain";
import {
  buildCircularModularLayout,
  buildRectangularModularLayout,
  GF_3V3_MODULAR_RULES,
  GF_PANNA_MODULAR_RULES,
} from "../../../engineering/modular";
import { modularLayoutToStructuralModel } from "../../../engineering/modular-structural";
import { modularLayoutTo3DManifest } from "../../../engineering/modular-3d";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const shape = body?.shape === "CIRCLE" ? "CIRCLE" : "RECTANGLE";

    if (shape === "CIRCLE") {
      const diameterM = Number(body?.diameterM ?? 7);
      if (!Number.isFinite(diameterM) || diameterM <= 0) {
        return NextResponse.json({ error: "diameterM must be a positive number" }, { status: 400 });
      }
      const layout = buildCircularModularLayout(diameterM, GF_PANNA_MODULAR_RULES);
      const preset = COURT_PRESETS["GF-PANNA-7000"];
      const structuralModel = modularLayoutToStructuralModel(layout, preset);
      const scene3d = modularLayoutTo3DManifest(layout, preset.boardHeightM);
      return NextResponse.json({ layout, structuralModel, scene3d });
    }

    const lengthM = Number(body?.lengthM ?? 15);
    const widthM = Number(body?.widthM ?? 10);
    if (!Number.isFinite(lengthM) || !Number.isFinite(widthM) || lengthM <= 0 || widthM <= 0) {
      return NextResponse.json({ error: "lengthM and widthM must be positive numbers" }, { status: 400 });
    }

    const layout = buildRectangularModularLayout(lengthM, widthM, GF_3V3_MODULAR_RULES);
    const preset = COURT_PRESETS["GF-3V3-15X10"];
    const structuralModel = modularLayoutToStructuralModel(layout, preset);
    const scene3d = modularLayoutTo3DManifest(layout, preset.boardHeightM);
    return NextResponse.json({ layout, structuralModel, scene3d });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Modular geometry generation failed" },
      { status: 500 },
    );
  }
}
