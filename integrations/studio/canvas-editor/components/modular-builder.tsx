"use client";
import {useEffect,useRef} from 'react';
import {productNames} from '@/lib/product-names.mjs';
export function ModularBuilder({initialFamily,onClose}:{initialFamily?:string;onClose:()=>void}){
 const dialog=useRef<HTMLDialogElement>(null);
 const family=initialFamily==='octagon'?'octagon':initialFamily?.startsWith('circle-cage')?'circle-cage':'street-field';
 useEffect(()=>{dialog.current?.showModal();return()=>dialog.current?.close()},[]);
 return <dialog ref={dialog} className="studio-modular-dialog" aria-labelledby="modular-title" onClose={onClose}><header><div><h2 id="modular-title">Budowanie modułowe</h2><p>Osobna konfiguracja z Twoich komponentów. Zapisz ją przyciskiem „Pobierz projekt” w edytorze.</p></div><button onClick={()=>dialog.current?.close()}>Wróć do modelu 3D</button></header><p className="studio-modular-note">{productNames["street-field"]}: długość i szerokość. {productNames["circle-cage-1"]} / {productNames["circle-cage-2"]}: poziomy. {productNames.octagon}: stały obrys. Konfiguracja modułowa ma osobny zapis i wymaga osobnej wyceny.</p><iframe title="Edytor zgodnych modułów konstrukcji" src={`/modular/index.html?family=${family}`} allow="fullscreen"/></dialog>;
}
