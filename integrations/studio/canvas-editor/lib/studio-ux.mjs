// A signature includes its composition and colours, not only its family.
export function isSignaturePresetActive(project,preset,palette){
 const colours=palette?.colors;
 return project.patternFamily===preset.familyId
  && (project.patternVariant??1)===preset.variant
  && project.patternPalette===preset.paletteId
  && typeof colours?.[4]==='string' && typeof colours?.[1]==='string'
  && project.base?.toLowerCase()===colours[4].toLowerCase()
  && project.zone?.toLowerCase()===colours[1].toLowerCase();
}

export function nextProjectName(currentName,currentLabel,nextLabel){
 const next=`${nextLabel} — projekt`;
 if(!currentName?.trim())return next;
 if(currentName===`${currentLabel} — projekt`)return next;
 const prefix=`${currentLabel} · `,suffix=' — projekt';
 if(currentName.startsWith(prefix)&&currentName.endsWith(suffix)){
  const dimensions=currentName.slice(prefix.length,-suffix.length);
  // Restrict migration to a dimensions label; similarly worded custom titles stay intact.
  const number='\\d+(?:[.,]\\d+)?';
  const dimensionTitle=new RegExp(`^(?:[Ø⌀] ?${number}|${number} ?[×x] ?${number}) m$`);
  if(dimensionTitle.test(dimensions))return next;
 }
 return currentName;
}
