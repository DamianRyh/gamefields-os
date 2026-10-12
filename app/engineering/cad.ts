import type { FabricationPackage } from "./fabrication";
import type { StructuralModel } from "./model";

function pair(code: number, value: string | number) {
  return `${code}\n${value}\n`;
}

export function modelToDxf(model: StructuralModel): string {
  const nodes = new Map(model.nodes.map((node) => [node.id, node]));
  let out = "0\nSECTION\n2\nHEADER\n0\nENDSEC\n0\nSECTION\n2\nENTITIES\n";
  for (const member of model.members) {
    const a = nodes.get(member.startNodeId);
    const b = nodes.get(member.endNodeId);
    if (!a || !b) continue;
    out += pair(0, "LINE") + pair(8, member.type.toUpperCase());
    out += pair(10, (a.x * 1000).toFixed(3)) + pair(20, (a.y * 1000).toFixed(3)) + pair(30, (a.z * 1000).toFixed(3));
    out += pair(11, (b.x * 1000).toFixed(3)) + pair(21, (b.y * 1000).toFixed(3)) + pair(31, (b.z * 1000).toFixed(3));
  }
  return `${out}0\nENDSEC\n0\nEOF\n`;
}

export function basePlateToDxf(fabrication: FabricationPackage): string {
  const plate = fabrication.plates[0];
  let out = "0\nSECTION\n2\nENTITIES\n";
  if (!plate) return `${out}0\nENDSEC\n0\nEOF\n`;
  const x = plate.widthMm / 2;
  const y = plate.lengthMm / 2;
  const segments = [
    [-x, -y, x, -y], [x, -y, x, y], [x, y, -x, y], [-x, y, -x, -y],
  ];
  for (const [x1, y1, x2, y2] of segments) {
    out += pair(0, "LINE") + pair(8, "PLATE") + pair(10, x1) + pair(20, y1) + pair(30, 0);
    out += pair(11, x2) + pair(21, y2) + pair(31, 0);
  }
  for (const hole of plate.holes) {
    out += pair(0, "CIRCLE") + pair(8, "HOLES") + pair(10, hole.xMm) + pair(20, hole.yMm) + pair(30, 0) + pair(40, hole.diameterMm / 2);
  }
  return `${out}0\nENDSEC\n0\nEOF\n`;
}

function s(value: string) {
  return `'${value.replaceAll("'", "''")}'`;
}

export function modelToStepReference(model: StructuralModel, name = "GAMEFIELDS_STRUCTURAL_REFERENCE"): string {
  const lines: string[] = [];
  let next = 1;
  const pointIds = new Map<string, number>();

  for (const node of model.nodes) {
    const id = next++;
    pointIds.set(node.id, id);
    lines.push(`#${id}=CARTESIAN_POINT(${s(node.id)},(${(node.x * 1000).toFixed(3)},${(node.y * 1000).toFixed(3)},${(node.z * 1000).toFixed(3)}));`);
  }

  const curveIds: number[] = [];
  for (const member of model.members) {
    const a = pointIds.get(member.startNodeId);
    const b = pointIds.get(member.endNodeId);
    if (!a || !b) continue;
    const id = next++;
    curveIds.push(id);
    lines.push(`#${id}=POLYLINE(${s(`${member.id}|${member.sectionCode}`)},(#${a},#${b}));`);
  }

  const compoundId = next++;
  lines.push(`#${compoundId}=GEOMETRIC_CURVE_SET(${s(name)},(${curveIds.map((id) => `#${id}`).join(",")}));`);

  return [
    "ISO-10303-21;",
    "HEADER;",
    "FILE_DESCRIPTION(('Gamefields structural centerline reference'),'2;1');",
    `FILE_NAME(${s(`${name}.step`)},'',('Gamefields'),('Gamefields Engineering'),'GF-STEP-REF-0.4','Gamefields','');`,
    "FILE_SCHEMA(('AUTOMOTIVE_DESIGN_CC2'));",
    "ENDSEC;",
    "DATA;",
    ...lines,
    "ENDSEC;",
    "END-ISO-10303-21;",
  ].join("\n");
}
