"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, ChevronRight, Heart, Layers3, Maximize2, RefreshCw, Save, Sparkles } from "lucide-react";
import styles from "./studio-v2.module.css";

type Direction = {
  id: string;
  name: string;
  image: string;
  price: number;
};

const directions: Direction[] = [
  { id: "organic", name: "Organic Flow", image: "/studio/organic-flow-park.webp", price: 34500 },
  { id: "urban", name: "Urban Contrast", image: "/studio/urban-contrast-park.webp", price: 35900 },
  { id: "classic", name: "Classic Lines", image: "/studio/classic-lines-park.webp", price: 31900 },
];

const colors = ["#57e38d", "#17362e", "#f3f3ee", "#9ea5a8", "#ff7d43", "#2459a8", "#e84d4d"];
const surfaces = [
  { name: "Akryl", swatch: "linear-gradient(135deg,#19352f,#2c5146)" },
  { name: "EPDM", swatch: "radial-gradient(circle at 30% 30%,#69716e 0 2px,#343a38 3px 6px)" },
  { name: "Moduły", swatch: "linear-gradient(45deg,#174d92 25%,#226bb9 25% 50%,#174d92 50% 75%,#226bb9 75%)" },
  { name: "Cegła", swatch: "linear-gradient(135deg,#a94d2a,#df6b35)" },
  { name: "Beton", swatch: "linear-gradient(135deg,#afb2b0,#d5d7d5)" },
];
const lines = ["standard", "thin", "dash", "accent", "minimal"];
const tabs = ["SPORT", "DESIGN", "NAWIERZCHNIA", "LINIE", "WYPOSAŻENIE", "BRANDING", "MIEJSCE"];

function money(n: number) {
  return new Intl.NumberFormat("pl-PL").format(n) + " zł";
}

export default function StudioV2Page() {
  const [direction, setDirection] = useState(directions[0]);
  const [color, setColor] = useState(colors[0]);
  const [surface, setSurface] = useState(0);
  const [line, setLine] = useState(0);
  const [tab, setTab] = useState("DESIGN");
  const [liked, setLiked] = useState(3);
  const [saved, setSaved] = useState(false);

  const price = useMemo(() => direction.price + surface * 650 + (line === 3 ? 450 : 0), [direction, surface, line]);

  function inspire() {
    const next = directions[(directions.findIndex((d) => d.id === direction.id) + 1) % directions.length];
    setDirection(next);
    setColor(colors[Math.floor(Math.random() * colors.length)]);
  }

  return (
    <main className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.brandWrap}>
          <Link href="/" className={styles.brand}>GAMEFIELDS</Link>
          <span className={styles.divider} />
          <span className={styles.studio}>STUDIO</span>
        </div>

        <nav className={styles.topNav} aria-label="Etapy Studio">
          {tabs.map((item) => (
            <button key={item} onClick={() => setTab(item)} className={tab === item ? styles.topActive : ""}>{item}</button>
          ))}
        </nav>

        <div className={styles.headerActions}>
          <button className={styles.ghostBtn} onClick={() => setLiked((v) => v + 1)}><Heart size={18} /> <span>Moje warianty ({liked})</span></button>
          <button className={styles.saveBtn} onClick={() => setSaved(true)}><Save size={17} /> {saved ? "Zapisano" : "Zapisz projekt"}</button>
        </div>
      </header>

      <section className={styles.workspace}>
        <div className={styles.canvasPane}>
          <div className={styles.canvasMeta}>
            <button className={styles.back}><ArrowLeft size={16}/> Zmień sport</button>
            <div className={styles.sportTitle}>
              <span className={styles.ball}>◉</span>
              <div><strong>Street Football 3×3</strong><small>15 × 10 m</small></div>
            </div>
          </div>

          <div className={styles.canvasTools}>
            <button title="Pełny ekran"><Maximize2 size={18}/></button>
            <button title="Warstwy"><Layers3 size={18}/></button>
            <button title="Odśwież"><RefreshCw size={18}/></button>
          </div>

          <div className={styles.heroFrame} style={{"--accent": color} as React.CSSProperties}>
            <img src={direction.image} alt={`Wizualizacja boiska ${direction.name}`} />
            <div className={styles.heroTint} />
          </div>

          <button className={styles.inspire} onClick={inspire}><Sparkles size={18}/> Zainspiruj mnie <RefreshCw size={17}/></button>

          <div className={styles.directionStrip}>
            <div className={styles.stripLabel}><span>Kierunki designu</span><button>Zobacz więcej <ArrowRight size={15}/></button></div>
            <div className={styles.cards}>
              {directions.map((item) => (
                <button key={item.id} onClick={() => setDirection(item)} className={`${styles.card} ${direction.id === item.id ? styles.cardActive : ""}`}>
                  <img src={item.image} alt="" />
                  <span>{item.name}</span>
                  {direction.id === item.id && <i><Check size={14}/></i>}
                </button>
              ))}
              <button className={styles.cardMore}><span>+</span><small>Więcej kierunków</small></button>
            </div>
          </div>
        </div>

        <aside className={styles.panel}>
          <div className={styles.panelHead}>
            <span className={styles.eyebrow}>KROK 02</span>
            <h1>{tab === "DESIGN" ? "Design" : tab.charAt(0) + tab.slice(1).toLowerCase()}</h1>
            <p>Dopracuj projekt bez wychodzenia z podglądu. Najważniejsze decyzje są zawsze pod ręką.</p>
          </div>

          <section className={styles.panelSection}>
            <div className={styles.sectionTitle}><strong>Kierunek wizualny</strong><span>01</span></div>
            <div className={styles.directionGrid}>
              {directions.map((item) => (
                <button key={item.id} onClick={() => setDirection(item)} className={`${styles.directionTile} ${direction.id === item.id ? styles.directionTileActive : ""}`}>
                  <img src={item.image} alt=""/><span>{item.name}</span>{direction.id === item.id && <i><Check size={13}/></i>}
                </button>
              ))}
            </div>
            <button className={styles.moreLink}>Zobacz więcej kierunków <ArrowRight size={15}/></button>
          </section>

          <section className={styles.panelSection}>
            <div className={styles.sectionTitle}><strong>Kolor akcentu</strong><span>02</span></div>
            <div className={styles.swatches}>
              {colors.map((c) => <button key={c} aria-label={`Kolor ${c}`} onClick={() => setColor(c)} style={{background:c}} className={color === c ? styles.swatchActive : ""}/>) }
              <button className={styles.chevron}><ChevronRight size={18}/></button>
            </div>
          </section>

          <section className={styles.panelSection}>
            <div className={styles.sectionTitle}><strong>Nawierzchnia</strong><span>03</span></div>
            <div className={styles.surfaceRow}>
              {surfaces.map((s, i) => <button key={s.name} title={s.name} onClick={() => setSurface(i)} className={surface === i ? styles.surfaceActive : ""} style={{background:s.swatch}}>{surface === i && <Check size={13}/>}</button>)}
              <button className={styles.chevron}><ChevronRight size={18}/></button>
            </div>
          </section>

          <section className={styles.panelSection}>
            <div className={styles.sectionTitle}><strong>Linie</strong><span>04</span></div>
            <div className={styles.lineRow}>
              {lines.map((l, i) => <button key={l} onClick={() => setLine(i)} className={line === i ? styles.lineActive : ""}><span className={`${styles.lineSample} ${styles[`line${i}`]}`}/></button>)}
              <button className={styles.chevron}><ChevronRight size={18}/></button>
            </div>
          </section>

          <button className={styles.proButton}><div><b>Edytuj dokładnie</b><small>GAMEFIELDS PRO · logo, tekst, warstwy, skala i więcej</small></div><span>PRO</span><ChevronRight size={18}/></button>
        </aside>
      </section>

      <footer className={styles.bottomBar}>
        <div className={styles.summaryItems}>
          <button onClick={() => setTab("SPORT")}><span>SPORT</span><b>Street Football 3×3</b></button>
          <button onClick={() => setTab("DESIGN")} className={tab === "DESIGN" ? styles.summaryActive : ""}><span>DESIGN</span><b>{direction.name}</b></button>
          <button onClick={() => setTab("NAWIERZCHNIA")}><span>NAWIERZCHNIA</span><b>{surfaces[surface].name}</b></button>
          <button onClick={() => setTab("LINIE")}><span>LINIE</span><b>{lines[line] === "standard" ? "Standard" : "Wariant " + (line + 1)}</b></button>
          <button onClick={() => setTab("WYPOSAŻENIE")}><span>WYPOSAŻENIE</span><b>Bramki + bandy</b></button>
          <button onClick={() => setTab("BRANDING")}><span>BRANDING</span><b>Brak</b></button>
          <button onClick={() => setTab("MIEJSCE")}><span>MIEJSCE</span><b>Dodaj</b></button>
        </div>
        <div className={styles.priceBox}><span>Orientacyjna cena</span><strong>{money(price)}</strong></div>
        <button className={styles.nextBtn}>Dalej <ArrowRight size={18}/></button>
      </footer>
    </main>
  );
}
