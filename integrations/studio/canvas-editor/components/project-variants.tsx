"use client";
import {useStudioLanguage} from "@/components/studio-language";
import {useEffect,useRef,useState,type ReactNode} from 'react';
import type {Project} from '@/lib/project';
import {VARIANTS_KEY,addSnapshot,createSnapshot,parseSnapshots,removeSnapshot,restoreSnapshot,type Snapshot} from '@/lib/project-vault';
import {readVaultRecord,updateVaultRecord} from '@/lib/browser-vault';
import {projectDimensions,formatArea,formatBounds} from '@/lib/project-dimensions';
import {getPatternFamily,getPatternPalette} from '@/lib/pattern-library';
import {productNames,productCodes} from '@/lib/product-names.mjs';
import {getSportProfile} from '@/lib/sport-profiles';
import {useProjectQuote} from '@/hooks/use-project-quote';
import {ProjectQuote} from '@/components/project-quote';
import {Variant3DComparison} from '@/components/variant-3d-comparison';
import '@/app/project-variants.css';

type Props={project:Project;onRestore:(project:Project)=>void|Promise<void>;renderCourt:(project:Project,editing?:boolean)=>ReactNode;downloadProject:(project:Project)=>void};
const TRASH_KEY='last-deleted-variant-v1';
const message=(error:unknown)=>error instanceof Error?error.message:'Nie udało się odczytać lub zapisać wariantów. Spróbuj ponownie; zachowane dane nie zostały zmienione.';
export function ProjectVariants({project,onRestore,renderCourt,downloadProject}:Props){
 const {display:tr,numberLocale}=useStudioLanguage();
 const comparison=useRef<HTMLElement|null>(null);
 const [items,setItems]=useState<Snapshot[]>([]),[name,setName]=useState(''),[selected,setSelected]=useState<string[]>([]),[busy,setBusy]=useState(true),[ready,setReady]=useState(false),[error,setError]=useState(''),[status,setStatus]=useState<{key:string;name:string}|null>(null),[deleted,setDeleted]=useState<Snapshot|null>(null);
 async function reload(){setBusy(true);setError('');try{const library=parseSnapshots(await readVaultRecord(VARIANTS_KEY));setItems(library.items);setReady(true);setSelected(current=>current.filter(id=>library.items.some(item=>item.id===id)));try{const value=await readVaultRecord(TRASH_KEY),last=parseSnapshots({schemaVersion:1,items:[value]}).items[0];setDeleted(library.items.some(item=>item.id===last.id)?null:last)}catch{setDeleted(null)}}catch(cause){setReady(false);setError(message(cause))}finally{setBusy(false)}}
 useEffect(()=>{void reload()},[]);
 async function change(action:()=>Promise<void>){setBusy(true);setError('');setStatus(null);try{await action()}catch(cause){setError(message(cause))}finally{setBusy(false)}}
 const save=()=>change(async()=>{const snapshot=createSnapshot(project,name,crypto.randomUUID(),new Date().toISOString());const result=await updateVaultRecord(VARIANTS_KEY,current=>addSnapshot(current,snapshot));setItems(result.items);setName('');setStatus({key:"Zapisano wariant „{name}” z pełną grafiką.",name:snapshot.name})});
 const remove=(item:Snapshot)=>change(async()=>{await updateVaultRecord(TRASH_KEY,()=>item);const result=await updateVaultRecord(VARIANTS_KEY,current=>removeSnapshot(current,item.id));setItems(result.items);setSelected(current=>current.filter(id=>id!==item.id));setDeleted(item);setStatus({key:"Usunięto wariant „{name}”. Ostatnie usunięcie możesz cofnąć również po odświeżeniu.",name:item.name})});
 const undoDelete=()=>change(async()=>{if(!deleted)return;const result=await updateVaultRecord(VARIANTS_KEY,current=>{const parsed=parseSnapshots(current);return parsed.items.some(item=>item.id===deleted.id)?parsed:addSnapshot(parsed,deleted)});setItems(result.items);setStatus({key:"Przywrócono zapis „{name}”.",name:deleted.name});setDeleted(null)});
 const restore=(item:Snapshot)=>change(async()=>{await onRestore(restoreSnapshot(item));setStatus({key:"Przywrócono wariant „{name}”. Poprzedni widok przywrócisz przyciskiem Cofnij.",name:item.name})});
 function select(id:string){setSelected(current=>current.includes(id)?current.filter(value=>value!==id):current.length<2?[...current,id]:current)}
 const compared=selected.map(id=>items.find(item=>item.id===id)).filter((item):item is Snapshot=>!!item);
 return <section className="project-variants" aria-labelledby="project-variants-heading">
  <h2 id="project-variants-heading">{tr("Warianty projektu")}</h2><p>{tr("Zachowaj do 6 nazwanych wersji z logo i wyposażeniem. Zapisy pozostają w tej przeglądarce. Pobierz JSON, aby mieć niezależną kopię.")}</p>
  <form onSubmit={event=>{event.preventDefault();void save()}} className="project-variants-save"><label htmlFor="project-variant-name">{tr('Nazwa wariantu')}<input id="project-variant-name" value={name} maxLength={80} onChange={event=>setName(event.target.value)} placeholder={tr("Np. Kolory klubowe")}/></label><button type="submit" disabled={busy||!ready||!name.trim()||items.length>=6}>{tr("Zapisz wariant")}</button></form>
  {items.length>=6?<p>{tr("Osiągnięto limit 6 zapisów. Pobierz i usuń wybrany wariant, aby zachować kolejny.")}</p>:null}
  {error?<div role="alert"><p>{tr(error)}</p><p>{tr("Możesz pobrać bieżący projekt. Nie nadpisujemy nieczytelnej biblioteki.")}</p><button disabled={busy} onClick={()=>void reload()}>{tr("Ponów odczyt biblioteki")}</button><button onClick={()=>downloadProject(project)}>{tr("Pobierz bieżący projekt JSON")}</button></div>:null}
  <p role="status" aria-live="polite">{busy?tr('Odczyt lub zapis wariantów…'):status?tr(status.key).replace('{name}',()=>status.name):''}</p>
  {ready&&!busy&&!items.length?<p>{tr("Nie masz jeszcze zapisanych wariantów.")}</p>:null}
  <ul className="project-variants-list">{items.map(item=><li key={item.id}><h3>{item.name}</h3><p><time dateTime={item.createdAt}>{new Date(item.createdAt).toLocaleString(numberLocale)}</time></p><label className="project-variants-select"><input type="checkbox" checked={selected.includes(item.id)} disabled={busy||(!selected.includes(item.id)&&selected.length>=2)} onChange={()=>select(item.id)}/>{tr("Porównaj:")} {item.name}</label><div className="project-variants-actions"><button disabled={busy} onClick={()=>void restore(item)}>{tr("Przywróć:")} {item.name}</button><button onClick={()=>downloadProject(item.project)}>{tr("Pobierz JSON:")} {item.name}</button><button disabled={busy} onClick={()=>void remove(item)}>{tr("Usuń:")} {item.name}</button></div></li>)}</ul>
  {deleted?<button disabled={busy||!ready} onClick={()=>void undoDelete()}>{tr("Cofnij usunięcie:")} {deleted.name}</button>:null}
  {items.length?<p>{tr("Wybierz dwa zapisy do porównania. Przywrócenie zastąpi bieżący widok; możesz je cofnąć przyciskiem Cofnij.")}</p>:null}
  {compared.length===2?<><button onClick={()=>{comparison.current?.scrollIntoView({behavior:"smooth",block:"start"});comparison.current?.focus({preventScroll:true})}}>{tr("Pokaż porównanie dwóch wariantów")}</button><section ref={comparison} tabIndex={-1} aria-labelledby="project-variants-comparison"><h3 id="project-variants-comparison">{tr("Porównanie dwóch wariantów")}</h3><p>{tr("Porównaj plany 2D i parametry bez przywracania zapisów. Indywidualną wycenę otrzymasz po kontakcie.")}</p><Variant3DComparison key={compared.map(item=>item.id).join(':')} items={compared}/><div className="project-variants-comparison">{compared.map(item=><article key={item.id}><h4>{item.name}</h4><div className="project-variant-plan" aria-label={`${tr('Plan:')} ${item.name}`}>{renderCourt(item.project,false)}</div><VariantPricing item={item}/><VariantDetails project={item.project} modelRevision={item.modelRevision}/><button disabled={busy} onClick={()=>void restore(item)}>{tr("Przywróć:")} {item.name}</button></article>)}</div></section></>:null}
 </section>;
}
function VariantPricing({item}:{item:Snapshot}){
 const {display:tr}=useStudioLanguage();
 const compatible=(projectDimensions(item.project).model?.sourceRevision??null)===item.modelRevision;
 return compatible?<CurrentVariantQuote project={item.project} name={item.name}/>:<section aria-label={`${tr('Kalkulacja wariantu:')} ${item.name}`}><h5>{tr("Bieżąca kalkulacja wariantu")}</h5><p>{tr("Rewizja modelu zmieniła się. Nie przeliczamy historycznego wariantu według innej geometrii. Sprawdź model przed przygotowaniem wyceny.")}</p></section>;
}
function CurrentVariantQuote({project,name}:{project:Project;name:string}){
 const {display:tr}=useStudioLanguage();
 const quote=useProjectQuote(project);
 return <ProjectQuote quote={quote} title={tr("Wycena wariantu")} label={`${tr('Kalkulacja wariantu:')} ${name}`} headingLevel={5}/>;
}
function VariantDetails({project:p,modelRevision}:{project:Project;modelRevision:string|null}){
 const {display:tr}=useStudioLanguage();
 const current=projectDimensions(p),compatible=(current.model?.sourceRevision??null)===modelRevision;
 const dimensions=compatible?current:{...current,model:null,area:null},design=p.arenaDesign;
 const colors=(entries:[string,string|undefined][])=>entries.filter(([,value])=>value).map(([label,value])=><span className="project-variant-color" key={label}><i aria-hidden="true" style={{background:value}}/>{tr(label)}: {value}</span>);
 const rows:[string,ReactNode][]=[['Model',p.arenaModel?productNames[p.arenaModel]:tr(getSportProfile(p.sport).label)],['Kod produktu',p.arenaModel?productCodes[p.arenaModel]:tr("Projekt indywidualny")],['Rewizja modelu',modelRevision?modelRevision.slice(0,12)+(compatible?'':tr(" — wymaga sprawdzenia")):tr("Projekt bez modelu")],['Zgodność obrysu',compatible?tr("Bieżąca rewizja"):tr("Rewizja zmieniona — obrysy nieporównywane")],['Wymiary projektu',dimensions.reference],['Obrys nawierzchni',!compatible?tr("Do sprawdzenia — inna rewizja"):dimensions.model?formatBounds(dimensions.model.surfaceBounds):dimensions.reference],['Obrys konstrukcji',!compatible?tr("Do sprawdzenia — inna rewizja"):dimensions.model?formatBounds(dimensions.model.constructionBounds):tr("Nie dotyczy")],['Powierzchnia nawierzchni',dimensions.area===null?tr("Do potwierdzenia"):formatArea(dimensions.area)],['Nawierzchnia',tr(p.surface)],['Wzór',`${getPatternFamily(p.patternFamily).name} · ${tr('kompozycja')} ${p.patternVariant??1}`],['Paleta',getPatternPalette(p.patternPalette).name],['Kolory nawierzchni',colors([['Baza',p.base],['Strefa',p.zone],['Otoczenie',p.outside]])],['Linie',p.lines?`${tr('Tak')} · ${p.lineColor}`:tr("Brak")],['Kolory konstrukcji',design?colors([['Panele',design.panelColor],['Rama',design.frameColor],['Bramki',design.goalColor]]):tr("Nie dotyczy")],['Wykończenie',design?tr({matte:'Matowe',gloss:'Połysk',metal:'Metaliczne'}[design.finish]):tr("Nie dotyczy")],['Napis na panelach',design?.text||tr("Brak")],['Logo na panelach',design?.src?tr("Tak"):tr("Brak")],['Logo i grafiki na planie',String(p.objects.filter(object=>object.kind==='image'||object.kind==='sponsor').length)],['Napisy na planie',String(p.objects.filter(object=>object.kind==='text').length)],['Wyposażenie',p.objects.filter(object=>object.kind==='equipment').map(object=>object.name).join(', ')||tr("Brak")]];
 return <dl>{rows.map(([label,value])=><div key={label}><dt>{tr(label)}</dt><dd>{value}</dd></div>)}</dl>;
}
