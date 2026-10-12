import { runDesignGenerator, type DesignGeneratorBrief, type DesignGeneratorResult } from "./design-generator";
import { DEFAULT_COST_CATALOG_PLN, priceOptimizedDesignPLN, type CostCatalogPLN, type DesignCostBreakdownPLN } from "./costing";
import { resolveLocationWind, type LocationWindInput, type LocationWindResult } from "./location-wind";
import type { AutomaticOptimizerSettings } from "./automatic-optimizer";

export interface DesignGeneratorV11Result {
  schema: "GF-DESIGN-GENERATOR-1.1";
  status: "PRE_DESIGN";
  wind: LocationWindResult;
  generator: DesignGeneratorResult;
  cost: DesignCostBreakdownPLN | null;
  commercialStatus: "BUDGETARY" | "USER_CONFIRMED_RATES";
  warnings: string[];
}

export function runDesignGeneratorV11(args: {
  brief: DesignGeneratorBrief;
  wind: Omit<LocationWindInput, "city" | "country">;
  costCatalog?: CostCatalogPLN;
  optimizerSettings?: Partial<AutomaticOptimizerSettings>;
}): DesignGeneratorV11Result {
  const wind = resolveLocationWind({ city: args.brief.city, country: "PL", ...args.wind });
  const generator = runDesignGenerator({
    brief: { ...args.brief, windPressureKpa: wind.windPressureKpa },
    optimizerSettings: args.optimizerSettings,
  });
  const catalog = args.costCatalog ?? DEFAULT_COST_CATALOG_PLN;
  const cost = generator.optimizer.best ? priceOptimizedDesignPLN(generator.optimizer.best, catalog) : null;
  return {
    schema: "GF-DESIGN-GENERATOR-1.1",
    status: "PRE_DESIGN",
    wind,
    generator,
    cost,
    commercialStatus: catalog.sourceStatus === "USER_CONFIRMED" ? "USER_CONFIRMED_RATES" : "BUDGETARY",
    warnings: [
      "Wind result remains pre-design until project-specific PN-EN 1991-1-4 / Polish National Annex inputs are confirmed.",
      catalog.sourceStatus === "BUDGETARY_DEFAULT" ? "PLN result uses budgetary default rates and is not a supplier quotation." : "PLN result uses the supplied user-confirmed rate card.",
      "Engineer Gate and independent structural review remain mandatory before fabrication or construction release.",
    ],
  };
}
