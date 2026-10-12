"use client";

import { useMemo, useState } from "react";
import styles from "./proposal.module.css";

type ProposalResponse = {
  engineering: {
    generator: { selected: { found: boolean; estimatedSteelKg: number | null; postSectionCode: string | null; railSectionCode: string | null; footing: string | null; anchors: string | null }; handoff?: { engineerGate?: { releaseStatus?: string } } };
    wind: { windPressureKpa: number };
  };
  proposal: {
    status: string;
    context: { proposalNumber: string; issueDate: string; sellerName: string; projectName: string; projectLocation: string; client: { name: string; company?: string } };
    technical: { engineerGate: string; postSection: string | null; railSection: string | null; footing: string | null; anchors: string | null; estimatedSteelKg: number | null };
    commercial: { internalCostNetPln: number | null; salesNetPln: number | null; vatPln: number | null; salesGrossPln: number | null; grossMarginPct: number | null; grossMarginPln: number | null };
    scope: string[];
    exclusions: string[];
    schedule: string[];
    policy: { validityDays: number; paymentTerms: string; leadTimeWeeks: string; sourceStatus: string };
    commercialWarnings: string[];
    footerNote: string;
  };
};

const money = (v: number | null) => v === null ? "—" : new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN", maximumFractionDigits: 0 }).format(v);

export default function CommercialProposalPage() {
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [form, setForm] = useState({
    projectName: "Gamefields 3v3 court",
    projectCode: "GF-2026-001",
    city: "Warsaw",
    clientName: "Client",
    clientCompany: "",
    proposalNumber: `GF/${new Date().getFullYear()}/001`,
    issueDate: today,
    lengthM: 15,
    widthM: 10,
    boardHeightM: 1,
    netHeightM: 4,
    designPressureKpa: 0.8,
    soilDesignBearingKpa: 150,
    targetGrossMarginPct: 30,
    vatPct: 23,
    validityDays: 14,
    commercialContingencyPct: 3,
  });
  const [result, setResult] = useState<ProposalResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set<K extends keyof typeof form>(key: K, value: typeof form[K]) { setForm((prev) => ({ ...prev, [key]: value })); }

  async function generate() {
    setLoading(true); setError(""); setResult(null);
    try {
      const response = await fetch("/api/engineering/proposal", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          ...form,
          sellerName: "GAMEFIELDS",
          courtType: "3V3",
        }),
      });
      const data = await response.json();
      if (!response.ok && !data?.proposal) throw new Error(data?.error ?? "Proposal generation failed");
      setResult(data);
    } catch (e) { setError(e instanceof Error ? e.message : "Proposal generation failed"); }
    finally { setLoading(false); }
  }

  return <main className={styles.shell}>
    <section className={styles.workspace}>
      <div className={styles.workspaceHead}>
        <div><span>GAMEFIELDS / COMMERCIAL v1.2</span><h1>Proposal Studio</h1><p>Jedna oferta. Jeden zakres. Jedna cena. Technika i marża pozostają pod kontrolą wewnętrzną.</p></div>
        <div className={styles.actions}><button onClick={generate} disabled={loading}>{loading ? "CALCULATING…" : "BUILD PROPOSAL"}</button>{result && <button className={styles.secondary} onClick={() => window.print()}>PRINT / PDF</button>}</div>
      </div>
      <div className={styles.formGrid}>
        <label><span>Project</span><input value={form.projectName} onChange={(e) => set("projectName", e.target.value)} /></label>
        <label><span>Location</span><input value={form.city} onChange={(e) => set("city", e.target.value)} /></label>
        <label><span>Client</span><input value={form.clientName} onChange={(e) => set("clientName", e.target.value)} /></label>
        <label><span>Company</span><input value={form.clientCompany} onChange={(e) => set("clientCompany", e.target.value)} /></label>
        <label><span>Proposal no.</span><input value={form.proposalNumber} onChange={(e) => set("proposalNumber", e.target.value)} /></label>
        <label><span>Issue date</span><input type="date" value={form.issueDate} onChange={(e) => set("issueDate", e.target.value)} /></label>
        <label><span>Length [m]</span><input type="number" step="0.1" value={form.lengthM} onChange={(e) => set("lengthM", Number(e.target.value))} /></label>
        <label><span>Width [m]</span><input type="number" step="0.1" value={form.widthM} onChange={(e) => set("widthM", Number(e.target.value))} /></label>
        <label><span>Board [m]</span><input type="number" step="0.1" value={form.boardHeightM} onChange={(e) => set("boardHeightM", Number(e.target.value))} /></label>
        <label><span>Net [m]</span><input type="number" step="0.1" value={form.netHeightM} onChange={(e) => set("netHeightM", Number(e.target.value))} /></label>
        <label><span>Wind [kPa]</span><input type="number" step="0.05" value={form.designPressureKpa} onChange={(e) => set("designPressureKpa", Number(e.target.value))} /></label>
        <label><span>Soil [kPa]</span><input type="number" step="5" value={form.soilDesignBearingKpa} onChange={(e) => set("soilDesignBearingKpa", Number(e.target.value))} /></label>
        <label><span>Target margin [%]</span><input type="number" step="1" value={form.targetGrossMarginPct} onChange={(e) => set("targetGrossMarginPct", Number(e.target.value))} /></label>
        <label><span>VAT [%]</span><input type="number" step="1" value={form.vatPct} onChange={(e) => set("vatPct", Number(e.target.value))} /></label>
        <label><span>Validity [days]</span><input type="number" step="1" value={form.validityDays} onChange={(e) => set("validityDays", Number(e.target.value))} /></label>
        <label><span>Commercial reserve [%]</span><input type="number" step="1" value={form.commercialContingencyPct} onChange={(e) => set("commercialContingencyPct", Number(e.target.value))} /></label>
      </div>
      {error && <p className={styles.error}>{error}</p>}
      {result && <div className={styles.internalBar}>
        <div><span>INTERNAL COST</span><b>{money(result.proposal.commercial.internalCostNetPln)}</b></div>
        <div><span>SALE NET</span><b>{money(result.proposal.commercial.salesNetPln)}</b></div>
        <div><span>MARGIN</span><b>{result.proposal.commercial.grossMarginPct?.toFixed(1)}%</b></div>
        <div><span>ENGINEER GATE</span><b>{result.proposal.technical.engineerGate}</b></div>
      </div>}
    </section>

    {result && <article className={styles.proposal}>
      <header className={styles.proposalHead}>
        <div className={styles.brand}>GAMEFIELDS</div>
        <div className={styles.meta}><span>PROPOSAL {result.proposal.context.proposalNumber}</span><span>{result.proposal.context.issueDate}</span></div>
      </header>

      <section className={styles.hero}>
        <p className={styles.kicker}>SPORTS INFRASTRUCTURE / DESIGN + ENGINEERING + DELIVERY</p>
        <h2>{result.proposal.context.projectName}</h2>
        <p>{result.proposal.context.projectLocation}</p>
      </section>

      <section className={styles.clientLine}>
        <div><span>PREPARED FOR</span><b>{result.proposal.context.client.company || result.proposal.context.client.name}</b></div>
        <div><span>PREPARED BY</span><b>{result.proposal.context.sellerName}</b></div>
      </section>

      <section className={styles.priceBlock}>
        <div><span>PROJECT VALUE</span><strong>{money(result.proposal.commercial.salesNetPln)}</strong><small>net</small></div>
        <div><span>VAT</span><b>{money(result.proposal.commercial.vatPln)}</b></div>
        <div><span>TOTAL</span><b>{money(result.proposal.commercial.salesGrossPln)}</b></div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionNo}>01</div><div><h3>Scope</h3><ul>{result.proposal.scope.map((item) => <li key={item}>{item}</li>)}</ul></div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionNo}>02</div><div><h3>Technical basis</h3><div className={styles.techGrid}>
          <div><span>Posts</span><b>{result.proposal.technical.postSection || "—"}</b></div>
          <div><span>Rails</span><b>{result.proposal.technical.railSection || "—"}</b></div>
          <div><span>Foundation</span><b>{result.proposal.technical.footing || "—"}</b></div>
          <div><span>Anchors</span><b>{result.proposal.technical.anchors || "—"}</b></div>
        </div><p className={styles.note}>Technical parameters remain subject to project-specific verification and Engineer Gate approval before fabrication release.</p></div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionNo}>03</div><div><h3>Process</h3><ol>{result.proposal.schedule.map((item) => <li key={item}>{item}</li>)}</ol><div className={styles.conditions}><div><span>LEAD TIME</span><b>{result.proposal.policy.leadTimeWeeks}</b></div><div><span>PAYMENT</span><b>{result.proposal.policy.paymentTerms}</b></div><div><span>VALIDITY</span><b>{result.proposal.policy.validityDays} days</b></div></div></div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionNo}>04</div><div><h3>Exclusions</h3><ul className={styles.mutedList}>{result.proposal.exclusions.map((item) => <li key={item}>{item}</li>)}</ul></div>
      </section>

      <footer className={styles.footer}><p>{result.proposal.footerNote}</p><div>GAMEFIELDS / {result.proposal.context.proposalNumber}</div></footer>
    </article>}
  </main>;
}
