'use client';
import {useState} from 'react';
import type {Project} from '@/lib/project';
import {projectSpecification} from '@/lib/project-specification';
export function ProjectSpecification({project}:{project:Project}){
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 const download=async()=>{setBusy(true);setError('');try{const spec=await projectSpecification(project);const url=URL.createObjectURL(new Blob([JSON.stringify(spec,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='gamefields-specyfikacja-'+spec.configurationRevision.slice(0,12)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}catch{setError('Nie udało się przygotować specyfikacji. Sprawdź nazwę projektu i spróbuj ponownie.')}finally{setBusy(false)}};
 return <section className="studio-specification" aria-label="Specyfikacja konfiguracji"><h3>Specyfikacja konfiguracji</h3><p>Pobierz parametry, kolory, pełne grafiki i identyfikator tej wersji projektu. Zestawienie konstrukcyjne wymaga jeszcze potwierdzenia elementów i połączeń. Dodane swobodnie obiekty nie są zatwierdzonymi częściami konstrukcji.</p><button className="studio-export" disabled={busy} onClick={()=>void download()}>{busy?'Przygotowuję specyfikację…':'Pobierz specyfikację projektu JSON'}</button>{error?<p role="alert">{error}</p>:null}</section>;
}
