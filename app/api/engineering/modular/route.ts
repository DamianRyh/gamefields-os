import { NextResponse } from "next/server";
import {
  buildCircularModularLayout,
  buildRectangularModularLayout,
  GF_3V3_MODULAR_RULES,
  GF_PANNA_MODULAR_RULES,
} from "../../../engineering/modular";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const shape = body?.shape === "CIRCLE" ? "CIRCLE" : "RECTANGLE";

    if (shape === "CIRCLE") {
      const diameterM = Number(body?.diameterM ?? 7);
      if (!Number.isFinite(diameterM) || diameterM <= 0) {
        return NextResponse.json({ error: "diameterM must be a positive number" }, { status: 400 });
      }
      return NextResponse.json({ layout: buildCircularModularLayout(diameterM, GF_PANNA_MODULAR_RULES) });
    }

    const lengthM = Number(body?.lengthM ?? 15);
    const widthM = Number(body?.widthM ?? 10);
    if (!Number.isFinite(lengthM) || !Number.isFinite(widthM) || lengthM <= 0 || widthM <= 0) {
      return NextResponse.json({ error: "lengthM and widthM must be positive numbers" }, { status: 400 });
    }

    return NextResponse.json({ layout: buildRectangularModularLayout(lengthM, widthM, GF_3V3_MODULAR_RULES) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Modular geometry generation failed" },
      { status: 500 },
    );
  }
}
