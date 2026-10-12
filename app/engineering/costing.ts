import type { OptimizedDesignResult } from "./automatic-optimizer";

export interface CostCatalogPLN {
  schema: "GF-COST-CATALOG-PLN-1.1";
  label: string;
  effectiveDate: string;
  sourceStatus: "USER_CONFIRMED" | "BUDGETARY_DEFAULT";
  steelFabricatedPlnPerKg: number;
  galvanizingPlnPerKg: number;
  powderCoatingPlnPerKg: number;
  concretePlnPerM3: number;
  excavationAndBackfillPlnPerM3: number;
  anchorAssemblyPlnEach: number;
  basePlateFabricationPlnPerKg: number;
  siteInstallPlnPerSupport: number;
  transportPlnFlat: number;
  contingencyPct: number;
}

export const DEFAULT_COST_CATALOG_PLN: CostCatalogPLN = {
  schema: "GF-COST-CATALOG-PLN-1.1",
  label: "Gamefields budgetary defaults — user confirmation required",
  effectiveDate: "2026-10-12",
  sourceStatus: "BUDGETARY_DEFAULT",
  steelFabricatedPlnPerKg: 16,
  galvanizingPlnPerKg: 4,
  powderCoatingPlnPerKg: 5,
  concretePlnPerM3: 650,
  excavationAndBackfillPlnPerM3: 350,
  anchorAssemblyPlnEach: 95,
  basePlateFabricationPlnPerKg: 8,
  siteInstallPlnPerSupport: 220,
  transportPlnFlat: 1800,
  contingencyPct: 10,
};

export interface DesignCostBreakdownPLN {
  schema: "GF-DESIGN-COST-1.1";
  currency: "PLN";
  catalogLabel: string;
  catalogEffectiveDate: string;
  catalogSourceStatus: CostCatalogPLN["sourceStatus"];
  steelFabrication: number;
  corrosionProtection: number;
  basePlates: number;
  anchors: number;
  concrete: number;
  excavationAndBackfill: number;
  siteInstallation: number;
  transport: number;
  subtotal: number;
  contingency: number;
  totalNetPln: number;
  unitMetrics: {
    steelKg: number;
    concreteM3: number;
    supportCount: number;
    anchorCountTotal: number;
  };
  warnings: string[];
}

function money(v: number) { return Math.round(v * 100) / 100; }

export function priceOptimizedDesignPLN(design: OptimizedDesignResult, catalog: CostCatalogPLN = DEFAULT_COST_CATALOG_PLN): DesignCostBreakdownPLN {
  const footing = design.baseConnection.footingConceptMm;
  const footingM3 = (footing.width / 1000) * (footing.length / 1000) * (footing.depth / 1000);
  const totalConcrete = Math.max(design.estimatedConcreteM3, footingM3);
  const supportCount = Math.max(1, Math.round(totalConcrete / Math.max(1e-9, footingM3)));
  const anchorCountTotal = supportCount * design.baseConnection.anchorCount;
  const steelFabrication = design.estimatedSteelKg * catalog.steelFabricatedPlnPerKg;
  const corrosionProtection = design.estimatedSteelKg * (catalog.galvanizingPlnPerKg + catalog.powderCoatingPlnPerKg);
  const basePlates = design.estimatedBasePlateKg * catalog.basePlateFabricationPlnPerKg;
  const anchors = anchorCountTotal * catalog.anchorAssemblyPlnEach;
  const concrete = totalConcrete * catalog.concretePlnPerM3;
  const excavationAndBackfill = totalConcrete * catalog.excavationAndBackfillPlnPerM3;
  const siteInstallation = supportCount * catalog.siteInstallPlnPerSupport;
  const transport = catalog.transportPlnFlat;
  const subtotal = steelFabrication + corrosionProtection + basePlates + anchors + concrete + excavationAndBackfill + siteInstallation + transport;
  const contingency = subtotal * Math.max(0, catalog.contingencyPct) / 100;
  return {
    schema: "GF-DESIGN-COST-1.1",
    currency: "PLN",
    catalogLabel: catalog.label,
    catalogEffectiveDate: catalog.effectiveDate,
    catalogSourceStatus: catalog.sourceStatus,
    steelFabrication: money(steelFabrication),
    corrosionProtection: money(corrosionProtection),
    basePlates: money(basePlates),
    anchors: money(anchors),
    concrete: money(concrete),
    excavationAndBackfill: money(excavationAndBackfill),
    siteInstallation: money(siteInstallation),
    transport: money(transport),
    subtotal: money(subtotal),
    contingency: money(contingency),
    totalNetPln: money(subtotal + contingency),
    unitMetrics: { steelKg: design.estimatedSteelKg, concreteM3: totalConcrete, supportCount, anchorCountTotal },
    warnings: [
      catalog.sourceStatus === "BUDGETARY_DEFAULT" ? "Budgetary default rates are active; replace them with current supplier/subcontractor rates before quotation." : "User-confirmed cost catalog is active.",
      "Cost excludes VAT, design fees, permits, surveys, geotechnics, utility conflicts and non-structural court equipment unless explicitly added elsewhere.",
    ],
  };
}

export function costingToCsv(cost: DesignCostBreakdownPLN): string {
  const rows = [
    ["item", "pln_net"],
    ["steel_fabrication", cost.steelFabrication],
    ["corrosion_protection", cost.corrosionProtection],
    ["base_plates", cost.basePlates],
    ["anchors", cost.anchors],
    ["concrete", cost.concrete],
    ["excavation_and_backfill", cost.excavationAndBackfill],
    ["site_installation", cost.siteInstallation],
    ["transport", cost.transport],
    ["subtotal", cost.subtotal],
    ["contingency", cost.contingency],
    ["total_net", cost.totalNetPln],
  ];
  return rows.map((r) => r.join(",")).join("\n");
}
