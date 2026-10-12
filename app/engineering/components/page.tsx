// Use document navigation until the vinext production Link/prefetch runtime is fixed.
import { GAMEFIELDS_COMPONENT_LIBRARY } from "../component-library";
export default function ComponentLibraryPage() {
  return (
    <main
      style={{
        background: "#f3f1eb",
        color: "#111",
        padding: "clamp(20px,4vw,60px)",
        minHeight: "100vh",
      }}
    >
      <a href="/engineering/modular-3d">← MODULAR PRODUCT</a>
      <p style={{ marginTop: 32, fontSize: 12, letterSpacing: 2 }}>
        GAMEFIELDS / COMPONENT LIBRARY v1.0
      </p>
      <h1
        style={{
          fontSize: "clamp(36px,6vw,80px)",
          letterSpacing: "-.05em",
          lineHeight: 1,
          margin: "20px 0",
        }}
      >
        Komponenty, nie skalowany model.
      </h1>
      <p>
        Kontrakty assetKey → GLB → PBR. Wymiary, połączenia, masa i materiały
        pozostają niepotwierdzone. Engineer Gate jest obowiązkowy.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))",
          gap: 20,
          marginTop: 40,
        }}
      >
        {Object.values(GAMEFIELDS_COMPONENT_LIBRARY).map((c) => (
          <article
            key={c.id}
            style={{ borderTop: "1px solid #111", padding: "20px 0" }}
          >
            <small>
              {c.category.toUpperCase()} / {c.structuralRole}
            </small>
            <h2 style={{ fontSize: 24, margin: "12px 0" }}>{c.id}</h2>
            <code style={{ fontSize: 12 }}>{c.assetKey}</code>
            <p>GLB: nie dostarczono · PBR: {c.pbrMaterialSlots.join(", ")}</p>
            <p>Wymiary / połączenia / masa: do potwierdzenia.</p>
            <p>
              Cost: {c.cost.status} · BOM: {c.bom.unit}
            </p>
          </article>
        ))}
      </div>
    </main>
  );
}
