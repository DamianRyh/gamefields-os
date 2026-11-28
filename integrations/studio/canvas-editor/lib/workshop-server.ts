/* Shared helpers for the Workshop API routes (likes, owner panel). */
export const workshopHeaders={'Cache-Control':'no-store','Access-Control-Allow-Origin':'*','X-Content-Type-Options':'nosniff'};
export const wjson=(value:unknown,status=200)=>Response.json(value,{status,headers:workshopHeaders});
export const sha=async(value:string)=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))].map(x=>x.toString(16).padStart(2,'0')).join('');
export const validWorkId=(id:unknown):id is string=>typeof id==='string'&&/^[0-9a-f-]{36}$/.test(id);
const LOCAL=['127.0.0.1','localhost'];
/** Likes come from the Studio itself and from the gamefields.eu homepage gallery. */
export function voteOrigin(r:Request){
 const origin=r.headers.get('origin');if(!origin)return false;let o:URL,self:URL;try{o=new URL(origin);self=new URL(r.url)}catch{return false}
 if(o.origin===self.origin)return true;if(['www.gamefields.eu','gamefields.eu'].includes(o.hostname)&&o.protocol==='https:')return true;
 return LOCAL.includes(self.hostname)&&LOCAL.includes(o.hostname);
}
export async function smallBody(r:Request,limit:number){if(Number(r.headers.get('content-length')||0)>limit)return null;const t=await r.text();return t.length>limit?null:t}
