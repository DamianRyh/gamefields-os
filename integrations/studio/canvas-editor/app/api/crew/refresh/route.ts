import {authorized,logIngestRun,publishFact,validCandidate,verifyMeaning,verifySource} from "@/lib/crew-knowledge-store";
export const runtime="edge";
export async function POST(request:Request){
 if(!await authorized(request))return Response.json({error:"Unauthorized"},{status:401});
 const apiKey=process.env.OPENAI_API_KEY;if(!apiKey)return Response.json({error:"AI verifier is not configured"},{status:503});
 const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),26000);
 let discovered=0,published=0,rejected=0;const outcomes:string[]=[];
 try{
  const response=await fetch("https://api.openai.com/v1/responses",{method:"POST",signal:controller.signal,headers:{Authorization:`Bearer ${apiKey}`,"Content-Type":"application/json"},body:JSON.stringify({model:process.env.OPENAI_CREW_RESEARCH_MODEL||"gpt-6.1-sol",store:false,max_output_tokens:1350,tools:[{type:"web_search"}],instructions:"Zbadaj wiarygodne pierwotne źródła o street soccer (=street football) i panna football, nie o koszykówce 3x3. Zwróć wyłącznie poprawny JSON {\"candidates\":[...]}, bez Markdown. Maksymalnie 3 nowe, ponadczasowe fakty; każdy ma factKey (krótki stały slug), discipline ('street-football' lub 'panna-football'), claim (jedno precyzyjne zdanie po polsku) i sources: dokładnie 2 niezależne obiekty {url,evidence} z dosłownym fragmentem źródła. Dopuszczalne domeny: gamefields.eu, thefa.com, pzpn.pl, fifa.com, isfa.world. Jeśli nie ma dwóch bezpośrednich źródeł, zwróć pustą listę. Nie twórz faktów na podstawie pamięci ani nie wymyślaj cytatów.",input:[{role:"user",content:"Sprawdź nową wiedzę dotyczącą zasad, historii i kontekstu street football oraz panna football. Ogranicz się do faktów, które można udowodnić dwoma niezależnymi źródłami."}]})});
  if(!response.ok)throw Error("Research failed");
  const data=await response.json() as {output?:Array<{content?:Array<{text?:string}>}>};
  const raw=data.output?.flatMap(x=>x.content||[]).map(x=>x.text||"").join("").trim()||"";
  const parsed=JSON.parse(raw) as {candidates?:unknown[]};
  const candidates=Array.isArray(parsed.candidates)?parsed.candidates.slice(0,3):[];discovered=candidates.length;
  for(const candidate of candidates){if(!validCandidate(candidate)){rejected++;outcomes.push("Invalid candidate");continue}const [one,two]=await Promise.all(candidate.sources.map(s=>verifySource(s.url,s.evidence)));if(!one||!two||!await verifyMeaning(candidate)){rejected++;outcomes.push(candidate.factKey+": insufficient evidence");continue}try{await publishFact(candidate);published++;outcomes.push(candidate.factKey+": published")}catch{rejected++;outcomes.push(candidate.factKey+": duplicate or storage error")}}
  await logIngestRun("complete",outcomes,discovered,published,rejected);
  return Response.json({status:"complete",discovered,published,rejected},{headers:{"Cache-Control":"no-store"}});
 }catch{await logIngestRun("failed",outcomes,discovered,published,rejected).catch(()=>{});return Response.json({error:"Research could not be completed"},{status:503})}finally{clearTimeout(timeout)}
}
