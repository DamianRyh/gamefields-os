/** Panna Play (O-1): goal-adjacent rising panels, not the goals or central PO3. */
export const GOAL_PANEL_PREFIX = 'PO2 ';

export function isGoalPanelSheet(mesh) {
  return typeof mesh?.label === 'string' && /^PO2 (?:0|3\.141592653589793) (?:-?1) blacha$/.test(mesh.label);
}

export function isGoalPanelPart(mesh) {
  return typeof mesh?.label === 'string' && /^PO2 (?:0|3\.141592653589793) (?:-?1) /.test(mesh.label);
}

export function goalPanelMeshes(meshes, side = 'both') {
  const sheets = meshes.filter(isGoalPanelSheet);
  if (side === 'both') return sheets;
  const marker = side === 'near' ? 'PO2 0 ' : 'PO2 3.141592653589793 ';
  return sheets.filter(mesh => mesh.label.startsWith(marker));
}

export function goalPanelBounds(meshes, side = 'near') {
  const selected = meshes.filter(mesh => isGoalPanelPart(mesh) && (side === 'both' || mesh.label.startsWith(side === 'near' ? 'PO2 0 ' : 'PO2 3.141592653589793 ')));
  if (!selected.length) return null;
  const min = [Infinity, Infinity, Infinity], max = [-Infinity, -Infinity, -Infinity];
  for (const mesh of selected) for (const vertex of mesh.v ?? []) for (let axis = 0; axis < 3; axis++) {
    min[axis] = Math.min(min[axis], vertex[axis]);
    max[axis] = Math.max(max[axis], vertex[axis]);
  }
  return min.every(Number.isFinite) && max.every(Number.isFinite) ? [min, max] : null;
}
