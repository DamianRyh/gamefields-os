import {parseVaultProject} from './project-vault.ts';
import type {Project} from './project';
import {projectDimensions} from './project-dimensions.ts';
export const SHARE_MAX_BYTES=1_800_000;
export const SHARE_LIFETIME=30*24*60*60*1000;
export function shareProject(raw:unknown,includePrivate=false):Project{
 const p=parseVaultProject(raw);
 if(includePrivate)return p;
 return parseVaultProject({...p,id:'GF-SHARED',name:'Projekt Gamefields',date:'',objects:p.objects.filter(o=>o.kind==='equipment'),arenaDesign:p.arenaDesign?{...p.arenaDesign,text:'',src:undefined}:undefined});
}
export const validShareId=(id:string)=>/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/.test(id);
export const validShareKey=(key:string)=>/^[0-9a-f]{64}$/.test(key);
export const shareHash=async(value:string)=>[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))].map(x=>x.toString(16).padStart(2,'0')).join('');
export const sharedRevision=(p:Project)=>projectDimensions(p).model?.sourceRevision??null;
export type ShareReceipt={id:string;url:string;deleteKey:string;createdAt:number;expiresAt:number};
export function parseShareReceipt(raw:unknown,origin:string):ShareReceipt|null{
 if(!raw||typeof raw!=='object')return null;const r=raw as ShareReceipt;
 if(typeof r.id!=='string'||!validShareId(r.id)||typeof r.deleteKey!=='string'||!validShareKey(r.deleteKey)||!Number.isFinite(r.createdAt)||!Number.isFinite(r.expiresAt)||r.expiresAt<=r.createdAt||r.expiresAt<=Date.now())return null;
 try{const url=new URL(r.url);if(url.origin!==origin||url.pathname!=='/shared'||url.searchParams.get('id')!==r.id||!validShareKey(url.hash.slice(1)))return null;return {id:r.id,url:origin+'/shared?id='+r.id+url.hash,deleteKey:r.deleteKey,createdAt:r.createdAt,expiresAt:r.expiresAt}}catch{return null}
}
