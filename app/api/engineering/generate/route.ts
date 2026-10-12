import { NextResponse } from "next/server";
import { z } from "zod";
import { runDesignGenerator } from "../../../engineering/design-generator";

const bodySchema = z.object({
  projectName: z.string().min(1).default("Gamefields generated court"),
  projectCode: z.string().min(1).default("GF-GEN-001"),
  city: z.string().min(1).default("Warsaw"),
  courtType: z.enum(["3V3", "1V1", "CUSTOM_RECTANGULAR"]).default("3V3"),
  lengthM: z.number().min(3).max(60).default(15),
  widthM: z.number().min(3).max(40).default(10),
  boardHeightM: z.number().min(0).max(4).default(1),
  netHeightM: z.number().min(0).max(10).default(4),
  goalCount: z.number().int().min(0).max(8).optional(),
  gateCount: z.number().int().min(0).max(8).optional(),
  steelGrade: z.enum(["S235", "S275", "S355"]).optional(),
  windPressureKpa: z.number().min(0).max(5).optional(),
  netSolidity: z.number().min(0).max(1).optional(),
  impactLoadKn: z.number().min(0).max(20).optional(),
  soilDesignBearingKpa: z.number().min(25).max(1000).optional(),
  anchorDesignTensionResistanceKn: z.number().positive().optional(),
  anchorDesignShearResistanceKn: z.number().positive().optional(),
  priority: z.enum(["BALANCED", "MINIMUM_STEEL", "MINIMUM_FOUNDATION"]).default("BALANCED"),
  maxStructuralCandidates: z.number().int().min(10).max(240).optional(),
  maxConnectionSeedDesigns: z.number().int().min(1).max(16).optional(),
  export: z.enum(["json", "handoff_json"]).default("json"),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid design-generator input", details: parsed.error.flatten() }, { status: 400 });

  const { export: exportMode, maxStructuralCandidates, maxConnectionSeedDesigns, ...brief } = parsed.data;
  const result = runDesignGenerator({
    brief,
    optimizerSettings: {
      ...(maxStructuralCandidates ? { maxStructuralCandidates } : {}),
      ...(maxConnectionSeedDesigns ? { maxConnectionSeedDesigns } : {}),
    },
  });

  if (exportMode === "handoff_json") {
    if (!result.handoff) return NextResponse.json({ error: "No feasible design/handoff found", generator: result }, { status: 422 });
    const filename = `${brief.projectCode.replace(/[^A-Za-z0-9_-]/g, "_")}-handoff.json`;
    return new Response(JSON.stringify(result.handoff, null, 2), {
      headers: {
        "content-type": "application/json; charset=utf-8",
        "content-disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  return NextResponse.json(result, { status: result.selected.found ? 200 : 422 });
}
