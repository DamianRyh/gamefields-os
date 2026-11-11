/* Owner rule 2026-11-11: graphic elements (surface assets) always sit on a clean, single-colour surface.
   As soon as the court carries at least one element from the Grafika library, the pattern is not drawn
   (plan, 3D, textures) and the quote treats the surface as one colour plus the elements' own colours. */
type WithObjects={objects?:{kind:string;asset?:{colors?:string[]}}[]};
export const hasSurfaceAssets=(p:WithObjects)=>!!p.objects?.some(o=>o.kind!=="equipment"&&!!o.asset);
export const surfaceAssetColors=(p:WithObjects)=>(p.objects||[]).flatMap(o=>o.kind!=="equipment"&&o.asset?.colors?o.asset.colors:[]);
