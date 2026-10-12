import { analyzePreliminaryStructure, DEFAULT_ANALYSIS_INPUT, type StructuralAnalysisInput } from "./analysis";
import { DEFAULT_CONNECTION_FOUNDATION_ASSUMPTIONS, runConnectionFoundationEngine, type ConnectionFoundationAssumptions } from "./connection-foundation";
import { COURT_PRESETS, estimateCourtStructure, type CourtEngineeringInput, type CourtPresetId, type SteelGrade } from "./domain";
import { runEngineerReviewGate } from "./engineer";
import { DEFAULT_EUROCODE_PROFILE, runEurocodeEngine, type EurocodeProfile } from "./eurocode";
import { buildFabricationPackage } from "./fabrication";
import { solveGlobalFrame3D } from "./frame3d";
import { generateRectangularCourtModel } from "./model";
import { optimizePostSection } from "./optimizer";
import { buildEngineeringHandoffPackage } from "./package";
import { DEFAULT_PROJECT_PROFILE, type EngineeringProjectProfile } from "./project";
import { buildSolverNeutralModel } from "./solver-adapters";
import { solvePreliminaryPostFEM } from "./solver";
import { DEFAULT_STABILITY_PROFILE, runStabilityEngine, type StabilityProfile } from "./stability";
import { DEFAULT_AUTOMATIC_OPTIMIZER_SETTINGS, runAutomaticStructuralOptimizer, type AutomaticOptimizerResult, type AutomaticOptimizerSettings, type OptimizerCostWeights } from "./automatic-optimizer";

export type DesignGeneratorCourtType = "3V3" | "1V1" | "CUSTOM_RECTANGULAR";
export type DesignGeneratorPriority = "BALANCED" | "MINIMUM_STEEL" | "MINIMUM_FOUNDATION";

export interface DesignGeneratorBrief {
  projectName: string;
  projectCode: string;
  city: string;
  courtType: DesignGeneratorCourtType;
  lengthM: number;
  widthM: number;
  boardHeightM: number;
  netHeightM: number;
  goalCount?: number;
  gateCount?: number;
  steelGrade?: SteelGrade;
  windPressureKpa?: number;
  netSolidity?: number;
  impactLoadKn?: number;
  soilDesignBearingKpa?: number;
  anchorDesignTensionResistanceKn?: number;
  anchorDesignShearResistanceKn?: number;
  priority?: DesignGeneratorPriority;
}

export interface DesignGeneratorResult {
  schema: "GF-DESIGN-GENERATOR-1.0";
  status: "PRE_DESIGN";
  brief: DesignGeneratorBrief;
  seedInput: CourtEngineeringInput;
  optimizer: AutomaticOptimizerResult;
  selected: {
    found: boolean;
    designId: string | null;
    objectiveScore: number | null;
    estimatedSteelKg: number | null;
    estimatedConcreteM3: number | null;
    postSectionCode: string | null;
    railSectionCode: string | null;
    postSpacingM: number | null;
    plate: string | null;
    anchors: string | null;
    footing: string | null;
  };
  handoff: ReturnType<typeof buildEngineeringHandoffPackage> | null;
  limitations: string[];
}

function presetFor(type: DesignGeneratorCourtType): CourtPresetId {
  if (type === "1V1") return "GF-1V1-10X6";
  return "GF-3V3-15X10";
}

function defaultCounts(type: DesignGeneratorCourtType) {
  if (type === "1V1") return { goals: 2, gates: 1 };
  if (type === "3V3") return { goals: 2, gates: 2 };
  return { goals: 2, gates: 1 };
}

function priorityWeights(priority: DesignGeneratorPriority): OptimizerCostWeights {
  const base = DEFAULT_AUTOMATIC_OPTIMIZER_SETTINGS.costWeights;
  if (priority === "MINIMUM_STEEL") return { ...base, steelKg: 1.5, concreteM3: 80, supportCount: 1.0 };
  if (priority === "MINIMUM_FOUNDATION") return { ...base, steelKg: 0.85, concreteM3: 180, supportCount: 2.5 };
  return { ...base };
}

function seedInput(brief: DesignGeneratorBrief): CourtEngineeringInput {
  const preset = COURT_PRESETS[presetFor(brief.courtType)];
  const counts = defaultCounts(brief.courtType);
  return {
    ...preset,
    lengthM: Math.max(3, brief.lengthM),
    widthM: Math.max(3, brief.widthM),
    boardHeightM: Math.max(0, brief.boardHeightM),
    netHeightM: Math.max(0, brief.netHeightM),
    steelGrade: brief.steelGrade ?? preset.steelGrade,
    goalCount: brief.goalCount ?? counts.goals,
    gateCount: brief.gateCount ?? counts.gates,
  };
}

export function runDesignGenerator(args: {
  brief: DesignGeneratorBrief;
  eurocodeProfile?: EurocodeProfile;
  stabilityProfile?: StabilityProfile;
  optimizerSettings?: Partial<AutomaticOptimizerSettings>;
}): DesignGeneratorResult {
  const brief = args.brief;
  const seed = seedInput(brief);
  const analysisInput: StructuralAnalysisInput = {
    ...DEFAULT_ANALYSIS_INPUT,
    windPressureKpa: brief.windPressureKpa ?? DEFAULT_ANALYSIS_INPUT.windPressureKpa,
    netSolidity: brief.netSolidity ?? DEFAULT_ANALYSIS_INPUT.netSolidity,
    impactLoadKn: brief.impactLoadKn ?? DEFAULT_ANALYSIS_INPUT.impactLoadKn,
  };
  const connectionAssumptions: ConnectionFoundationAssumptions = {
    ...DEFAULT_CONNECTION_FOUNDATION_ASSUMPTIONS,
    soilDesignBearingKpa: brief.soilDesignBearingKpa ?? DEFAULT_CONNECTION_FOUNDATION_ASSUMPTIONS.soilDesignBearingKpa,
    anchorDesignTensionResistanceKn: brief.anchorDesignTensionResistanceKn ?? DEFAULT_CONNECTION_FOUNDATION_ASSUMPTIONS.anchorDesignTensionResistanceKn,
    anchorDesignShearResistanceKn: brief.anchorDesignShearResistanceKn ?? DEFAULT_CONNECTION_FOUNDATION_ASSUMPTIONS.anchorDesignShearResistanceKn,
  };
  const eurocodeProfile = args.eurocodeProfile ?? DEFAULT_EUROCODE_PROFILE;
  const stabilityProfile = args.stabilityProfile ?? DEFAULT_STABILITY_PROFILE;
  const priority = brief.priority ?? "BALANCED";
  const optimizerSettings: Partial<AutomaticOptimizerSettings> = {
    ...args.optimizerSettings,
    costWeights: {
      ...priorityWeights(priority),
      ...(args.optimizerSettings?.costWeights ?? {}),
    },
  };

  const optimizer = runAutomaticStructuralOptimizer({
    baseInput: seed,
    analysisInput,
    eurocodeProfile,
    stabilityProfile,
    connectionAssumptions,
    settings: optimizerSettings,
  });

  const best = optimizer.best;
  if (!best) {
    return {
      schema: "GF-DESIGN-GENERATOR-1.0",
      status: "PRE_DESIGN",
      brief,
      seedInput: seed,
      optimizer,
      selected: {
        found: false,
        designId: null,
        objectiveScore: null,
        estimatedSteelKg: null,
        estimatedConcreteM3: null,
        postSectionCode: null,
        railSectionCode: null,
        postSpacingM: null,
        plate: null,
        anchors: null,
        footing: null,
      },
      handoff: null,
      limitations: [
        "No fully feasible design was found inside the current discrete search space.",
        "Increase the optimizer search space, revise project assumptions or use larger sections/foundations before engineer review.",
        "Location is project metadata only in v1.0; wind pressure must be supplied or confirmed from the applicable project standard and National Annex.",
      ],
    };
  }

  const input = best.input;
  const model = generateRectangularCourtModel(input);
  const estimate = estimateCourtStructure(input);
  const analysis = analyzePreliminaryStructure(input, model, analysisInput);
  const solver = solvePreliminaryPostFEM(input, analysisInput);
  const frame3d = solveGlobalFrame3D(input, model, analysisInput);
  const eurocode = runEurocodeEngine({ input, model, frame3d, profile: eurocodeProfile });
  const stability = runStabilityEngine({ input, model, frame3d, eurocode, profile: stabilityProfile });
  const connectionFoundation = runConnectionFoundationEngine({ input, model, frame3d, plate: best.baseConnection, assumptions: connectionAssumptions });
  const fabrication = buildFabricationPackage({ input, estimate, model, analysis, solver, baseConnection: best.baseConnection });
  const optimization = optimizePostSection(input, analysisInput);
  const solverNeutral = buildSolverNeutralModel(input, model, solver);
  const engineerGate = runEngineerReviewGate({ analysis, solver, frame3d, eurocode, stability, connectionFoundation, baseConnection: best.baseConnection, fabrication });
  const profile: EngineeringProjectProfile = {
    ...DEFAULT_PROJECT_PROFILE,
    projectName: brief.projectName,
    projectCode: brief.projectCode,
    city: brief.city,
    revision: "P01",
  };
  const handoff = buildEngineeringHandoffPackage({
    profile,
    input,
    estimate,
    model,
    analysis,
    solver,
    frame3d,
    eurocode,
    stability,
    connectionFoundation,
    optimization,
    baseConnection: best.baseConnection,
    fabrication,
    engineerGate,
    solverNeutral,
  });

  return {
    schema: "GF-DESIGN-GENERATOR-1.0",
    status: "PRE_DESIGN",
    brief,
    seedInput: seed,
    optimizer,
    selected: {
      found: true,
      designId: best.id,
      objectiveScore: best.objectiveScore,
      estimatedSteelKg: best.estimatedSteelKg,
      estimatedConcreteM3: best.estimatedConcreteM3,
      postSectionCode: input.postSectionCode,
      railSectionCode: input.railSectionCode,
      postSpacingM: input.postSpacingM,
      plate: `${best.baseConnection.plateWidthMm}x${best.baseConnection.plateLengthMm}x${best.baseConnection.plateThicknessMm} mm`,
      anchors: `${best.baseConnection.anchorCount}xM${best.baseConnection.anchorDiameterMm}`,
      footing: `${best.baseConnection.footingConceptMm.width}x${best.baseConnection.footingConceptMm.length}x${best.baseConnection.footingConceptMm.depth} mm`,
    },
    handoff,
    limitations: [
      "GF Design Generator v1.0 produces a pre-design candidate and production-data handoff, not a signed structural design or fabrication release.",
      "Location is recorded as project metadata only; v1.0 does not derive normative wind action automatically from a city name or coordinates.",
      "Wind, impact, anchor-system resistances and geotechnical parameters must be confirmed for the actual project before approval.",
      "Current generator supports rectangular 1v1, 3v3 and custom rectangular courts. Circular panna geometry requires its dedicated geometry generator before it can be released through v1.0.",
      "Engineer Gate remains authoritative for release status and cannot be bypassed by the generator or optimizer.",
    ],
  };
}
