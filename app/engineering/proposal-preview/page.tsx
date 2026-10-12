import styles from "../proposal/proposal.module.css";

const money = (v: number) => new Intl.NumberFormat("pl-PL", { style: "currency", currency: "PLN", maximumFractionDigits: 0 }).format(v);

export default function ProposalPreviewPage() {
  const proposal = {
    proposalNumber: "GF/2026/001",
    issueDate: "2026-10-12",
    projectName: "Gamefields 3v3 Court",
    projectLocation: "Warsaw, PL",
    client: "Project Client",
    seller: "GAMEFIELDS",
    salesNetPln: 238000,
    vatPln: 54740,
    salesGrossPln: 292740,
    postSection: "SHS 80×80×4 / S355",
    railSection: "RHS 60×40×3 / S355",
    footing: "800×800×900 mm — concept",
    anchors: "4× M16 — project verification required",
    scope: [
      "Structural pre-design and engineering coordination",
      "Steel court structure with perimeter boards and integrated goals",
      "Protective net support structure",
      "Base plates, anchor assemblies and foundation concept",
      "Fabrication package: BOM, cut list and production exports",
      "Corrosion protection: galvanizing + powder coating",
      "Delivery and installation coordination",
    ],
    schedule: [
      "Final project brief and site data confirmation",
      "Engineering verification and fabrication release",
      "Workshop production and corrosion protection",
      "Delivery, assembly and final handover",
    ],
    exclusions: [
      "Geotechnical investigation unless ordered separately",
      "Utility relocation, permits and administrative fees",
      "Electrical works and lighting unless included in final scope",
      "Final anchor and foundation verification before fabrication release",
    ],
  };

  return <main className={styles.shell}>
    <section className={styles.workspace}>
      <div className={styles.workspaceHead}>
        <div><span>GAMEFIELDS / COMMERCIAL v1.2</span><h1>Proposal Preview</h1><p>Statyczny podgląd warstwy handlowej — bez zależności od API i silnika obliczeniowego.</p></div>
        <div className={styles.actions}><button onClick={undefined as never}>PREVIEW</button></div>
      </div>
    </section>

    <article className={styles.proposal}>
      <header className={styles.proposalHead}>
        <div className={styles.brand}>GAMEFIELDS</div>
        <div className={styles.meta}><span>PROPOSAL {proposal.proposalNumber}</span><span>{proposal.issueDate}</span></div>
      </header>

      <section className={styles.hero}>
        <p className={styles.kicker}>SPORTS INFRASTRUCTURE / DESIGN + ENGINEERING + DELIVERY</p>
        <h2>{proposal.projectName}</h2>
        <p>{proposal.projectLocation}</p>
      </section>

      <section className={styles.clientLine}>
        <div><span>PREPARED FOR</span><b>{proposal.client}</b></div>
        <div><span>PREPARED BY</span><b>{proposal.seller}</b></div>
      </section>

      <section className={styles.priceBlock}>
        <div><span>PROJECT VALUE</span><strong>{money(proposal.salesNetPln)}</strong><small>net</small></div>
        <div><span>VAT</span><b>{money(proposal.vatPln)}</b></div>
        <div><span>TOTAL</span><b>{money(proposal.salesGrossPln)}</b></div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionNo}>01</div><div><h3>Scope</h3><ul>{proposal.scope.map((item) => <li key={item}>{item}</li>)}</ul></div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionNo}>02</div><div><h3>Technical basis</h3><div className={styles.techGrid}>
          <div><span>Posts</span><b>{proposal.postSection}</b></div>
          <div><span>Rails</span><b>{proposal.railSection}</b></div>
          <div><span>Foundation</span><b>{proposal.footing}</b></div>
          <div><span>Anchors</span><b>{proposal.anchors}</b></div>
        </div><p className={styles.note}>Technical parameters remain subject to project-specific verification and Engineer Gate approval before fabrication release.</p></div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionNo}>03</div><div><h3>Process</h3><ol>{proposal.schedule.map((item) => <li key={item}>{item}</li>)}</ol><div className={styles.conditions}><div><span>LEAD TIME</span><b>8–10 weeks</b></div><div><span>PAYMENT</span><b>40 / 40 / 20</b></div><div><span>VALIDITY</span><b>14 days</b></div></div></div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionNo}>04</div><div><h3>Exclusions</h3><ul className={styles.mutedList}>{proposal.exclusions.map((item) => <li key={item}>{item}</li>)}</ul></div>
      </section>

      <footer className={styles.footer}><p>Commercial proposal. Final structural release requires project-specific engineering verification.</p><div>GAMEFIELDS / {proposal.proposalNumber}</div></footer>
    </article>
  </main>;
}
