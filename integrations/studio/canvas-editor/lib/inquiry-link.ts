import type {Project} from './project';
import {projectLink} from './project-link';
import {shareProject,parseShareReceipt} from './shared-project';
import {studioJson} from './studio-http';

/** A 1:1 link to the configuration for the inquiry e-mail (same server snapshot as "Link do projektu", 30 days).
 *  Returns null on any failure: the inquiry must never wait on or fail because of the link. */
export async function createInquiryLink(project:Project,origin:string,timeout=8000):Promise<string|null>{
 try{
  const snapshot=shareProject(project,true);
  const data=await studioJson<{id:string;key:string;deleteKey:string;createdAt:number;expiresAt:number}>('/api/shared',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({project:snapshot,includePrivate:true,consent:true})},timeout);
  const receipt=parseShareReceipt({...data,url:origin+'/shared?id='+data.id+'#'+data.key},origin);
  if(!receipt)return null;
  try{const old=JSON.parse(localStorage.getItem('gamefields-shared-links-v1')||'[]');localStorage.setItem('gamefields-shared-links-v1',JSON.stringify([receipt,...(Array.isArray(old)?old:[])].slice(0,10)))}catch{}
  return projectLink(snapshot,origin,receipt);
 }catch{return null}
}
