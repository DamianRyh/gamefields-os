import { NextResponse } from "next/server";
import { z } from "zod";
import { runDesignGeneratorV11 } from "../../../engineering/design-generator-v11";
import { DEFAULT_COST_CATALOG_PLN } from "../../../engineering/costing";

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
  netSolidity: z.number().min(0).max(1).optional(),
  impactLoadKn: z.number().min(0).max(20).optional(),
  soilDesignBearingKpa: z.number().min(25).max(1000).optional(),
  anchorDesignTensionResistanceKn: z.number().positive().optional(),
  anchorDesignShearResistanceKn: z.number().positive().optional(),
  priority: z.enum(["BALANCED", "MINIMUM_STEEL", "MINIMUM_FOUNDATION"]).default("BALANCED"),
  wind: z.object({
    mode: z.enum(["DESIGN_PRESSURE", "BASIC_VELOCITY_SCREEN"]).default("DESIGN_PRESSURE"),
    designPressureKpa: z.number().min(0).max(5).optional(),
    basicWindVelocityMs: z.number().min(0).max(80).optional(),
    airDensityKgM3: z.number().positive().optional(),
    exposureMultiplier: z.number().positive().optional(),
    structuralMultiplier: z.number().positive().optional(),
    terrainCategory: z.enum(["0", "I", "II", "III", "IV"]).optional(),
    referenceHeightM: z.number().positive().optional(),
    sourceNote: z.string().optional(),
  }).default({ mode: "DESIGN_PRESSURE" }),
  costCatalog: z.object({
    label: z.string().min(1).optional(),
    effectiveDate: z.string().min(1).optional(),
    sourceStatus: z.enum(["USER_CONFIRMED", "BUDGETARY_DEFAULT"]).optional(),
    steelFabricatedPlnPerKg: z.number().nonnegative().optional(),
    galvanizingPlnPerKg: z.number().nonnegative().optional(),
    powderCoatingPlnPerKg: z.number().nonnegative().optional(),
    concretePlnPerM3: z.number().nonnegative().optional(),
    excavationAndBackfillPlnPerM3: z.number().nonnegative().optional(),
    anchorAssemblyPlnEach: z.number().nonnegative().optional(),
    basePlateFabricationPlnPerKg: z.number().nonnegative().optional(),
    siteInstallPlnPerSupport: z.number().nonnegative().optional(),
    transportPlnFlat: z.number().nonnegative().optional(),
    contingencyPct: z.number().min(0).max(100).optional(),
  }).optional(),
  maxStructuralCandidates: z.number().int().min(10).max(240).optional(),
  maxConnectionSeedDesigns: z.number().int().min(1).max(16).optional(),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid v1.1 generator input", details: parsed.error.flatten() }, { status: 400 });
  const body = parsed.data;
  const costCatalog = body.costCatalog ? { ...DEFAULT_COST_CATALOG_PLN, ...body.costCatalog } : DEFAULT_COST_CATALOG_PLN;
  const result = runDesignGeneratorV11({
    brief: {
      projectName: body.projectName,
      projectCode: body.projectCode,
      city: body.city,
      courtType: body.courtType,
      lengthM: body.lengthM,
      widthM: body.widthM,
      boardHeightM: body.boardHeightM,
      netHeightM: body.netHeightM,
      goalCount: body.goalCount,
      gateCount: body.gateCount,
      steelGrade: body.steelGrade,
      netSolidity: body.netSolidity,
      impactLoadKn: body.impactLoadKn,
      soilDesignBearingKpa: body.soilDesignBearingKpa,
      anchorDesignTensionResistanceKn: body.anchorDesignTensionResistanceKn,
      anchorDesignShearResistanceKn: body.anchorDesignShearResistanceKn,
      priority: body.priority,
    },
    wind: body.wind,
    costCatalog,
    optimizerSettings: {
      ...(body.maxStructuralCandidates ? { maxStructuralCandidates: body.maxStructuralCandidates } : {}),
      ...(body.maxConnectionSeedDesigns ? { maxConnectionSeedDesigns: body.maxConnectionSeedDesigns } : {}),
    },
  });
  return NextResponse.json(result, { status: result.generator.selected.found ? 200 : 422 });
}
