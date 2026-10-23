import {loadImage} from './load-image.ts';
/** One factory per render generation. Shares decoding, never GPU texture ownership. */
export function createDecodedImage(){
 const cache=new Map<string,Promise<HTMLImageElement>>();
 return (source:string):Promise<HTMLImageElement>=>{
  const existing=cache.get(source);if(existing)return existing;
  const promise=loadImage(source);
  cache.set(source,promise);
  void promise.catch(()=>{if(cache.get(source)===promise)cache.delete(source)});
  return promise;
 };
}
