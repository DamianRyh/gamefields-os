export async function studioJson<T>(url:string,options:RequestInit={},timeout=15000):Promise<T>{
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),timeout);
 try{const response=await fetch(url,{...options,cache:'no-store',signal:controller.signal});const data=await response.json();if(!response.ok)throw Error(data.error||'Nie udało się wykonać operacji. Spróbuj ponownie.');return data as T}
 catch(error){if(controller.signal.aborted)throw Error('Odpowiedź trwa zbyt długo. Spróbuj ponownie.');throw error}
 finally{clearTimeout(timer)}
}
export async function boundedText(request:Request,maxBytes:number){
 if(Number(request.headers.get('content-length')||0)>maxBytes)return null;
 const reader=request.body?.getReader();if(!reader)return '';
 let size=0;const chunks:Uint8Array[]=[];
 while(true){const part=await reader.read();if(part.done)break;size+=part.value.byteLength;if(size>maxBytes){await reader.cancel();return null}chunks.push(part.value)}
 const bytes=new Uint8Array(size);let at=0;for(const chunk of chunks){bytes.set(chunk,at);at+=chunk.length}return new TextDecoder().decode(bytes);
}
