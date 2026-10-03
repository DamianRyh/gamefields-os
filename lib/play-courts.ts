export function distanceKm(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const rad = Math.PI / 180;
  const h = Math.sin((b.latitude-a.latitude)*rad/2)**2 + Math.cos(a.latitude*rad)*Math.cos(b.latitude*rad)*Math.sin((b.longitude-a.longitude)*rad/2)**2;
  return 6371 * 2 * Math.asin(Math.min(1, Math.sqrt(h)));
}

export function courtDuplicates<T extends { id: string; name: string; city: string; latitude: number; longitude: number; sports: string }>(spot: { name: string; city: string; latitude: number; longitude: number; sports: string }, candidates: T[]) {
  const key = (s: string) => s.trim().toLocaleLowerCase("pl").normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
  return candidates.filter(c => {
    const distance = distanceKm(spot,c);
    const shared = (JSON.parse(spot.sports) as string[]).some(s=>(JSON.parse(c.sports) as string[]).includes(s));
    return distance < .08 && shared || distance < .5 && key(c.name) === key(spot.name) && key(c.city) === key(spot.city);
  }).map(c=>({id:c.id,name:c.name,distanceMetres:Math.round(distanceKm(spot,c)*1000)}));
}
