export const CONTACT_ORIGIN = "https://www.gamefields.eu";
export type InquiryState = "idle" | "waiting" | "attached" | "error";
type Target = Pick<Window, "postMessage">;
/** Optional extras (2026-11-18): a 1:1 link to this configuration and a top-down PNG. Older receivers ignore them. */
export type InquiryExtras = {link?: string; image?: string};
export const MAX_INQUIRY_IMAGE_CHARS = 6_000_000;
type Options = {
 onState: (state: InquiryState, message: string) => void;
 timeoutMs?: number;
 schedule?: typeof setTimeout;
 cancelTimer?: typeof clearTimeout;
 createId?: () => string;
};

// An acknowledgement confirms attachment to the form, never email delivery.
export function createInquiryTransport({onState, timeoutMs=15000, schedule=setTimeout, cancelTimer=clearTimeout, createId=()=>crypto.randomUUID()}:Options){
 let pending:{target:Target;summary:string;id:string;extras:InquiryExtras}|null=null;
 let timer:ReturnType<typeof setTimeout>|undefined;
 const clear=()=>{if(timer!==undefined)cancelTimer(timer);timer=undefined;pending=null};
 const fail=(message:string)=>{clear();onState("error",message)};
 const send=()=>{
  if(!pending)return;
  try{pending.target.postMessage({type:"gf-inquiry",requestId:pending.id,summary:pending.summary,...pending.extras},CONTACT_ORIGIN)}
  catch{fail("Nie udało się przekazać projektu. Spróbuj ponownie lub pobierz kopię JSON.")}
 };
 return {
  start(target:Target,summary:string,waitForReady=false,extras:InquiryExtras={}){
   const clean:InquiryExtras={};
   if(typeof extras.link==="string"&&/^https:\/\/[^\s]{1,2000}$/.test(extras.link))clean.link=extras.link;
   if(typeof extras.image==="string"&&/^data:image\/(png|jpeg);base64,/.test(extras.image)&&extras.image.length<=MAX_INQUIRY_IMAGE_CHARS)clean.image=extras.image;
   clear();pending={target,summary,id:createId(),extras:clean};
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
