export const CONTACT_ORIGIN = "https://www.gamefields.eu";
export type InquiryState = "idle" | "waiting" | "attached" | "error";
type Target = Pick<Window, "postMessage">;
type Options = {
 onState: (state: InquiryState, message: string) => void;
 timeoutMs?: number;
 schedule?: typeof setTimeout;
 cancelTimer?: typeof clearTimeout;
 createId?: () => string;
};

// An acknowledgement confirms attachment to the form, never email delivery.
export function createInquiryTransport({onState, timeoutMs=15000, schedule=setTimeout, cancelTimer=clearTimeout, createId=()=>crypto.randomUUID()}:Options){
 let pending:{target:Target;summary:string;id:string}|null=null;
 let timer:ReturnType<typeof setTimeout>|undefined;
 const clear=()=>{if(timer!==undefined)cancelTimer(timer);timer=undefined;pending=null};
 const fail=(message:string)=>{clear();onState("error",message)};
 const send=()=>{
  if(!pending)return;
  try{pending.target.postMessage({type:"gf-inquiry",requestId:pending.id,summary:pending.summary},CONTACT_ORIGIN)}
  catch{fail("Nie udało się przekazać projektu. Spróbuj ponownie lub pobierz kopię JSON.")}
 };
 return {
  start(target:Target,summary:string,waitForReady=false){
   clear();pending={target,summary,id:createId()};
   onState("waiting","Dołączam parametry do formularza…");
   timer=schedule(()=>fail("Formularz nie potwierdził dołączenia projektu. Spróbuj ponownie lub pobierz kopię JSON."),timeoutMs);
   if(!waitForReady)send();
  },
  receive(event:Pick<MessageEvent,"origin"|"source"|"data">){
   if(!pending||event.origin!==CONTACT_ORIGIN||event.source!==pending.target)return false;
   const data=event.data;
   if(data?.type==="gf-contact-ready"){send();return true}
   if(data?.requestId!==pending.id)return false;
   if(data.type==="gf-inquiry-attached"&&data.summaryLength===pending.summary.length){
    clear();onState("attached","Parametry dołączone do formularza. Uzupełnij kontakt i wyślij zapytanie.");return true;
   }
   if(data.type==="gf-inquiry-rejected"){
    fail("Formularz nie przyjął parametrów projektu. Spróbuj ponownie lub pobierz kopię JSON.");return true;
   }
   return false;
  },
  dispose:clear,
 };
}
