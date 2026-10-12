import type { ModularLayout, ModularPanel } from "./modular";

export type ProductModuleRole = "panel" | "goal" | "gate" | "branding";

export interface ModularProductOptions {
  goalCount: number;
  gateCount: number;
  brandingPanelCount: number;
  ballStopHeightM: number;
}

export interface ModularProductLayout extends ModularLayout {
  schema: "GF-MODULAR-PRODUCT-1.2";
  productOptions: ModularProductOptions;
  panels: Array<ModularPanel & { role: ProductModuleRole }>;
  specialModules: {
    goals: string[];
    gates: string[];
    branding: string[];
    corners: Array<{ id: string; x: number; y: number }>;
  };
}

export interface ModularProductPricebookPLN {
  schema: "GF-MODULAR-PRICEBOOK-1.2";
  label: string;
  sourceStatus: "BUDGETARY_DEFAULT" | "USER_CONFIRMED";
  panelStandardPlnEach: number;
  panelBrandingPlnEach: number;
  goalModulePlnEach: number;
  gateModulePlnEach: number;
  postPlnEach: number;
  cornerConnectorPlnEach: number;
  ballStopPlnPerM2: number;
}

export const DEFAULT_MODULAR_PRICEBOOK_PLN: ModularProductPricebookPLN = {
  schema: "GF-MODULAR-PRICEBOOK-1.2",
  label: "Gamefields modular budgetary defaults — supplier confirmation required",
  sourceStatus: "BUDGETARY_DEFAULT",
  panelStandardPlnEach: 950,
  panelBrandingPlnEach: 1150,
  goalModulePlnEach: 3200,
  gateModulePlnEach: 1800,
  postPlnEach: 520,
  cornerConnectorPlnEach: 450,
  ballStopPlnPerM2: 145,
};

export interface ModularProductBomLine {
  id: string;
  name: string;
  assetKey: string;
  quantity: number;
  unit: "pcs" | "m2";
  unitBudgetPln: number;
  totalBudgetPln: number;
}

export interface ModularProductSummary {
  schema: "GF-MODULAR-PRODUCT-SUMMARY-1.2";
  bom: ModularProductBomLine[];
  totalBudgetNetPln: number;
  sourceStatus: ModularProductPricebookPLN["sourceStatus"];
  warnings: string[];
}

const money = (v: number) => Math.round(v * 100) / 100;

function closestPanelsToCenter(panels: ModularPanel[], count: number): ModularPanel[] {
  if (count <= 0 || panels.length === 0) return [];
  const center = (panels.length - 1) / 2;
  return [...panels].sort((a, b) => Math.abs(a.index - center) - Math.abs(b.index - center)).slice(0, count);
}

export function applyProductModules(
  layout: ModularLayout,
  options: Partial<ModularProductOptions> = {},
): ModularProductLayout {
  const productOptions: ModularProductOptions = {
    goalCount: Math.max(0, Math.min(2, Math.round(options.goalCount ?? 2))),
    gateCount: Math.max(0, Math.min(2, Math.round(options.gateCount ?? 1))),
    brandingPanelCount: Math.max(0, Math.round(options.brandingPanelCount ?? 4)),
    ballStopHeightM: Math.max(0, options.ballStopHeightM ?? (layout.shape === "RECTANGLE" ? 3 : 0)),
  };

  const panels = layout.panels.map((panel) => ({ ...panel, role: "panel" as ProductModuleRole }));
  const bySide = (side: ModularPanel["side"]) => panels.filter((p) => p.side === side);
  const goals: string[] = [];
  const gates: string[] = [];
  const branding: string[] = [];

  if (layout.shape === "RECTANGLE") {
    const goalSides: Array<ModularPanel["side"]> = ["E", "W"];
    for (let i = 0; i < productOptions.goalCount; i++) {
      const side = goalSides[i % goalSides.length];
      const target = closestPanelsToCenter(bySide(side), 1)[0];
      if (target && !goals.includes(target.id)) {
        target.role = "goal";
        goals.push(target.id);
      }
    }

    const gateCandidates = closestPanelsToCenter(bySide("N"), Math.max(1, productOptions.gateCount));
    for (const target of gateCandidates.slice(0, productOptions.gateCount)) {
      if (target.role === "panel") {
        target.role = "gate";
        gates.push(target.id);
      }
    }
  } else {
    const count = panels.length;
    const oppositeGoalIndexes = productOptions.goalCount >= 2 ? [0, Math.floor(count / 2)] : productOptions.goalCount === 1 ? [0] : [];
    for (const index of oppositeGoalIndexes) {
      const target = panels[index];
      if (target) {
        target.role = "goal";
        goals.push(target.id);
      }
    }
    if (productOptions.gateCount > 0 && panels.length > 4) {
      const target = panels[Math.floor(count / 4)];
      if (target && target.role === "panel") {
        target.role = "gate";
        gates.push(target.id);
      }
    }
  }

  for (const target of panels.filter((p) => p.role === "panel").slice(0, productOptions.brandingPanelCount)) {
    target.role = "branding";
    branding.push(target.id);
  }

  const cornerPoints = new Map<string, { x: number; y: number }>();
  if (layout.shape === "RECTANGLE") {
    for (const panel of panels) {
      for (const point of [panel.start, panel.end]) {
        const isCorner = (point.x === 0 || point.x === layout.resolved.lengthM) && (point.y === 0 || point.y === layout.resolved.widthM);
        if (isCorner) cornerPoints.set(`${point.x}|${point.y}`, point);
      }
    }
  }

  return {
    ...layout,
    schema: "GF-MODULAR-PRODUCT-1.2",
    productOptions,
    panels,
    specialModules: {
      goals,
      gates,
      branding,
      corners: [...cornerPoints.values()].map((point, index) => ({ id: `CORNER-${index + 1}`, ...point })),
    },
    notes: [
      ...layout.notes,
      "Special modules replace standard perimeter modules without changing the fixed-module principle.",
      "Goal, gate and branding placement is a configurable product rule and remains subject to final Gamefields product geometry.",
      "Ball-stop geometry is represented as a modular upper layer and must be structurally verified for project wind actions.",
    ],
  };
}

export function summarizeModularProduct(
  layout: ModularProductLayout,
  pricebook: ModularProductPricebookPLN = DEFAULT_MODULAR_PRICEBOOK_PLN,
): ModularProductSummary {
  const counts = {
    panel: layout.panels.filter((p) => p.role === "panel").length,
    branding: layout.panels.filter((p) => p.role === "branding").length,
    goal: layout.panels.filter((p) => p.role === "goal").length,
    gate: layout.panels.filter((p) => p.role === "gate").length,
  };
  const ballStopM2 = money(layout.perimeterM * layout.productOptions.ballStopHeightM);
  const rows: ModularProductBomLine[] = [
    { id: "panel", name: "Panel standardowy", assetKey: "gamefields/panel-standard", quantity: counts.panel, unit: "pcs", unitBudgetPln: pricebook.panelStandardPlnEach, totalBudgetPln: money(counts.panel * pricebook.panelStandardPlnEach) },
    { id: "branding", name: "Panel brandingowy", assetKey: "gamefields/panel-branding", quantity: counts.branding, unit: "pcs", unitBudgetPln: pricebook.panelBrandingPlnEach, totalBudgetPln: money(counts.branding * pricebook.panelBrandingPlnEach) },
    { id: "goal", name: "Moduł bramki", assetKey: "gamefields/goal-module", quantity: counts.goal, unit: "pcs", unitBudgetPln: pricebook.goalModulePlnEach, totalBudgetPln: money(counts.goal * pricebook.goalModulePlnEach) },
    { id: "gate", name: "Moduł wejścia", assetKey: "gamefields/gate-module", quantity: counts.gate, unit: "pcs", unitBudgetPln: pricebook.gateModulePlnEach, totalBudgetPln: money(counts.gate * pricebook.gateModulePlnEach) },
    { id: "post", name: "Słup obwodowy", assetKey: "gamefields/post-standard", quantity: layout.postsCount, unit: "pcs", unitBudgetPln: pricebook.postPlnEach, totalBudgetPln: money(layout.postsCount * pricebook.postPlnEach) },
    { id: "corner", name: "Łącznik narożny", assetKey: "gamefields/corner-standard", quantity: layout.specialModules.corners.length, unit: "pcs", unitBudgetPln: pricebook.cornerConnectorPlnEach, totalBudgetPln: money(layout.specialModules.corners.length * pricebook.cornerConnectorPlnEach) },
    { id: "ballstop", name: "Piłkochwyt", assetKey: "gamefields/ballstop-panel", quantity: ballStopM2, unit: "m2", unitBudgetPln: pricebook.ballStopPlnPerM2, totalBudgetPln: money(ballStopM2 * pricebook.ballStopPlnPerM2) },
  ].filter((line) => line.quantity > 0);
  return {
    schema: "GF-MODULAR-PRODUCT-SUMMARY-1.2",
    bom: rows,
    totalBudgetNetPln: money(rows.reduce((sum, line) => sum + line.totalBudgetPln, 0)),
    sourceStatus: pricebook.sourceStatus,
    warnings: [
      pricebook.sourceStatus === "BUDGETARY_DEFAULT" ? "Live cost uses budgetary default component rates. Replace with current Gamefields supplier rates before commercial quotation." : "User-confirmed modular component rates are active.",
      "This modular product budget covers listed perimeter components only; structural foundations, surfacing, logistics and project-specific engineering remain separate unless explicitly added.",
    ],
  };
}
