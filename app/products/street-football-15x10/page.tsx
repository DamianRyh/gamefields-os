"use client";
import { useState } from 'react';
import { GlbViewer } from '../../../components/gamefields/glb-viewer';
import '../../engineering/source-models/source-models.css';
import './street-football.css';

const colors=[{name:'Grafit',value:'#20252b'},{name:'Fiolet',value:'#6336f5'},{name:'Zieleń',value:'#285b44'},{name:'Czerwony',value:'#bb4149'},{name:'Żółty',value:'#e7c84c'},{name:'Biały',value:'#f2f0e9'}];
export default function StreetFootballPage({assetBase='/products/street-football-15x10'}:{assetBase?:string}) {
  const [panelColor,setPanelColor]=useState(colors[0].value),[surfaceColor,setSurfaceColor]=useState('#a6a6a6'),[message,setMessage]=useState('');
  function downloadBrief(){
    const brief={version:1,productId:'street-football-15x10',panelColor,surfaceColor,markings:false,surfaceThicknessM:0.2,playingEnvelopeM:{length:15,width:10}};
    const url=URL.createObjectURL(new Blob([JSON.stringify(brief,null,2)],{type:'application/json'}));
    const link=document.createElement('a');link.href=url;link.download='gamefields-street-football-15x10.json';link.click();
    setTimeout(()=>URL.revokeObjectURL(url),1000);setMessage('Pobrano konfigurację. Dołącz ją do zapytania o projekt.');
  }
  return <main className="gf-street-product">
    <header><a href="https://www.gamefields.eu/">gamefields</a><nav aria-label="Nawigacja produktu"><a href="https://www.gamefields.eu/boiska-street-football/">Wszystkie boiska</a><a href="https://www.gamefields.eu/os/">Gamefields OS</a></nav></header>
    <section className="street-intro"><p>BOISKO MODUŁOWE / STREET FOOTBALL</p><h1>Street Football<br/>15 × 10.</h1><p>Twoje kolory. Czysta przestrzeń do gry.</p></section>
    <section className="street-layout" aria-label="Konfigurator Street Arena 15">
      <div className="gf-source-page street-preview"><GlbViewer url={assetBase+'/boisko-15x10.glb'} panelColor={panelColor} surfaceColor={surfaceColor}/><p>Obróć model przeciągnięciem · Przybliż kółkiem lub gestem</p></div>
      <aside><h2>Kolor paneli</h2><p>Gładkie bandy bez napisów w standardzie. Stalowe ramy zachowują swój kolor.</p>
        <div className="street-swatches" role="group" aria-label="Kolory paneli">{colors.map(color=><button type="button" key={color.value} aria-pressed={panelColor===color.value} onClick={()=>setPanelColor(color.value)}><span style={{background:color.value}}/>{color.name}</button>)}</div>
        <label className="street-color">Własny kolor paneli<input type="color" aria-label="Własny kolor paneli" value={panelColor} onChange={e=>setPanelColor(e.target.value)}/><output>{panelColor.toUpperCase()}</output></label>
        <h2>Nawierzchnia</h2><p>Osobna warstwa 20 cm, bez linii i grafik. Baza do indywidualnego projektu nawierzchni.</p>
        <label className="street-color">Kolor nawierzchni<input type="color" aria-label="Kolor nawierzchni" value={surfaceColor} onChange={e=>setSurfaceColor(e.target.value)}/></label>
        <button className="street-reset" type="button" onClick={()=>{setPanelColor(colors[0].value);setSurfaceColor('#a6a6a6')}}>Przywróć kolory standardowe</button>
        <dl><div><dt>Pole gry</dt><dd>15 × 10 m ze ściętymi narożnikami</dd></div><div><dt>Bandy</dt><dd>1 m wysokości</dd></div><div><dt>Bramki</dt><dd>2 sztuki</dd></div><div><dt>Warstwa nawierzchni</dt><dd>20 cm</dd></div></dl>
        <a className="street-cta" href="https://www.gamefields.eu/?gf_product=street-football-15x10#kontakt">Zapytaj o ten produkt ↗</a><button className="street-download" type="button" onClick={downloadBrief}>Pobierz konfigurację JSON</button><p role="status">{message}</p>
      </aside>
    </section>
    <section className="street-files"><h2>Pliki modelu</h2><p>Wspólny model zawiera dwa oddzielne obiekty: nawierzchnię i konstrukcję. Materiał paneli można zmieniać niezależnie od ram.</p><div><a href={assetBase+'/boisko-15x10.glb'} download>Całe boisko GLB</a><a href={assetBase+'/murawa.glb'} download>Nawierzchnia GLB</a><a href={assetBase+'/konstrukcja.glb'} download>Konstrukcja GLB</a><a href={assetBase+'/boisko-15x10.blend'} download>Projekt Blender</a></div><p className="street-note">Model koncepcyjny. Specyfikację produkcyjną, zakres nawierzchni i wycenę potwierdzamy indywidualnie.</p></section>
  </main>;
}
