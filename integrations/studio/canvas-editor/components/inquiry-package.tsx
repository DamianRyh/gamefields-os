'use client';
import {useState} from 'react';
import type {Project} from '@/lib/project';
import type {QuoteState} from '@/hooks/use-project-quote';
import {inquirySummary} from '@/lib/inquiry-summary.mjs';
import {canonicalConfiguration} from '@/lib/project-specification';
export function InquiryPackage({project,quote}:{project:Project;quote:QuoteState}){const [message,setMessage]=useState('');
 async function download(){try{const summary=JSON.parse(inquirySummary(project,quote.loading||quote.error?null:quote.data));const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(canonicalConfiguration(summary))))].map(x=>x.toString(16).padStart(2,'0')).join('');const data={schema:'GF-INQUIRY-PACKAGE-1',createdAt:new Date().toISOString(),configurationHash:hash,request:summary};const a=document.createElement('a'),url=URL.createObjectURL(new Blob([JSON.stringify(data,null,2)],{type:'application/json'}));a.href=url;a.download='gamefields-zapytanie-'+hash.slice(0,12)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);setMessage('Pobrano pakiet z konfiguracją i stanem kalkulacji. To kopia do zapytania; nie jest potwierdzeniem zamówienia.')}catch(e){setMessage((e as Error).message)}}
 return <section className="studio-p2-section" aria-label="Projekt do zapytania"><h3>Od projektu do realizacji</h3><ol><li>Sprawdź konfigurację i zakres kalkulacji.</li><li>Otwórz formularz, uzupełnij kontakt i informacje o miejscu.</li><li>Wyślij zapytanie. Ofertę potwierdzimy po sprawdzeniu zakresu.</li></ol><p>Możesz pobrać kopię z kalkulacją do dalszej rozmowy. Obrazy logo wysyłasz osobno; pełną kopię zachowasz przez „Pobierz kopię projektu JSON”.</p><button type="button" disabled={quote.loading} onClick={download}>Pobierz pakiet do zapytania</button>{message?<p role="status">{message}</p>:null}</section>
}
