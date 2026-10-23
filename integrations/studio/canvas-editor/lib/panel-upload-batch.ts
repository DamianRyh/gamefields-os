/** Local orchestration only: uploads stay per texture, with no global batching state. */
export async function runPanelUploadBatch(jobs:readonly Promise<unknown>[],isActive:()=>boolean,clearFailed:(index:number)=>void,draw:()=>void):Promise<boolean>{
 const results=await Promise.allSettled(jobs);
 if(!isActive())return false;
 for(let i=0;i<results.length;i++)if(results[i].status==='rejected')clearFailed(i);
 // A failed panel is plain; successful panels remain visible. This is not an atomic scene change.
 draw();
 const failure=results.find(result=>result.status==='rejected');
 if(failure?.status==='rejected')throw failure.reason;
 return true;
}
