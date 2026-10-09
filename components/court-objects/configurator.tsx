"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  Check,
  Copy,
  Save,
  X,
  MoveUpRight,
} from "lucide-react";
import { z } from "zod";
import {
  Design,
  initialDesign,
  palettes,
  sports,
  layouts,
  formats,
  materials,
  priceOf,
  money,
} from "./data";
import { CourtPreview, RoomPreview } from "./preview";

const designSchema = z.object({
  id: z.string().max(100),
  sport: z.enum(sports),
  palette: z.number().int().min(0).max(6),
  layout: z.number().int().min(0).max(5),
  scale: z.number().min(65).max(160),
  x: z.number().min(-250).max(250),
  y: z.number().min(-250).max(250),
  rotation: z.number().min(-20).max(20),
  label: z.boolean(),
  texture: z.boolean(),
  name: z.string().max(50),
  city: z.string().max(60),
  coordinates: z.string().max(80),
  year: z.string().max(10),
  number: z.string().max(15),
  format: z.number().int().min(0).max(2),
  material: z.number().int().min(0).max(3),
});
function Section({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="co-section">
      <h3>
        <span>{number}</span>
        {title}
      </h3>
      {children}
    </section>
  );
}
export default function CourtConfigurator() {
  const [d, setD] = useState<Design>(initialDesign),
    [view, setView] = useState("artwork"),
    [modal, setModal] = useState<"real" | "order" | null>(null),
    [notice, setNotice] = useState(""),
    [submitted, setSubmitted] = useState(false);
  const update = (patch: Partial<Design>) => setD((v) => ({ ...v, ...patch }));
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const shared = new URLSearchParams(location.search).get("design");
        const stored = localStorage.getItem("gamefields-current");
        const parsed = designSchema.safeParse(
          JSON.parse(shared || stored || "null"),
        );
        if (parsed.success) setD(parsed.data);
      } catch {
        setNotice("Could not restore this design. Start a new court.");
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (!notice) return;
    const t = setTimeout(() => setNotice(""), 4500);
    return () => clearTimeout(t);
  }, [notice]);
  useEffect(() => {
    if (!modal) return;
    const previous = document.activeElement as HTMLElement;
    document.body.style.overflow = "hidden";
    const dialog = document.querySelector<HTMLElement>(".co-dialog");
    dialog?.querySelector<HTMLElement>("button")?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModal(null);
      if (e.key === "Tab") {
        const all = dialog?.querySelectorAll<HTMLElement>(
          "button,input,textarea",
        );
        if (!all?.length) return;
        const first = all[0],
          last = all[all.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handler);
      previous?.focus();
    };
  }, [modal]);
  const save = () => {
    try {
      const next = {
        ...d,
        id:
          d.id === "GF-052"
            ? "GF-" + crypto.randomUUID().slice(0, 8).toUpperCase()
            : d.id,
      };
      const history = JSON.parse(
        localStorage.getItem("gamefields-designs") || "{}",
      );
      localStorage.setItem(
        "gamefields-designs",
        JSON.stringify({ ...history, [next.id]: next }),
      );
      localStorage.setItem("gamefields-current", JSON.stringify(next));
      setD(next);
      setNotice("Design saved on this device.");
    } catch {
      setNotice(
        "Storage is unavailable. Use Copy design link to keep your design.",
      );
    }
  };
  const share = async () => {
    const url = new URL(location.href);
    url.searchParams.set("design", JSON.stringify(d));
    try {
      await navigator.clipboard.writeText(url.toString());
      setNotice("Design link copied.");
    } catch {
      window.prompt("Copy your design link", url.toString());
    }
  };
  const open = (type: "real" | "order") => {
    setSubmitted(false);
    setModal(type);
  };
  return (
    <div
      className="co-app min-h-screen antialiased"
      style={
        { "--co-accent": palettes[d.palette].colors[0] } as React.CSSProperties
      }
    >
      <header className="co-header">
        <Link href="/objects" className="co-logo">
          GAMEFIELDS<span>®</span>
        </Link>
        <nav aria-label="Main navigation">
          <Link href="/">COURTS</Link>
          <a href="#configure">OBJECTS</a>
          <a href="#about">ABOUT</a>
        </nav>
        <a className="co-header-cta" href="#configure">
          BUILD YOUR COURT <ArrowUpRight size={15} />
        </a>
      </header>
      <main>
        <section className="co-hero">
          <div>
            <div className="co-eyebrow">
              <span className="co-dot" /> COURT OBJECTS — COLLECTION 001
            </div>
            <h1>
              BUILD A COURT
              <br />
              FOR YOUR <span>WALL.</span>
            </h1>
            <div className="co-hero-bottom">
              <p>
                Turn court geometry into a collectible design object.
                <br />
                Made by us. Composed by you.
              </p>
              <a href="#configure">
                START DESIGNING <ArrowDown />
              </a>
            </div>
          </div>
          <div className="co-hero-note">
            FROM THE STREET.
            <br />
            INTO YOUR SPACE.
            <span>
              52.2297° N<br />
              21.0122° E
            </span>
          </div>
        </section>
        <div className="co-divider">
          <span>YOUR COURT. YOUR COMPOSITION.</span>
          <span>
            DESIGNED TO LIVE OFF THE COURT <ArrowUpRight size={13} />
          </span>
        </div>
        <section id="configure" className="co-configurator">
          <aside className="co-options">
            <div className="co-options-title">
              <span>THE CONFIGURATOR</span>
              <span>01 — 07</span>
            </div>
            <Section number="01" title="SPORT">
              <div className="co-sports">
                {sports.map((s) => (
                  <button
                    key={s}
                    aria-pressed={d.sport === s}
                    className={d.sport === s ? "selected" : ""}
                    onClick={() => update({ sport: s })}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </Section>
            <Section number="02" title="COURT LAYOUT">
              <div className="co-layouts">
                {layouts.map((l, i) => (
                  <button
                    key={l}
                    title={l}
                    aria-label={l}
                    aria-pressed={d.layout === i}
                    className={d.layout === i ? "selected" : ""}
                    onClick={() => update({ layout: i })}
                  >
                    <CourtPreview
                      design={{
                        ...d,
                        layout: i,
                        scale: 100,
                        x: 0,
                        y: 0,
                        rotation: 0,
                        label: false,
                      }}
                      small
                    />
                    <span>0{i + 1}</span>
                  </button>
                ))}
              </div>
              <div className="co-caption">
                {layouts[d.layout]} <span>↗</span>
              </div>
            </Section>
            <Section number="03" title="COLOR PALETTE">
              <div className="co-palettes">
                {palettes.map((p, i) => (
                  <button
                    key={p.name}
                    aria-pressed={d.palette === i}
                    className={d.palette === i ? "selected" : ""}
                    onClick={() => update({ palette: i })}
                  >
                    <span className="co-swatches">
                      {p.colors.map((c) => (
                        <i key={c} style={{ background: c }} />
                      ))}
                    </span>
                    <span>{p.name}</span>
                    {d.palette === i ? <Check size={13} /> : <span />}
                  </button>
                ))}
              </div>
            </Section>
            <Section number="04" title="COMPOSITION">
              <div className="co-sliders">
                {(
                  [
                    {
                      key: "scale",
                      name: "Scale",
                      min: 65,
                      max: 160,
                      unit: "%",
                    },
                    {
                      key: "x",
                      name: "Horizontal",
                      min: -250,
                      max: 250,
                      unit: "",
                    },
                    {
                      key: "y",
                      name: "Vertical",
                      min: -250,
                      max: 250,
                      unit: "",
                    },
                    {
                      key: "rotation",
                      name: "Rotation",
                      min: -20,
                      max: 20,
                      unit: "°",
                    },
                  ] as const
                ).map((c) => (
                  <label key={c.key}>
                    <span>
                      {c.name}
                      <b>
                        {d[c.key]}
                        {c.unit}
                      </b>
                    </span>
                    <input
                      type="range"
                      min={c.min}
                      max={c.max}
                      value={d[c.key]}
                      onChange={(e) =>
                        update({ [c.key]: Number(e.target.value) })
                      }
                    />
                  </label>
                ))}
              </div>
              <button
                className="co-text-button"
                onClick={() => update({ scale: 100, x: 0, y: 0, rotation: 0 })}
              >
                Reset composition ↺
              </button>
              <label className="co-toggle">
                <span>Subtle surface texture</span>
                <input
                  type="checkbox"
                  checked={d.texture}
                  onChange={(e) => update({ texture: e.target.checked })}
                />
              </label>
            </Section>
            <Section number="05" title="TEXT / LOCATION">
              <label className="co-toggle">
                <span>{d.label ? "SHOW LABEL" : "HIDE LABEL"}</span>
                <input
                  type="checkbox"
                  checked={d.label}
                  onChange={(e) => update({ label: e.target.checked })}
                />
              </label>
              {d.label ? (
                <div className="co-fields">
                  {(
                    ["name", "city", "coordinates", "year", "number"] as const
                  ).map((k) => (
                    <label key={k}>
                      {
                        {
                          name: "Court name",
                          city: "City",
                          coordinates: "Coordinates",
                          year: "Year",
                          number: "Custom number",
                        }[k]
                      }
                      <input
                        value={d[k]}
                        maxLength={
                          k === "coordinates"
                            ? 80
                            : k === "city"
                              ? 60
                              : k === "year"
                                ? 10
                                : k === "number"
                                  ? 15
                                  : 50
                        }
                        onChange={(e) => update({ [k]: e.target.value })}
                      />
                    </label>
                  ))}
                </div>
              ) : (
                <p className="co-helper">
                  A place, a memory, a court. Make it yours.
                </p>
              )}
            </Section>
            <Section number="06" title="FORMAT">
              <div className="co-formats">
                {formats.map((s, i) => (
                  <button
                    key={s}
                    className={d.format === i ? "selected" : ""}
                    aria-pressed={d.format === i}
                    onClick={() => update({ format: i })}
                  >
                    {s}
                    <small>CM</small>
                  </button>
                ))}
              </div>
            </Section>
            <Section number="07" title="MATERIAL">
              <div className="co-materials">
                {materials.map((m, i) => (
                  <button
                    key={m.name}
                    className={d.material === i ? "selected" : ""}
                    aria-pressed={d.material === i}
                    onClick={() => update({ material: i })}
                  >
                    <span className={"co-sample sample-" + i} />
                    <span>
                      <strong>{m.name}</strong>
                      <small>{m.detail}</small>
                    </span>
                    {d.material === i ? <Check size={15} /> : null}
                  </button>
                ))}
              </div>
            </Section>
          </aside>
          <div className="co-preview-column">
            <div className="co-preview-sticky">
              <div className="co-preview-toolbar">
                <div className="co-view-tabs">
                  {["artwork", "room"].map((v) => (
                    <button
                      key={v}
                      aria-pressed={view === v}
                      className={view === v ? "active" : ""}
                      onClick={() => setView(v)}
                    >
                      {v === "artwork" ? "ARTWORK" : "ROOM VIEW"}
                    </button>
                  ))}
                </div>
                <span>
                  LIVE PREVIEW <i />
                </span>
              </div>
              <div className="co-stage">
                {view === "artwork" ? (
                  <>
                    <span className="co-stage-code">GF / CO — 001</span>
                    <div
                      className={`co-art co-material-${d.material}`}
                      style={{ width: [38, 46, 54][d.format] + "%" }}
                    >
                      <CourtPreview design={d} />
                    </div>
                    <span className="co-dimension">{formats[d.format]} CM</span>
                    <div className="co-stage-bottom">
                      <span>COMPOSED BY YOU.</span>
                      <span>© GAMEFIELDS {d.year}</span>
                    </div>
                  </>
                ) : (
                  <RoomPreview design={d} />
                )}
              </div>
              <div className="co-preview-meta">
                <span>
                  <i /> {palettes[d.palette].name.toUpperCase()} /{" "}
                  {d.sport.toUpperCase()}
                </span>
                <button onClick={share}>
                  <Copy size={13} /> COPY DESIGN LINK
                </button>
              </div>
              <div className="co-summary">
                <div>
                  <span className="co-eyebrow">ONE OF A KIND. YOURS.</span>
                  <h2>
                    YOUR COURT
                    <ArrowUpRight size={26} />
                  </h2>
                  <dl>
                    <div>
                      <dt>Sport / Palette</dt>
                      <dd>
                        {d.sport} / {palettes[d.palette].name}
                      </dd>
                    </div>
                    <div>
                      <dt>Size / Material</dt>
                      <dd>
                        {formats[d.format]} cm / {materials[d.material].name}
                      </dd>
                    </div>
                  </dl>
                </div>
                <div className="co-purchase">
                  <div className="co-price">
                    {money(priceOf(d))}
                    <span>VAT included · shipping at checkout</span>
                  </div>
                  <button className="co-primary" onClick={() => open("order")}>
                    ORDER YOUR COURT <ArrowUpRight size={17} />
                  </button>
                  <button className="co-save" onClick={save}>
                    <Save size={13} /> SAVE DESIGN
                  </button>
                </div>
              </div>
              <button className="co-real" onClick={() => open("real")}>
                <span>
                  THINKING BIGGER?<strong>BUILD THIS COURT FOR REAL</strong>
                </span>
                <MoveUpRight size={26} />
              </button>
            </div>
          </div>
        </section>
        <section id="about" className="co-about">
          <div className="co-eyebrow">NOT JUST A GAME.</div>
          <h2>
            STREET CULTURE.
            <br />
            GALLERY PRESENCE.
          </h2>
          <p>
            The lines we play between become the objects we live with. A
            collection of court-inspired works, made to bring a little of the
            outside in.
          </p>
          <span>DESIGNED IN WARSAW. MADE FOR YOUR SPACE.</span>
        </section>
      </main>
      <footer className="co-footer">
        <Link className="co-logo" href="/objects">
          GAMEFIELDS®
        </Link>
        <span>COURT OBJECTS / COLLECTION 001</span>
        <span>© 2026 GAMEFIELDS</span>
      </footer>
      <div className="co-mobile-bar">
        <strong>{money(priceOf(d))}</strong>
        <button onClick={() => open("order")}>
          ORDER YOUR COURT <ArrowUpRight size={15} />
        </button>
      </div>
      {notice ? (
        <div className="co-notice" role="status">
          <Check size={16} />
          {notice}
        </div>
      ) : null}
      {modal ? (
        <div
          className="co-modal"
          onClick={(e) => {
            if (e.target === e.currentTarget) setModal(null);
          }}
        >
          <div
            className="co-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="co-dialog-title"
          >
            <button
              className="co-close"
              aria-label="Close dialog"
              onClick={() => setModal(null)}
            >
              <X />
            </button>
            <div className="co-eyebrow">
              GAMEFIELDS /{" "}
              {modal === "real" ? "FROM OBJECT TO COURT" : "YOUR COURT OBJECT"}
            </div>
            <h2 id="co-dialog-title">
              {submitted
                ? "ALL SET."
                : modal === "real"
                  ? "Want to turn this artwork into a real court?"
                  : "YOUR COURT. READY TO GO."}
            </h2>
            {submitted ? (
              <>
                <p>
                  {modal === "real"
                    ? "Your enquiry has been saved on this device. This prototype does not send it to GAMEFIELDS."
                    : "Your order draft has been saved on this device. No payment has been collected."}
                </p>
                <button className="co-primary" onClick={() => setModal(null)}>
                  BACK TO YOUR COURT <ArrowRight size={16} />
                </button>
              </>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  try {
                    const form = Object.fromEntries(
                      new FormData(e.currentTarget),
                    );
                    localStorage.setItem(
                      "gamefields-" + modal + "-" + Date.now(),
                      JSON.stringify({
                        design: d,
                        details: form,
                        price: priceOf(d),
                      }),
                    );
                    setSubmitted(true);
                  } catch {
                    setNotice(
                      "Unable to save. Please allow local storage and try again.",
                    );
                  }
                }}
              >
                {modal === "order" ? (
                  <div className="co-order-detail">
                    <CourtPreview design={d} small />
                    <div>
                      <strong>{materials[d.material].name}</strong>
                      <p>
                        {formats[d.format]} cm · {palettes[d.palette].name}
                      </p>
                      <b>{money(priceOf(d))}</b>
                    </div>
                  </div>
                ) : null}
                <p className="co-helper">
                  Local prototype — your details stay on this device.
                </p>
                {(modal === "real"
                  ? ["Name", "Email", "City", "Approximate location"]
                  : ["Name", "Email", "Shipping address"]
                ).map((field) => (
                  <label key={field}>
                    {field}
                    <input
                      name={field}
                      type={field === "Email" ? "email" : "text"}
                      required={field !== "Approximate location"}
                      maxLength={200}
                    />
                  </label>
                ))}
                {modal === "real" ? (
                  <label>
                    Message
                    <textarea name="Message" rows={3} maxLength={2000} />
                  </label>
                ) : null}
                <button className="co-primary" type="submit">
                  {modal === "real" ? "SAVE COURT ENQUIRY" : "SAVE ORDER DRAFT"}{" "}
                  <ArrowUpRight size={16} />
                </button>
              </form>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
function ArrowDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path d="M8 1v13m-5-5 5 5 5-5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
