"use client";

import { useState } from "react";
import styles from "./quote.module.css";

type QuoteResult = {
  schema: string;
  commercialStatus: string;
  wind: { windPressureKpa: number; source: string; notes: string[] };
  generator: { selected: { found: boolean; designId: string | null; postSectionCode: string | null; railSectionCode: string | null; postSpacingM: number | null; plate: string | null; anchors: string | null; footing: string | null; estimatedSteelKg: number | null; estimatedConcreteM3: number | null }; handoff?: { engineerGate?: { releaseStatus?: string } } };
  cost: null | { totalNetPln: number; subtotal: number; contingency: number; steelFabrication: number; corrosionProtection: number; basePlates: number; anchors: number; concrete: number; excavationAndBackfill: number; siteInstallation: number; transport: number; catalogLabel: string; catalogEffectiveDate: string; catalogSourceStatus: string };
  warnings: string[];
};

const money = (value: number) => new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN", maximumFractionDigits: 0 }).format(value);

export default function EngineeringQuotePage() {
  const [form, setForm] = useState({ city: "Warsaw", lengthM: 15, widthM: 10, boardHeightM: 1, netHeightM: 4, designPressureKpa: 0.8, soilDesignBearingKpa: 150, priority: "BALANCED" });
  const [result, setResult] = useState<QuoteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generate() {
    setLoading(true); setError(""); setResult(null);
    try {
      const response = await fetch("/api/engineering/generate-v11", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          projectName: `Gamefields ${form.city}`,
          projectCode: "GF-QUOTE-001",
          city: form.city,
          courtType: "3V3",
          lengthM: Number(form.lengthM), widthM: Number(form.widthM), boardHeightM: Number(form.boardHeightM), netHeightM: Number(form.netHeightM),
          soilDesignBearingKpa: Number(form.soilDesignBearingKpa),
          priority: form.priority,
          wind: { mode: "DESIGN_PRESSURE", designPressureKpa: Number(form.designPressureKpa), sourceNote: "Project pressure input — engineer confirmation required" },
        }),
      });
      const data = await response.json();
      if (!response.ok && !data?.generator) throw new Error(data?.error ?? "Generation failed");
      setResult(data);
    } catch (e) { setError(e instanceof Error ? e.message : "Generation failed"); }
    finally { setLoading(false); }
  }

  function field(label: string, key: keyof typeof form, step = "0.1") {
    return <label><span>{label}</span><input value={form[key]} step={step} onChange={(e) => setForm({ ...form, [key]: key === "city" || key === "priority" ? e.target.value : Number(e.target.value) })} type={key === "city" ? "text" : "number"} /></label>;
  }

  const c = result?.cost;
  const s = result?.generator.selected;
  return <main className={styles.shell}>
    <header><span className={styles.eyebrow}>GAMEFIELDS ENGINEERING / v1.1</span><h1>Technical Quote Generator</h1><p>Generate a structural pre-design, verified search result and budgetary PLN breakdown from one project brief.</p></header>
    <section className={styles.formCard}>
      <div className={styles.formGrid}>
        {field("City", "city")}{field("Length [m]", "lengthM")}{field("Width [m]", "widthM")}{field("Board height [m]", "boardHeightM")}{field("Net height [m]", "netHeightM")}{field("Design wind pressure [kPa]", "designPressureKpa")}{field("Soil bearing [kPa]", "soilDesignBearingKpa", "5")}
        <label><span>Optimization priority</span><select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}><option>BALANCED</option><option>MINIMUM_STEEL</option><option>MINIMUM_FOUNDATION</option></select></label>
      </div>
      <button className={styles.generate} onClick={generate} disabled={loading}>{loading ? "CALCULATING…" : "GENERATE DESIGN + PLN COST"}</button>
      <p className={styles.small}>Wind pressure and geotechnical inputs remain project assumptions until confirmed by the engineer. Default PLN rate card is budgetary.</p>
      {error && <p className={styles.error}>{error}</p>}
    </section>

    {result && <>
      <section className={styles.metrics}>
        <div><span>TOTAL NET</span><b>{c ? money(c.totalNetPln) : "NO FEASIBLE DESIGN"}</b></div>
        <div><span>WIND</span><b>{result.wind.windPressureKpa.toFixed(2)} kPa</b></div>
        <div><span>STEEL</span><b>{s?.estimatedSteelKg ? `${s.estimatedSteelKg.toFixed(0)} kg` : "—"}</b></div>
        <div><span>ENGINEER GATE</span><b>{result.generator.handoff?.engineerGate?.releaseStatus ?? "REVIEW"}</b></div>
      </section>
      <div className={styles.grid}>
        <section className={styles.card}><h2>Selected structural system</h2>{s?.found ? <div className={styles.rows}>
          <div><span>Posts</span><b>{s.postSectionCode}</b></div><div><span>Rails</span><b>{s.railSectionCode}</b></div><div><span>Post spacing</span><b>{s.postSpacingM?.toFixed(2)} m</b></div><div><span>Base plate</span><b>{s.plate}</b></div><div><span>Anchors</span><b>{s.anchors}</b></div><div><span>Footing</span><b>{s.footing}</b></div>
        </div> : <p>No feasible design found in the active search space.</p>}</section>
        <section className={styles.card}><h2>PLN breakdown</h2>{c && <div className={styles.rows}>
          <div><span>Steel fabrication</span><b>{money(c.steelFabrication)}</b></div><div><span>Corrosion protection</span><b>{money(c.corrosionProtection)}</b></div><div><span>Base plates</span><b>{money(c.basePlates)}</b></div><div><span>Anchors</span><b>{money(c.anchors)}</b></div><div><span>Concrete</span><b>{money(c.concrete)}</b></div><div><span>Excavation/backfill</span><b>{money(c.excavationAndBackfill)}</b></div><div><span>Installation</span><b>{money(c.siteInstallation)}</b></div><div><span>Transport</span><b>{money(c.transport)}</b></div><div><span>Contingency</span><b>{money(c.contingency)}</b></div>
        </div>}<p className={styles.small}>{c?.catalogLabel} / {c?.catalogEffectiveDate} / {c?.catalogSourceStatus}</p></section>
      </div>
      <section className={styles.warning}>{result.warnings.join(" ")}</section>
    </>}
  </main>;
}
