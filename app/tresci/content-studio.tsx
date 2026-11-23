"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CHANNELS, METRICS, PILLARS, STATUSES,
  type Channel, type ContentPost, type MetricKey, type Metrics, type Pillar, type Status,
} from "@/lib/content-studio";

type View = "pulpit" | "kalendarz" | "tablica" | "wyniki";
const VIEWS: Array<[View, string]> = [["pulpit", "Pulpit"], ["kalendarz", "Kalendarz"], ["tablica", "Tablica"], ["wyniki", "Wyniki i trendy"]];
const DAYS = ["Pon", "Wt", "Śr", "Czw", "Pt", "Sob", "Nd"];
const WEEK_TARGET = 5;
const API = "/api/tresci/posts";

const ERRORS: Record<string, string> = {
  UNAUTHENTICATED: "Zaloguj się kontem Gamefields, żeby otworzyć studio.",
  FORBIDDEN: "Studio treści jest dostępne tylko dla administratora Gamefields.",
  TITLE_REQUIRED: "Dodaj temat lub tytuł.",
  INVALID_DATE: "Data publikacji jest niepoprawna.",
  INVALID_URL: "Link musi zaczynać się od https://.",
  POST_NOT_FOUND: "Ta treść została usunięta. Odśwież stronę.",
  INVALID_ORIGIN: "Żądanie odrzucone. Odśwież stronę i spróbuj ponownie.",
  SERVICE_UNAVAILABLE: "Nie udało się połączyć. Spróbuj ponownie.",
};
const errorText = (code: string) => ERRORS[code] || "Nie udało się wykonać akcji. Spróbuj ponownie.";

async function api(body?: Record<string, unknown>) {
  const res = await fetch(API, body ? { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) } : { cache: "no-store" });
  const data = await res.json().catch(() => ({ ok: false, error: "SERVICE_UNAVAILABLE" }));
  if (!res.ok || data.ok === false) throw new Error(data.error || "SERVICE_UNAVAILABLE");
  return data;
}

// ---- daty ----
const pad = (n: number) => String(n).padStart(2, "0");
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = (s: string) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
const addDays = (d: Date, n: number) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };
const monday = (d: Date) => { const x = new Date(d.getFullYear(), d.getMonth(), d.getDate()); return addDays(x, -((x.getDay() + 6) % 7)); };
const fmt = (s: string | null) => { if (!s) return "bez daty"; const d = parse(s); return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}`; };
const fmtLong = (s: string | null) => (s ? `${DAYS[(parse(s).getDay() + 6) % 7]} ${fmt(s)}` : "bez daty");
const todayIso = () => iso(new Date());

const nf = new Intl.NumberFormat("pl-PL");
const num = (v: unknown) => (typeof v === "number" && Number.isFinite(v) ? v : 0);
const interactions = (p: ContentPost) => num(p.metrics.reakcje) + num(p.metrics.komentarze) + num(p.metrics.udostepnienia);
const byDate = (a: ContentPost, b: ContentPost) => (a.date || "9999").localeCompare(b.date || "9999") || a.title.localeCompare(b.title);
const pct = (v: number) => v.toFixed(1).replace(".", ",") + "%";

function PillarChip({ pillar }: { pillar: Pillar }) {
  return <span className={`ts-chip ts-pillar ts-p-${pillar}`}><i className="ts-dot" /><span>{PILLARS[pillar]?.name}</span></span>;
}
const StatusChip = ({ status }: { status: Status }) => <span className={`ts-chip ts-st-${status}`}>{STATUSES[status]}</span>;
const ChannelChip = ({ channel }: { channel: Channel }) => <span className="ts-chip">{CHANNELS[channel]}</span>;

type Draft = Omit<ContentPost, "id" | "updatedAt"> & { id?: string };
const emptyDraft = (preset?: Partial<Draft>): Draft => ({ title: "", pillar: "realizacje", channel: "linkedin", status: "pomysl", date: null, body: "", notes: "", url: null, metrics: {}, ...preset });

export default function ContentStudio() {
  const [posts, setPosts] = useState<ContentPost[]>([]);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [error, setError] = useState("");
  const [view, setView] = useState<View>("pulpit");
  const [editing, setEditing] = useState<Draft | null>(null);
  const [toast, setToast] = useState("");

  const load = useCallback(async () => {
    try { const d = await api(); setPosts(d.posts); setState("ready"); setError(""); }
    catch (e) { setError((e as Error).message); setState("error"); }
  }, []);

  useEffect(() => {
    let alive = true;
    api()
      .then((d) => { if (alive) { setPosts(d.posts); setState("ready"); } })
      .catch((e: Error) => { if (alive) { setError(e.message); setState("error"); } });
    return () => { alive = false; };
  }, []);
  useEffect(() => {
    const sync = () => { const h = location.hash.slice(1) as View; setView(VIEWS.some(([v]) => v === h) ? h : "pulpit"); };
    sync(); window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(""), 2400); return () => clearTimeout(t); }, [toast]);

  const notify = (msg: string) => setToast(msg);

  async function save(draft: Draft) {
    const { id, ...post } = draft;
    await api({ action: "save", id, post });
    await load();
    notify(id ? "Zapisano" : "Dodano");
  }
  async function remove(id: string) {
    await api({ action: "delete", id });
    await load();
    notify("Usunięto");
  }
  async function saveMetrics(id: string, metrics: Metrics) {
    try { await api({ action: "metrics", id, metrics }); setPosts((ps) => ps.map((p) => (p.id === id ? { ...p, metrics } : p))); notify("Zapisano wyniki"); }
    catch (e) { notify(errorText((e as Error).message)); }
  }
  async function seed() {
    try { const d = await api({ action: "seed" }); setPosts(d.posts); notify("Wczytano plan na 8 tygodni"); }
    catch (e) { notify(errorText((e as Error).message)); }
  }
  const open = (p?: ContentPost, preset?: Partial<Draft>) => setEditing(p ? { ...p, metrics: { ...p.metrics } } : emptyDraft(preset));

  if (state !== "ready") {
    return (
      <div className="ts-root">
        <Header onNew={null} view={view} />
        <main className="ts-main">
          {state === "loading" ? <p className="ts-muted">Ładowanie studia…</p> : (
            <div className="ts-panel ts-gate">
              <h2>Studio treści</h2>
              <p>{errorText(error)}</p>
              {error === "UNAUTHENTICATED" && <a className="ts-btn ts-primary" href="/play/auth?returnTo=/tresci">Zaloguj się</a>}
              {error !== "UNAUTHENTICATED" && error !== "FORBIDDEN" && <button className="ts-btn" onClick={() => { setState("loading"); void load(); }}>Spróbuj ponownie</button>}
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="ts-root">
      <Header onNew={() => open()} view={view} />
      <main className="ts-main">
        {posts.length === 0 && (
          <div className="ts-panel ts-row ts-spread">
            <div><h3>Studio jest puste</h3><p className="ts-muted ts-m0">Wczytaj 41 tematów z planu treści na pierwsze 8 tygodni (od 30 listopada) albo dodaj własną treść.</p></div>
            <button className="ts-btn ts-primary" onClick={seed}>Wczytaj plan 8 tygodni</button>
          </div>
        )}
        {view === "pulpit" && <Dashboard posts={posts} open={open} />}
        {view === "kalendarz" && <Calendar posts={posts} open={open} />}
        {view === "tablica" && <Board posts={posts} open={open} />}
        {view === "wyniki" && <Results posts={posts} open={open} saveMetrics={saveMetrics} />}
      </main>
      {editing && <Editor draft={editing} close={() => setEditing(null)} save={save} remove={remove} />}
      {toast && <div className="ts-toast" role="status">{toast}</div>}
    </div>
  );
}

function Header({ onNew, view }: { onNew: (() => void) | null; view: View }) {
  return (
    <header className="ts-top">
      <div className="ts-top-in">
        <div className="ts-row ts-spread">
          <div className="ts-row ts-brand">
            <svg width="34" height="22" viewBox="0 0 34 22" aria-hidden="true"><rect x="1" y="1" width="32" height="20" rx="1.5" fill="none" stroke="currentColor" strokeWidth="2" /><line x1="17" y1="1" x2="17" y2="21" stroke="currentColor" strokeWidth="2" /><circle cx="17" cy="11" r="4.5" fill="none" stroke="currentColor" strokeWidth="2" /></svg>
            <div><h1>Studio treści</h1><small>Gamefields · marka osobista</small></div>
          </div>
          {onNew && <button className="ts-btn ts-primary" onClick={onNew}>+ Nowa treść</button>}
        </div>
        {onNew && (
          <nav className="ts-tabs" aria-label="Widoki">
            {VIEWS.map(([v, label]) => <a key={v} href={`#${v}`} aria-current={v === view ? "page" : undefined}>{label}</a>)}
          </nav>
        )}
      </div>
    </header>
  );
}

function ItemRow({ p, open, overdue }: { p: ContentPost; open: (p: ContentPost) => void; overdue?: boolean }) {
  return (
    <button className={`ts-item${overdue ? " ts-overdue" : ""}`} onClick={() => open(p)}>
      <span className="ts-d">{fmtLong(p.date)}</span>
      <span className="ts-t">{p.title}</span>
      <span className="ts-m"><ChannelChip channel={p.channel} /><StatusChip status={p.status} /></span>
    </button>
  );
}

const publishedIn = (posts: ContentPost[], start: string) => {
  const end = iso(addDays(parse(start), 6));
  return posts.filter((p) => p.status === "opublikowany" && p.date && p.date >= start && p.date <= end);
};

function Dashboard({ posts, open }: { posts: ContentPost[]; open: (p?: ContentPost) => void }) {
  const t = todayIso();
  const wStart = iso(monday(new Date()));
  const wEnd = iso(addDays(parse(wStart), 6));
  const pub = posts.filter((p) => p.status === "opublikowany");
  const pubWeek = publishedIn(posts, wStart);
  let streak = pubWeek.length >= 3 ? 1 : 0;
  for (let ws = addDays(parse(wStart), -7), i = 0; i < 104 && publishedIn(posts, iso(ws)).length >= 3; ws = addDays(ws, -7), i++) streak++;
  const leads = pub.reduce((s, p) => s + num(p.metrics.zapytania), 0);
  const withM = pub.filter((p) => Object.values(p.metrics).some((v) => num(v) > 0));
  const avgI = withM.length ? Math.round(withM.reduce((s, p) => s + interactions(p), 0) / withM.length) : null;
  const todo = posts.filter((p) => p.date && p.date >= wStart && p.date <= wEnd && p.status !== "opublikowany").sort(byDate);
  const upcoming = posts.filter((p) => p.date && p.date > wEnd && p.status !== "opublikowany").sort(byDate).slice(0, 5);
  const overdue = posts.filter((p) => p.date && p.date < wStart && p.date < t && p.status !== "opublikowany").sort(byDate);

  return (
    <section className="ts-view">
      <div><h2>Ten tydzień</h2><p className="ts-lead">Tydzień {fmt(wStart)}–{fmt(wEnd)}. Cel z planu: 3 posty na LinkedIn i 2 krótkie filmy.</p></div>
      <div className="ts-grid ts-g-kpi">
        <div className="ts-panel ts-kpi"><span className="ts-lbl">Opublikowane w tym tygodniu</span><span className="ts-val">{pubWeek.length}<small> / {WEEK_TARGET}</small></span><div className="ts-meter"><i style={{ width: `${Math.min(100, (pubWeek.length / WEEK_TARGET) * 100)}%` }} /></div></div>
        <div className="ts-panel ts-kpi"><span className="ts-lbl">Seria regularności</span><span className="ts-val">{streak}<small> {streak === 1 ? "tydzień" : "tyg."}</small></span><span className="ts-sub">tygodnie z min. 3 publikacjami</span></div>
        <div className="ts-panel ts-kpi"><span className="ts-lbl">Zapytania z treści</span><span className="ts-val">{leads}</span><span className="ts-sub">łącznie, wpisane w Wynikach</span></div>
        <div className="ts-panel ts-kpi"><span className="ts-lbl">Śr. interakcje na publikację</span><span className="ts-val">{avgI == null ? "—" : nf.format(avgI)}</span><span className="ts-sub">{withM.length ? `z ${withM.length} publikacji z wynikami` : "brak wpisanych wyników"}</span></div>
      </div>
      <div className="ts-grid ts-g-2">
        <div className="ts-panel">
          <div className="ts-row ts-spread"><h3>Do zrobienia w tym tygodniu</h3><span className="ts-small ts-muted">{todo.length ? `${todo.length} pozycji` : ""}</span></div>
          <div className="ts-list">{todo.length ? todo.map((p) => <ItemRow key={p.id} p={p} open={open} />) : <div className="ts-empty">Na ten tydzień nie ma nic do zrobienia.</div>}</div>
          {!todo.length && upcoming.length > 0 && (
            <>
              <h3 className="ts-sub-h">Najbliższe publikacje</h3>
              <div className="ts-list">{upcoming.map((p) => <ItemRow key={p.id} p={p} open={open} />)}</div>
            </>
          )}
        </div>
        <div className="ts-panel">
          <div className="ts-row ts-spread"><h3>Zaległe</h3><span className="ts-small ts-muted">termin minął, nieopublikowane</span></div>
          <div className="ts-list">{overdue.length ? overdue.map((p) => <ItemRow key={p.id} p={p} open={open} overdue />) : <div className="ts-empty">Brak zaległości.</div>}</div>
        </div>
      </div>
      <div className="ts-panel">
        <div className="ts-row ts-spread"><h3>Udział filarów w opublikowanych</h3><span className="ts-small ts-muted">kreska = cel z planu</span></div>
        <PillarShare pub={pub} />
      </div>
    </section>
  );
}

function PillarShare({ pub }: { pub: ContentPost[] }) {
  const total = pub.length;
  return (
    <div className="ts-share">
      {(Object.keys(PILLARS) as Pillar[]).map((k) => {
        const share = total ? Math.round((pub.filter((p) => p.pillar === k).length / total) * 100) : 0;
        return (
          <div className="ts-share-row" key={k}>
            <PillarChip pillar={k} />
            <div className="ts-share-bar"><i style={{ width: `${share}%`, background: `var(--ts-p-${k})` }} /><b style={{ left: `${PILLARS[k].target}%` }} title={`cel ${PILLARS[k].target}%`} /></div>
            <span className="ts-num ts-small">{share}% / {PILLARS[k].target}%</span>
          </div>
        );
      })}
      <p className="ts-note">{total ? `${total} opublikowanych treści.` : "Pasek wypełni się po oznaczeniu pierwszych treści jako opublikowane."}</p>
    </div>
  );
}

function Calendar({ posts, open }: { posts: ContentPost[]; open: (p?: ContentPost, preset?: Partial<Draft>) => void }) {
  const [start, setStart] = useState(() => iso(monday(new Date())));
  const t = todayIso();
  return (
    <section className="ts-view">
      <div className="ts-row ts-spread">
        <div><h2>Kalendarz publikacji</h2><p className="ts-lead">Kliknij wpis, żeby go edytować. „+ dodaj” tworzy treść na wybrany dzień.</p></div>
        <div className="ts-row">
          <button className="ts-btn" aria-label="Poprzednie tygodnie" onClick={() => setStart(iso(addDays(parse(start), -28)))}>←</button>
          <button className="ts-btn" onClick={() => setStart(iso(monday(new Date())))}>Dziś</button>
          <button className="ts-btn" aria-label="Następne tygodnie" onClick={() => setStart(iso(addDays(parse(start), 28)))}>→</button>
        </div>
      </div>
      <div className="ts-cal-wrap">
        <div className="ts-cal">
          <div className="ts-hd">Tydzień</div>
          {DAYS.map((d) => <div key={d} className="ts-hd">{d}</div>)}
          {[0, 1, 2, 3, 4].map((w) => {
            const ws = addDays(parse(start), w * 7);
            const wsI = iso(ws), weI = iso(addDays(ws, 6));
            const planned = posts.filter((p) => p.date && p.date >= wsI && p.date <= weI).length;
            return [
              <div key={`w${w}`} className="ts-wk"><b>{fmt(wsI)}–{fmt(weI)}</b><span className="ts-muted">{publishedIn(posts, wsI).length} opubl. / {planned} w planie</span></div>,
              ...[0, 1, 2, 3, 4, 5, 6].map((d) => {
                const day = iso(addDays(ws, d));
                return (
                  <div key={day} className={day === t ? "ts-today" : ""}>
                    <span className="ts-day-n">{fmt(day)}</span>
                    {posts.filter((p) => p.date === day).sort(byDate).map((p) => (
                      <button key={p.id} className={`ts-ev ts-p-${p.pillar}${p.status === "opublikowany" ? " ts-done" : ""}`} onClick={() => open(p)}>
                        <span>{p.title}</span><em>{CHANNELS[p.channel]} · {STATUSES[p.status]}</em>
                      </button>
                    ))}
                    <button className="ts-add-day" onClick={() => open(undefined, { date: day, status: "zaplanowany" })}>+ dodaj</button>
                  </div>
                );
              }),
            ];
          })}
        </div>
      </div>
      <div className="ts-row">{(Object.keys(PILLARS) as Pillar[]).map((k) => <PillarChip key={k} pillar={k} />)}</div>
    </section>
  );
}

function Board({ posts, open }: { posts: ContentPost[]; open: (p?: ContentPost) => void }) {
  const [fp, setFp] = useState("");
  const [fc, setFc] = useState("");
  const list = posts.filter((p) => (!fp || p.pillar === fp) && (!fc || p.channel === fc));
  return (
    <section className="ts-view">
      <div className="ts-row ts-spread">
        <div><h2>Tablica treści</h2><p className="ts-lead">Wszystkie pomysły, szkice i publikacje według statusu.</p></div>
        <div className="ts-row">
          <select id="ts-f-pillar" className="ts-inp" aria-label="Filtr filaru" value={fp} onChange={(e) => setFp(e.target.value)}>
            <option value="">Wszystkie filary</option>{(Object.keys(PILLARS) as Pillar[]).map((k) => <option key={k} value={k}>{PILLARS[k].name}</option>)}
          </select>
          <select id="ts-f-channel" className="ts-inp" aria-label="Filtr kanału" value={fc} onChange={(e) => setFc(e.target.value)}>
            <option value="">Wszystkie kanały</option>{(Object.keys(CHANNELS) as Channel[]).map((k) => <option key={k} value={k}>{CHANNELS[k]}</option>)}
          </select>
        </div>
      </div>
      <div className="ts-board">
        {(Object.keys(STATUSES) as Status[]).map((s) => {
          let items = list.filter((p) => p.status === s).sort(byDate);
          if (s === "opublikowany") items = items.reverse();
          return (
            <div className="ts-col" key={s}>
              <h3><span>{STATUSES[s]}</span><span className="ts-num ts-small ts-muted">{items.length}</span></h3>
              {items.length ? items.map((p) => (
                <button key={p.id} className="ts-card" onClick={() => open(p)}>
                  <span className="ts-t">{p.title}</span>
                  <span className="ts-meta"><PillarChip pillar={p.pillar} /><span>{CHANNELS[p.channel]}</span><span className="ts-num">{fmt(p.date)}</span></span>
                </button>
              )) : <div className="ts-empty ts-small">Pusto</div>}
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Results({ posts, open, saveMetrics }: { posts: ContentPost[]; open: (p: ContentPost) => void; saveMetrics: (id: string, m: Metrics) => void }) {
  const pub = useMemo(() => posts.filter((p) => p.status === "opublikowany").sort(byDate).reverse(), [posts]);
  const sum = (k: MetricKey) => pub.reduce((s, p) => s + num(p.metrics[k]), 0);
  const views = sum("wyswietlenia");
  const inter = pub.reduce((s, p) => s + interactions(p), 0);
  const rows = (Object.keys(PILLARS) as Pillar[]).map((k) => {
    const ps = pub.filter((p) => p.pillar === k);
    const v = ps.reduce((s, p) => s + num(p.metrics.wyswietlenia), 0);
    const i = ps.reduce((s, p) => s + interactions(p), 0);
    return { k, cnt: ps.length, avg: ps.length ? Math.round(i / ps.length) : 0, er: v ? (i / v) * 100 : null, leads: ps.reduce((s, p) => s + num(p.metrics.zapytania), 0) };
  });
  const best = Math.max(0, ...rows.map((r) => r.avg));

  return (
    <section className="ts-view">
      <div><h2>Wyniki i trendy</h2><p className="ts-lead">Wpisz liczby z LinkedIn, Instagrama czy TikToka przy opublikowanych treściach. Najważniejsza kolumna to zapytania ofertowe, które przyszły dzięki danej publikacji.</p></div>
      <div className="ts-grid ts-g-kpi">
        <div className="ts-panel ts-kpi"><span className="ts-lbl">Opublikowane</span><span className="ts-val">{pub.length}</span></div>
        <div className="ts-panel ts-kpi"><span className="ts-lbl">Wyświetlenia</span><span className="ts-val">{nf.format(views)}</span></div>
        <div className="ts-panel ts-kpi"><span className="ts-lbl">Zaangażowanie</span><span className="ts-val">{views ? pct((inter / views) * 100) : "—"}</span><span className="ts-sub">interakcje / wyświetlenia</span></div>
        <div className="ts-panel ts-kpi"><span className="ts-lbl">Kliknięcia na stronę</span><span className="ts-val">{nf.format(sum("klikniecia"))}</span></div>
        <div className="ts-panel ts-kpi"><span className="ts-lbl">Zapytania ofertowe</span><span className="ts-val">{sum("zapytania")}</span></div>
      </div>
      <div className="ts-panel">
        <div className="ts-row ts-spread"><h3>Interakcje tydzień po tygodniu</h3>
          <div className="ts-legend"><span><i style={{ background: "var(--ts-accent)" }} />interakcje</span><span><i className="ts-bar2-sw" />liczba publikacji (prawa oś)</span></div>
        </div>
        <WeeklyChart posts={posts} />
      </div>
      <div className="ts-panel">
        <h3>Filary: co działa</h3>
        <div className="ts-tbl-wrap">
          <table className="ts-table">
            <thead><tr><th>Filar</th><th className="ts-n">Publikacje</th><th className="ts-n">Śr. interakcje</th><th className="ts-n">Zaangażowanie</th><th className="ts-n">Zapytania</th><th className="ts-n">Udział / cel</th></tr></thead>
            <tbody>{rows.map((r) => (
              <tr key={r.k}>
                <td><PillarChip pillar={r.k} /></td>
                <td className="ts-n">{r.cnt}</td>
                <td className={`ts-n${r.avg && r.avg === best ? " ts-best" : ""}`}>{r.cnt ? nf.format(r.avg) : "—"}</td>
                <td className="ts-n">{r.er == null ? "—" : pct(r.er)}</td>
                <td className="ts-n">{r.leads}</td>
                <td className="ts-n">{pub.length ? Math.round((r.cnt / pub.length) * 100) : 0}% / {PILLARS[r.k].target}%</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      </div>
      <div className="ts-panel">
        <h3>Opublikowane treści</h3>
        <p className="ts-note">Wynik zapisuje się po wyjściu z pola.</p>
        {pub.length ? (
          <div className="ts-tbl-wrap">
            <table className="ts-table">
              <thead><tr><th>Data</th><th>Treść</th><th>Kanał</th>{METRICS.map(([k, l]) => <th key={k} className="ts-n">{l}</th>)}</tr></thead>
              <tbody>{pub.map((p) => (
                <tr key={p.id}>
                  <td className="ts-num ts-small">{fmt(p.date)}</td>
                  <td><button className="ts-tl" onClick={() => open(p)}>{p.title}</button><div><PillarChip pillar={p.pillar} /></div></td>
                  <td className="ts-small">{CHANNELS[p.channel]}</td>
                  {METRICS.map(([k, l]) => (
                    <td key={k} className="ts-n">
                      <input
                        className="ts-inp ts-metric" type="number" min={0} inputMode="numeric" id={`ts-m-${p.id}-${k}`} aria-label={`${l}: ${p.title}`}
                        defaultValue={p.metrics[k] ?? ""}
                        onBlur={(e) => {
                          const raw = e.target.value;
                          const next: Metrics = { ...p.metrics };
                          if (raw === "") delete next[k]; else next[k] = Math.max(0, Math.round(Number(raw)));
                          if (next[k] !== p.metrics[k]) saveMetrics(p.id, next);
                        }}
                      />
                    </td>
                  ))}
                </tr>
              ))}</tbody>
            </table>
          </div>
        ) : <div className="ts-empty">Gdy oznaczysz treść jako opublikowaną, pojawi się tutaj i będzie można wpisać jej wyniki.</div>}
      </div>
    </section>
  );
}

function WeeklyChart({ posts }: { posts: ContentPost[] }) {
  const cur = monday(new Date());
  const weeks = Array.from({ length: 8 }, (_, idx) => {
    const ws = iso(addDays(cur, -7 * (7 - idx)));
    const ps = publishedIn(posts, ws);
    return { label: fmt(ws), inter: ps.reduce((s, p) => s + interactions(p), 0), cnt: ps.length };
  });
  const W = 720, H = 240, L = 46, R = 36, T = 16, B = 30;
  const maxI = Math.max(10, ...weeks.map((w) => w.inter));
  const step = Math.pow(10, Math.floor(Math.log10(maxI)));
  const niceMax = Math.ceil(maxI / step) * step;
  const maxC = Math.max(WEEK_TARGET, ...weeks.map((w) => w.cnt));
  const bw = (W - L - R) / weeks.length;
  const y = (v: number) => T + (H - T - B) * (1 - v / niceMax);
  const yc = (v: number) => T + (H - T - B) * (1 - v / maxC);
  const cw = bw * 0.22, iw = bw * 0.44;
  return (
    <div className="ts-chart">
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Interakcje i liczba publikacji w ostatnich 8 tygodniach">
        {[0, 1, 2, 3, 4].map((i) => { const v = (niceMax / 4) * i; return <g key={i}><line className="ts-grid-l" x1={L} x2={W - R} y1={y(v)} y2={y(v)} /><text x={L - 6} y={y(v) + 4} textAnchor="end">{nf.format(Math.round(v))}</text></g>; })}
        <text x={W - R + 6} y={yc(maxC) + 4}>{maxC}</text>
        <text x={W - R + 6} y={yc(0) + 4}>0</text>
        <line className="ts-target" x1={L} x2={W - R} y1={yc(WEEK_TARGET)} y2={yc(WEEK_TARGET)} />
        <text className="ts-target-t" x={L + 4} y={yc(WEEK_TARGET) - 4}>cel: {WEEK_TARGET} publikacji</text>
        {weeks.map((w, i) => {
          const x = L + i * bw;
          return (
            <g key={w.label}>
              <rect className="ts-bar2" x={x + bw * 0.1} y={yc(w.cnt)} width={cw} height={Math.max(0, yc(0) - yc(w.cnt))} rx={2} />
              <rect className="ts-bar" x={x + bw * 0.1 + cw + 3} y={y(w.inter)} width={iw} height={Math.max(0, y(0) - y(w.inter))} rx={2} />
              {w.inter > 0 && <text className="ts-val-t" x={x + bw * 0.1 + cw + 3 + iw / 2} y={y(w.inter) - 4} textAnchor="middle">{nf.format(w.inter)}</text>}
              <text x={x + bw / 2} y={H - 10} textAnchor="middle" className={i === weeks.length - 1 ? "ts-cur" : undefined}>{w.label}</text>
            </g>
          );
        })}
      </svg>
      {!weeks.some((w) => w.cnt) && <p className="ts-note">Wykres pokazuje 8 ostatnich tygodni. Wypełni się, gdy pojawią się opublikowane treści z wynikami.</p>}
    </div>
  );
}

function Editor({ draft, close, save, remove }: { draft: Draft; close: () => void; save: (d: Draft) => Promise<void>; remove: (id: string) => Promise<void> }) {
  const [d, setD] = useState<Draft>(draft);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const [confirm, setConfirm] = useState(false);
  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setD((x) => ({ ...x, [k]: v }));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") close(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [close]);

  async function submit() {
    if (!d.title.trim()) { setErr(errorText("TITLE_REQUIRED")); return; }
    setBusy(true); setErr("");
    try { await save(d); close(); } catch (e) { setErr(errorText((e as Error).message)); } finally { setBusy(false); }
  }
  async function doDelete() {
    if (!d.id) return;
    setBusy(true);
    try { await remove(d.id); close(); } catch (e) { setErr(errorText((e as Error).message)); setBusy(false); }
  }
  async function copy() {
    try { await navigator.clipboard.writeText(d.body); setErr(""); } catch { setErr("Nie udało się skopiować. Zaznacz tekst i skopiuj ręcznie."); }
  }

  return (
    <>
      <div className="ts-scrim" onClick={close} />
      <aside className="ts-drawer" role="dialog" aria-modal="true" aria-label={d.id ? "Edycja treści" : "Nowa treść"}>
        <header><h3>{d.id ? "Edycja treści" : "Nowa treść"}</h3><button className="ts-btn ts-ghost" onClick={close} aria-label="Zamknij">✕</button></header>
        <div className="ts-body">
          <div className="ts-field"><label className="ts-lbl" htmlFor="ts-e-title">Temat</label><input className="ts-inp" id="ts-e-title" autoFocus value={d.title} placeholder="Temat lub tytuł" onChange={(e) => set("title", e.target.value)} /></div>
          <div className="ts-f2">
            <div className="ts-field"><label className="ts-lbl" htmlFor="ts-e-pillar">Filar</label>
              <select className="ts-inp" id="ts-e-pillar" value={d.pillar} onChange={(e) => set("pillar", e.target.value as Pillar)}>{(Object.keys(PILLARS) as Pillar[]).map((k) => <option key={k} value={k}>{PILLARS[k].name}</option>)}</select></div>
            <div className="ts-field"><label className="ts-lbl" htmlFor="ts-e-channel">Kanał</label>
              <select className="ts-inp" id="ts-e-channel" value={d.channel} onChange={(e) => set("channel", e.target.value as Channel)}>{(Object.keys(CHANNELS) as Channel[]).map((k) => <option key={k} value={k}>{CHANNELS[k]}</option>)}</select></div>
            <div className="ts-field"><label className="ts-lbl" htmlFor="ts-e-status">Status</label>
              <select className="ts-inp" id="ts-e-status" value={d.status} onChange={(e) => set("status", e.target.value as Status)}>{(Object.keys(STATUSES) as Status[]).map((k) => <option key={k} value={k}>{STATUSES[k]}</option>)}</select></div>
            <div className="ts-field"><label className="ts-lbl" htmlFor="ts-e-date">Data publikacji</label><input className="ts-inp" id="ts-e-date" type="date" value={d.date || ""} onChange={(e) => set("date", e.target.value || null)} /></div>
          </div>
          <div className="ts-field"><label className="ts-lbl" htmlFor="ts-e-notes">Notatki i fakty</label><textarea className="ts-inp" id="ts-e-notes" value={d.notes} placeholder="Fakty, liczby, zdjęcia do użycia…" onChange={(e) => set("notes", e.target.value)} /></div>
          <div className="ts-field">
            <div className="ts-row ts-spread"><label className="ts-lbl" htmlFor="ts-e-body">Treść</label><button className="ts-btn ts-ghost ts-small" onClick={copy} disabled={!d.body}>Kopiuj</button></div>
            <textarea className="ts-inp ts-bodytext" id="ts-e-body" value={d.body} placeholder="Treść posta, scenariusz filmu lub artykuł." onChange={(e) => set("body", e.target.value)} />
            <span className="ts-note">{d.body.trim() ? `${d.body.trim().split(/\s+/).length} słów` : ""}</span>
          </div>
          <div className="ts-field"><label className="ts-lbl" htmlFor="ts-e-url">Link do publikacji</label><input className="ts-inp" id="ts-e-url" type="url" value={d.url || ""} placeholder="https://…" onChange={(e) => set("url", e.target.value || null)} /></div>
          {d.status === "opublikowany" && (
            <div className="ts-field"><span className="ts-lbl">Wyniki</span>
              <div className="ts-f2">{METRICS.map(([k, l]) => (
                <div className="ts-field" key={k}><label className="ts-lbl" htmlFor={`ts-e-m-${k}`}>{l}</label>
                  <input className="ts-inp" id={`ts-e-m-${k}`} type="number" min={0} value={d.metrics[k] ?? ""}
                    onChange={(e) => { const m = { ...d.metrics }; if (e.target.value === "") delete m[k]; else m[k] = Math.max(0, Math.round(Number(e.target.value))); set("metrics", m); }} /></div>
              ))}</div>
            </div>
          )}
          {err && <div className="ts-err" role="alert">{err}</div>}
          {confirm && (
            <div className="ts-confirm"><span>Usunąć tę treść na stałe?</span>
              <button className="ts-btn ts-danger" disabled={busy} onClick={doDelete}>Tak, usuń</button>
              <button className="ts-btn" onClick={() => setConfirm(false)}>Anuluj</button></div>
          )}
        </div>
        <footer>
          {d.id ? <button className="ts-btn ts-danger" onClick={() => setConfirm(true)}>Usuń</button> : <span />}
          <div className="ts-row"><button className="ts-btn" onClick={close}>Anuluj</button><button className="ts-btn ts-primary" disabled={busy} onClick={submit}>{busy ? "Zapisywanie…" : "Zapisz"}</button></div>
        </footer>
      </aside>
    </>
  );
}
