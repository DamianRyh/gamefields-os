const DB_NAME='gamefields-studio-library';
function open():Promise<IDBDatabase>{
 return new Promise((resolve,reject)=>{
  if(typeof indexedDB==='undefined'){reject(Error('Pamięć projektów jest niedostępna. Pobierz kopię JSON.'));return}
  const request=indexedDB.open(DB_NAME,1);let blocked=false;
  request.onupgradeneeded=()=>request.result.createObjectStore('records');
  request.onblocked=()=>{blocked=true;reject(Error('Zamknij starsze karty Studio i spróbuj ponownie.'))};
  request.onerror=()=>reject(request.error);
  request.onsuccess=()=>{if(blocked){request.result.close();return}resolve(request.result)};
 });
}
export async function readVaultRecord(key:string):Promise<unknown>{
 const db=await open();return new Promise((resolve,reject)=>{
  const tx=db.transaction('records','readonly'),request=tx.objectStore('records').get(key);let value:unknown;
  request.onsuccess=()=>{value=request.result};tx.oncomplete=()=>{db.close();resolve(value)};tx.onerror=tx.onabort=()=>{db.close();reject(tx.error||Error('Nie można odczytać pamięci projektu.'))};
 });
}
export async function updateVaultRecord<T>(key:string,update:(value:unknown)=>T):Promise<T>{
 const db=await open();return new Promise((resolve,reject)=>{
  const tx=db.transaction('records','readwrite'),store=tx.objectStore('records'),request=store.get(key);let result:T,error:unknown;
  request.onsuccess=()=>{try{result=update(request.result);store.put(result,key)}catch(cause){error=cause;tx.abort()}};
  tx.oncomplete=()=>{db.close();resolve(result)};
  tx.onerror=tx.onabort=()=>{db.close();reject(error||tx.error||Error('Nie udało się zapisać. Pobierz kopię JSON.'))};
 });
}
