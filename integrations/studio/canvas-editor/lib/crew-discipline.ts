export type CrewDiscipline='street football'|'panna football'|'teqball'|'basketball 3x3'|'basketball'|'';
export function crewDiscipline(question:string,sport:string):CrewDiscipline{
 const detect=(value:string):CrewDiscipline=>{
  if(/teqball/i.test(value))return 'teqball';
  if(/panna|piłka nożna\s*1\s*[×xv]\s*1/i.test(value))return 'panna football';
  if(/koszyk|basketball|basket/i.test(value))return /3\s*[×xv]\s*3/i.test(value)?'basketball 3x3':'basketball';
  if(/street (football|soccer)|piłka nożna\s*3\s*[×xv]\s*3/i.test(value))return 'street football';
  return '';
 };
 return detect(question)||detect(sport);
}
