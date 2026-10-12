import type { CourtEngineeringInput } from "./domain";

export type Axis = "x" | "y" | "z";

export interface StructuralNode {
  id: string;
  x: number;
  y: number;
  z: number;
  restraint: "fixed" | "pinned" | "free";
}

export type StructuralMemberType = "post" | "rail" | "goal" | "gate" | "brace";

export interface StructuralMember {
  id: string;
  type: StructuralMemberType;
  startNodeId: string;
  endNodeId: string;
  sectionCode: string;
  steelGrade: string;
  lengthM: number;
}

export interface StructuralModel {
  modularProduct?: { panelRoles: Record<string, string>; cornerIds: string[]; ballStopHeightM: number; engineerApprovalRequired: true };
  nodes: StructuralNode[];
  members: StructuralMember[];
  meta: {
    lengthM: number;
    widthM: number;
    totalHeightM: number;
    postSpacingM: number;
  };
}

const round3 = (value: number) => Math.round(value * 1000) / 1000;

function nodeKey(x: number, y: number, z: number) {
  return `${round3(x)}|${round3(y)}|${round3(z)}`;
}

function segmentPositions(length: number, spacing: number) {
  const count = Math.max(1, Math.ceil(length / Math.max(spacing, 0.5)));
  return Array.from({ length: count + 1 }, (_, index) => round3((length * index) / count));
}

export function generateRectangularCourtModel(input: CourtEngineeringInput): StructuralModel {
  const totalHeightM = round3(input.boardHeightM + input.netHeightM);
  const xs = segmentPositions(input.lengthM, input.postSpacingM);
  const ys = segmentPositions(input.widthM, input.postSpacingM);
  const levels = input.netHeightM > 0
    ? [0, input.boardHeightM, totalHeightM]
    : [0, input.boardHeightM];

  const nodes: StructuralNode[] = [];
  const nodeMap = new Map<string, StructuralNode>();
  let nodeCounter = 1;

  function getNode(x: number, y: number, z: number) {
    const key = nodeKey(x, y, z);
    const existing = nodeMap.get(key);
    if (existing) return existing;
    const node: StructuralNode = {
      id: `N${String(nodeCounter++).padStart(3, "0")}`,
      x: round3(x),
      y: round3(y),
      z: round3(z),
      restraint: z === 0 ? "fixed" : "free",
    };
    nodes.push(node);
    nodeMap.set(key, node);
    return node;
  }

  const basePerimeter: Array<[number, number]> = [];
  xs.forEach((x) => basePerimeter.push([x, 0]));
  ys.slice(1).forEach((y) => basePerimeter.push([input.lengthM, y]));
  xs.slice(0, -1).reverse().forEach((x) => basePerimeter.push([x, input.widthM]));
  ys.slice(1, -1).reverse().forEach((y) => basePerimeter.push([0, y]));

  const members: StructuralMember[] = [];
  let memberCounter = 1;

  function addMember(
    type: StructuralMemberType,
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
      lengthM: round3(Math.sqrt(dx * dx + dy * dy + dz * dz)),
    });
  }

  for (const [x, y] of basePerimeter) {
    const bottom = getNode(x, y, 0);
    const boardTop = getNode(x, y, input.boardHeightM);
    addMember("post", bottom, boardTop, input.postSectionCode);
    if (totalHeightM > input.boardHeightM) {
      const top = getNode(x, y, totalHeightM);
      addMember("post", boardTop, top, input.postSectionCode);
    }
  }

  for (const z of levels) {
    for (let i = 0; i < basePerimeter.length; i += 1) {
      const [ax, ay] = basePerimeter[i];
      const [bx, by] = basePerimeter[(i + 1) % basePerimeter.length];
      addMember("rail", getNode(ax, ay, z), getNode(bx, by, z), input.railSectionCode);
    }
  }

  return {
    nodes,
    members,
    meta: {
      lengthM: input.lengthM,
      widthM: input.widthM,
      totalHeightM,
      postSpacingM: input.postSpacingM,
    },
  };
}
