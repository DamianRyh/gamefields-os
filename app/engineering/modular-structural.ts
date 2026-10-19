import type { CourtEngineeringInput } from "./domain";
import type {
  StructuralMember,
  StructuralModel,
  StructuralNode,
} from "./model";
import type { ModularLayout } from "./modular";
import type { ModularProductLayout } from "./modular-product";

const r3 = (v: number) => Math.round(v * 1000) / 1000;
const key = (x: number, y: number, z: number) => `${r3(x)}|${r3(y)}|${r3(z)}`;

export function modularLayoutToStructuralModel(
  layout: ModularLayout | ModularProductLayout,
  input: Pick<
    CourtEngineeringInput,
    | "boardHeightM"
    | "netHeightM"
    | "postSectionCode"
    | "railSectionCode"
    | "steelGrade"
  >,
): StructuralModel {
  const netHeightM =
    layout.schema === "GF-MODULAR-PRODUCT-1.2"
      ? layout.productOptions.ballStopHeightM
      : input.netHeightM;
  const totalHeightM = r3(input.boardHeightM + netHeightM);
  const levels =
    netHeightM > 0
      ? [0, input.boardHeightM, totalHeightM]
      : [0, input.boardHeightM];
  const nodes: StructuralNode[] = [];
  const members: StructuralMember[] = [];
  const nodeMap = new Map<string, StructuralNode>();
  let nodeCounter = 1;
  let memberCounter = 1;

  function getNode(x: number, y: number, z: number) {
    const k = key(x, y, z);
    const existing = nodeMap.get(k);
    if (existing) return existing;
    const node: StructuralNode = {
      id: `N${String(nodeCounter++).padStart(3, "0")}`,
      x: r3(x),
      y: r3(y),
      z: r3(z),
      restraint: z === 0 ? "fixed" : "free",
    };
    nodes.push(node);
    nodeMap.set(k, node);
    return node;
  }

  function addMember(
    type: StructuralMember["type"],
    a: StructuralNode,
    b: StructuralNode,
    sectionCode: string,
  ) {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dz = b.z - a.z;
    members.push({
      id: `M${String(memberCounter++).padStart(3, "0")}`,
      type,
      startNodeId: a.id,
      endNodeId: b.id,
      sectionCode,
      steelGrade: input.steelGrade,
      lengthM: r3(Math.sqrt(dx * dx + dy * dy + dz * dz)),
    });
  }

  const uniqueBasePoints = new Map<string, { x: number; y: number }>();
  for (const panel of layout.panels) {
    uniqueBasePoints.set(`${panel.start.x}|${panel.start.y}`, panel.start);
    uniqueBasePoints.set(`${panel.end.x}|${panel.end.y}`, panel.end);
  }

  for (const point of uniqueBasePoints.values()) {
    const bottom = getNode(point.x, point.y, 0);
    const boardTop = getNode(point.x, point.y, input.boardHeightM);
    addMember("post", bottom, boardTop, input.postSectionCode);
    if (totalHeightM > input.boardHeightM) {
      addMember(
        "post",
        boardTop,
        getNode(point.x, point.y, totalHeightM),
        input.postSectionCode,
      );
    }
  }

  for (const z of levels) {
    for (const panel of layout.panels) {
      // No ground rail crosses an entrance/goal opening. The upper edge is a provisional header.
      if (z === 0 && (panel.role === "goal" || panel.role === "gate")) continue;
      addMember(
        z === input.boardHeightM &&
          (panel.role === "goal" || panel.role === "gate")
          ? panel.role
          : "rail",
        getNode(panel.start.x, panel.start.y, z),
        getNode(panel.end.x, panel.end.y, z),
        input.railSectionCode,
      );
    }
  }

  const xs = [...uniqueBasePoints.values()].map((p) => p.x);
  const ys = [...uniqueBasePoints.values()].map((p) => p.y);
  const lengthM =
    layout.shape === "RECTANGLE"
      ? (layout.resolved.lengthM ?? Math.max(...xs) - Math.min(...xs))
      : (layout.resolved.diameterM ?? Math.max(...xs) - Math.min(...xs));
  const widthM =
    layout.shape === "RECTANGLE"
      ? (layout.resolved.widthM ?? Math.max(...ys) - Math.min(...ys))
      : (layout.resolved.diameterM ?? Math.max(...ys) - Math.min(...ys));

  return {
    nodes,
    members,
    ...(layout.schema === "GF-MODULAR-PRODUCT-1.2"
      ? {
          modularProduct: {
            panelRoles: Object.fromEntries(
              layout.panels.map((p) => [p.id, p.role]),
            ),
            cornerIds: layout.specialModules.corners.map((c) => c.id),
            ballStopHeightM: netHeightM,
            engineerApprovalRequired: true as const,
          },
        }
      : {}),
    meta: {
      lengthM: r3(lengthM),
      widthM: r3(widthM),
      totalHeightM,
      postSpacingM: layout.moduleWidthM,
    },
  };
}
