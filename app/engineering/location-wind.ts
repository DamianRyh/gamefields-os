export type WindInputMode = "DESIGN_PRESSURE" | "BASIC_VELOCITY_SCREEN";
export type TerrainCategory = "0" | "I" | "II" | "III" | "IV";

export interface LocationWindInput {
  city: string;
  country: "PL";
  mode: WindInputMode;
  designPressureKpa?: number;
  basicWindVelocityMs?: number;
  airDensityKgM3?: number;
  exposureMultiplier?: number;
  structuralMultiplier?: number;
  terrainCategory?: TerrainCategory;
  referenceHeightM?: number;
  sourceNote?: string;
}

export interface LocationWindResult {
  schema: "GF-LOCATION-WIND-1.1";
  status: "PRE_DESIGN";
  city: string;
  country: "PL";
  mode: WindInputMode;
  windPressureKpa: number;
  source: "USER_DESIGN_PRESSURE" | "PHYSICS_SCREEN_FROM_BASIC_VELOCITY";
  verificationRequired: true;
  terrainCategory?: TerrainCategory;
  referenceHeightM?: number;
  notes: string[];
}

export function resolveLocationWind(input: LocationWindInput): LocationWindResult {
  if (input.mode === "DESIGN_PRESSURE") {
    const pressure = Math.max(0, input.designPressureKpa ?? 0.8);
    return {
      schema: "GF-LOCATION-WIND-1.1",
      status: "PRE_DESIGN",
      city: input.city,
      country: "PL",
      mode: input.mode,
      windPressureKpa: pressure,
      source: "USER_DESIGN_PRESSURE",
      verificationRequired: true,
      terrainCategory: input.terrainCategory,
      referenceHeightM: input.referenceHeightM,
      notes: [
        "Design pressure was supplied directly by the project input and is not derived from the city name.",
        input.sourceNote ?? "Confirm wind action against the applicable PN-EN 1991-1-4 edition and Polish National Annex before approval.",
      ],
    };
  }

  const rho = input.airDensityKgM3 ?? 1.25;
  const velocity = Math.max(0, input.basicWindVelocityMs ?? 22);
  const exposure = Math.max(0.1, input.exposureMultiplier ?? 1);
  const structural = Math.max(0.1, input.structuralMultiplier ?? 1);
  const pressure = (0.5 * rho * velocity * velocity / 1000) * exposure * structural;
  return {
    schema: "GF-LOCATION-WIND-1.1",
    status: "PRE_DESIGN",
    city: input.city,
    country: "PL",
    mode: input.mode,
    windPressureKpa: pressure,
    source: "PHYSICS_SCREEN_FROM_BASIC_VELOCITY",
    verificationRequired: true,
    terrainCategory: input.terrainCategory,
    referenceHeightM: input.referenceHeightM,
    notes: [
      "This is a transparent dynamic-pressure screening calculation, not a complete EN 1991-1-4 terrain/orography/peak-velocity-pressure derivation.",
      "Basic velocity, terrain/exposure, structural factor and applicable National Annex must be confirmed by the structural engineer.",
      input.sourceNote ?? "City is metadata only in v1.1; no unsupported city-to-wind-zone lookup is performed.",
    ],
  };
}
