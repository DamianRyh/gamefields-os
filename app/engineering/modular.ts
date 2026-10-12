export type ModularCourtShape = "RECTANGLE" | "CIRCLE";

export interface ModularRuleSet {
  id: string;
  shape: ModularCourtShape;
  moduleWidthM: number;
  minModulesPerSide?: number;
  minModulesCircle?: number;
  maxModulesCircle?: number;
  boardHeightM: number;
  goalWidthM?: number;
  gateWidthM?: number;
}

export interface ModularPanel {
  id: string;
  role: "panel" | "goal" | "gate";
  side?: "N" | "E" | "S" | "W";
  index: number;
  lengthM: number;
  start: { x: number; y: number };
  end: { x: number; y: number };
  angleDeg: number;
}

export interface ModularLayout {
  schema: "GF-MODULAR-GEOMETRY-1.0";
  ruleSetId: string;
  shape: ModularCourtShape;
  requested: { lengthM?: number; widthM?: number; diameterM?: number };
  resolved: { lengthM?: number; widthM?: number; diameterM?: number };
  moduleWidthM: number;
  moduleCount: number;
  postsCount: number;
  perimeterM: number;
  panels: ModularPanel[];
  notes: string[];
}

export const GF_3V3_MODULAR_RULES: ModularRuleSet = {
  id: "GF-3V3-MODULAR-1500",
  shape: "RECTANGLE",
  moduleWidthM: 1.5,
  minModulesPerSide: 4,
  boardHeightM: 1,
  goalWidthM: 2,
  gateWidthM: 1,
};

export const GF_PANNA_MODULAR_RULES: ModularRuleSet = {
  id: "GF-PANNA-CIRCLE-MODULAR-1500",
  shape: "CIRCLE",
  moduleWidthM: 1.5,
  minModulesCircle: 10,
  maxModulesCircle: 32,
  boardHeightM: 1,
  goalWidthM: 1.2,
};

const r3 = (v: number) => Math.round(v * 1000) / 1000;
const deg = (rad: number) => (rad * 180) / Math.PI;

function snapModules(targetM: number, moduleM: number, minimum: number) {
  return Math.max(minimum, Math.round(targetM / moduleM));
}

export function buildRectangularModularLayout(
  requestedLengthM: number,
  requestedWidthM: number,
  rules: ModularRuleSet = GF_3V3_MODULAR_RULES,
): ModularLayout {
  if (rules.shape !== "RECTANGLE") throw new Error("Rectangular layout requires RECTANGLE rule set");
  const min = rules.minModulesPerSide ?? 2;
  const nx = snapModules(requestedLengthM, rules.moduleWidthM, min);
  const ny = snapModules(requestedWidthM, rules.moduleWidthM, min);
  const lengthM = r3(nx * rules.moduleWidthM);
  const widthM = r3(ny * rules.moduleWidthM);
  const panels: ModularPanel[] = [];
  let id = 1;

  const add = (side: ModularPanel["side"], index: number, ax: number, ay: number, bx: number, by: number) => {
    panels.push({
      id: `P${String(id++).padStart(3, "0")}`,
      role: "panel",
      side,
      index,
      lengthM: rules.moduleWidthM,
      start: { x: r3(ax), y: r3(ay) },
      end: { x: r3(bx), y: r3(by) },
      angleDeg: r3(deg(Math.atan2(by - ay, bx - ax))),
    });
  };

  for (let i = 0; i < nx; i++) add("N", i, i * rules.moduleWidthM, 0, (i + 1) * rules.moduleWidthM, 0);
  for (let i = 0; i < ny; i++) add("E", i, lengthM, i * rules.moduleWidthM, lengthM, (i + 1) * rules.moduleWidthM);
  for (let i = 0; i < nx; i++) add("S", i, lengthM - i * rules.moduleWidthM, widthM, lengthM - (i + 1) * rules.moduleWidthM, widthM);
  for (let i = 0; i < ny; i++) add("W", i, 0, widthM - i * rules.moduleWidthM, 0, widthM - (i + 1) * rules.moduleWidthM);

  return {
    schema: "GF-MODULAR-GEOMETRY-1.0",
    ruleSetId: rules.id,
    shape: "RECTANGLE",
    requested: { lengthM: requestedLengthM, widthM: requestedWidthM },
    resolved: { lengthM, widthM },
    moduleWidthM: rules.moduleWidthM,
    moduleCount: panels.length,
    postsCount: panels.length,
    perimeterM: r3(2 * (lengthM + widthM)),
    panels,
    notes: [
      `Requested ${requestedLengthM}×${requestedWidthM} m snapped to ${lengthM}×${widthM} m.`,
      "Geometry changes by adding/removing fixed modules; panels are never stretched.",
      "Goal/gate replacement modules are the next layer and do not change the fixed-module principle.",
    ],
  };
}

export function buildCircularModularLayout(
  requestedDiameterM: number,
  rules: ModularRuleSet = GF_PANNA_MODULAR_RULES,
): ModularLayout {
  if (rules.shape !== "CIRCLE") throw new Error("Circular layout requires CIRCLE rule set");
  const targetCircumference = Math.PI * requestedDiameterM;
  const min = rules.minModulesCircle ?? 8;
  const max = rules.maxModulesCircle ?? 64;
  const count = Math.min(max, Math.max(min, Math.round(targetCircumference / rules.moduleWidthM)));
  const angle = (2 * Math.PI) / count;
  const radius = rules.moduleWidthM / (2 * Math.sin(Math.PI / count));
  const diameterM = r3(radius * 2);
  const panels: ModularPanel[] = [];

  for (let i = 0; i < count; i++) {
    const a0 = i * angle;
    const a1 = (i + 1) * angle;
    const ax = radius * Math.cos(a0);
    const ay = radius * Math.sin(a0);
    const bx = radius * Math.cos(a1);
    const by = radius * Math.sin(a1);
    panels.push({
      id: `P${String(i + 1).padStart(3, "0")}`,
      role: "panel",
      index: i,
      lengthM: rules.moduleWidthM,
      start: { x: r3(ax), y: r3(ay) },
      end: { x: r3(bx), y: r3(by) },
      angleDeg: r3(deg(Math.atan2(by - ay, bx - ax))),
    });
  }

  return {
    schema: "GF-MODULAR-GEOMETRY-1.0",
    ruleSetId: rules.id,
    shape: "CIRCLE",
    requested: { diameterM: requestedDiameterM },
    resolved: { diameterM },
    moduleWidthM: rules.moduleWidthM,
    moduleCount: count,
    postsCount: count,
    perimeterM: r3(count * rules.moduleWidthM),
    panels,
    notes: [
      `Requested Ø${requestedDiameterM} m resolved to Ø${diameterM} m using ${count} identical chord modules.`,
      "Diameter changes by changing segment count; modules keep their production length.",
      "This is a generic circular modular cage, not yet the final 1:1 Damian/Gamefields Panna product geometry.",
    ],
  };
}
