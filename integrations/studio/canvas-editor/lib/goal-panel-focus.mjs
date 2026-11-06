/** O-1 v2: side guards PO2 and over-goal PO3 sheets form one paint group. */
export function isGoalPanelSheet(mesh) {
  return mesh?.group === 'panels' && /^(?:PO2[LP]|PO3)_(east|west)_sheet$/.test(mesh.label);
}

export function goalPanelGroup(meshes, side = 'east') {
  if (side !== 'east' && side !== 'west') return [];
  return meshes.filter(mesh => /^(?:PO2[LP]|PO3)_/.test(mesh?.label ?? '') && mesh.label.includes(`_${side}_`));
}

export function goalPanelBounds(meshes, side = 'east') {
  const selected = goalPanelGroup(meshes, side);
  if (!selected.length) return null;
  const low = [Infinity, Infinity, Infinity], high = [-Infinity, -Infinity, -Infinity];
  for (const mesh of selected) for (const vertex of mesh.v ?? []) for (let i=0;i<3;i++) {
    low[i] = Math.min(low[i], vertex[i]);
    high[i] = Math.max(high[i], vertex[i]);
  }
  return low.every(Number.isFinite) && high.every(Number.isFinite) ? [low, high] : null;
}
