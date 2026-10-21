export const MAX_INQUIRY_CHARS = 500000;

// The inquiry carries editable parameters; artwork files travel separately.
export function inquirySummary(project, estimate) {
  const {src: panelArtwork, ...design} = project.arenaDesign || {};
  const objects = project.objects.map(({src, ...object}) => object);
  const summary = JSON.stringify({
    ...project,
    arenaDesign: project.arenaDesign ? design : undefined,
    objects,
    estimate: estimate || undefined,
    artwork: {
      filesIncluded: false,
      floorImages: project.objects.filter(object => object.src).length,
      panelLogo: Boolean(panelArtwork),
    },
  }, null, 2);
  if (summary.length > MAX_INQUIRY_CHARS) {
    throw new Error("Projekt jest zbyt duży do formularza. Pobierz kopię JSON i prześlij ją w dalszej rozmowie.");
  }
  return summary;
}
