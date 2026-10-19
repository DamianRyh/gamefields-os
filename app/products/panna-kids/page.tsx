"use client";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";
import {
  colorPreferences,
  surfacePreferences,
  newPannaConfiguration,
  pannaConfigurationSchema,
  pannaInquirySchema,
  pannaSummary,
  pannaBrief,
  type PannaConfiguration,
} from "../../../lib/products/panna-kids";
import { GlbViewer } from "../../../components/gamefields/glb-viewer";
import "../../engineering/source-models/source-models.css";
import {
  pannaKidsEvidence,
  pannaTargetLabel,
} from "../../../lib/products/panna-kids";
import styles from "./panna-kids.module.css";

const storageKey = "gamefields:panna-kids:projects:v1";
const savedSchema = z.array(pannaConfigurationSchema).max(5);
const steps = ["Produkt", "Wygląd", "Zakres", "Miejsce", "Podsumowanie"];
const imageViews = [
  { file: "perspective.webp", label: "Perspektywa" },
  { file: "overhead.webp", label: "Z góry" },
  { file: "detail.webp", label: "Niski kadr" },
];
const initial = newPannaConfiguration("00000000-0000-4000-8000-000000000000");
export default function PannaKidsPage({
  assetBase = "/products/panna-kids",
  inquiryEndpoint = "/api/products/panna-kids/inquiries",
  studioHref = "/",
  backgroundBase = "/configurator-backgrounds",
}: {
  assetBase?: string;
  inquiryEndpoint?: string | null;
  studioHref?: string;
  backgroundBase?: string;
}) {
  const [project, setProject] = useState<PannaConfiguration>(initial);
  const [saved, setSaved] = useState<PannaConfiguration[]>([]);
  const [ready, setReady] = useState(false);
  const [step, setStep] = useState(0);
  const [image, setImage] = useState(0);
  const [show3d, setShow3d] = useState(false);
  const [scene, setScene] = useState(false);
  useEffect(()=>{if(new URLSearchParams(location.search).get("scene")==="school"){setShow3d(true);setScene(true)}},[]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [contact, setContact] = useState({
    name: "",
    email: "",
    company: "",
    note: "",
  });
  const [acknowledged, setAcknowledged] = useState(false);
  const [receipt, setReceipt] = useState<{
    reference: string;
    revision: number;
    projectId: string;
  } | null>(null);
  const submission = useRef<{ fingerprint: string; id: string } | null>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      let projects: PannaConfiguration[] = [];
      try {
        const raw = localStorage.getItem(storageKey);
        if (raw) projects = savedSchema.parse(JSON.parse(raw));
      } catch {
        setMessage(
          "Nie udało się odczytać zapisanych szkiców. Możesz przygotować nowy i pobrać kopię projektu.",
        );
      }
      let selected = projects[0] || newPannaConfiguration(crypto.randomUUID());
      const shared = new URLSearchParams(window.location.search).get("config");
      if (shared) {
        try {
          if (shared.length > 4000) throw new Error("Too large");
          selected = pannaConfigurationSchema.parse(JSON.parse(shared));
          setMessage(
            "Otworzono udostępniony szkic. Zapisz go w tej przeglądarce, aby do niego wrócić.",
          );
        } catch {
          setMessage(
            "Link projektu jest nieprawidłowy lub pochodzi z innej wersji. Otworzono lokalny szkic.",
          );
        }
      }
      setSaved(projects);
      setProject(selected);
      setReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);
  function update(patch: Partial<PannaConfiguration>) {
    setProject((p) => ({ ...p, ...patch, revision: p.revision + 1 }));
  }
  function save() {
    const parsed = pannaConfigurationSchema.safeParse(project);
    if (!parsed.success) {
      setMessage("Nadaj projektowi nazwę (maksymalnie 100 znaków).");
      return;
    }
    const next = [
      parsed.data,
      ...saved.filter((p) => p.id !== project.id),
    ].slice(0, 5);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
      setSaved(next);
      setMessage(
        "Zapisano szkic w tej przeglądarce. Dane kontaktowe nie są w nim zapisywane.",
      );
    } catch {
      setMessage(
        "Przeglądarka nie pozwoliła zapisać szkicu. Pobierz brief jako kopię.",
      );
    }
  }
  function download() {
    if (!pannaConfigurationSchema.safeParse(project).success) {
      setMessage("Uzupełnij nazwę projektu przed pobraniem.");
      return;
    }
    const blob = new Blob([pannaBrief(project)], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `GAMEFIELDS-Panna-Kids-r${project.revision}.txt`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setMessage(
      "Przygotowano brief do pobrania. Pobranie nie wysyła zapytania do GAMEFIELDS.",
    );
  }
  async function share() {
    if (!pannaConfigurationSchema.safeParse(project).success) {
      setMessage("Uzupełnij nazwę projektu przed udostępnieniem.");
      return;
    }
    const url = new URL(window.location.href);
    url.search = "";
    if (inquiryEndpoint === null) url.searchParams.set("view", "panna-kids");
    url.searchParams.set("config", JSON.stringify(project));
    try {
      await navigator.clipboard.writeText(url.href);
      setMessage(
        "Skopiowano link do tej wersji projektu. Zawiera preferencje i miasto; nie zawiera danych kontaktowych.",
      );
    } catch {
      setMessage(
        "Nie udało się skopiować linku. Pobierz brief lub spróbuj ponownie w bezpiecznym połączeniu HTTPS.",
      );
    }
  }
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!inquiryEndpoint || busy) return;
    const fingerprint = JSON.stringify({
      configuration: project,
      contact,
      acknowledged,
    });
    if (submission.current?.fingerprint !== fingerprint)
      submission.current = { fingerprint, id: crypto.randomUUID() };
    const parsed = pannaInquirySchema.safeParse({
      submissionId: submission.current.id,
      configuration: project,
      contact,
      acknowledged,
    });
    if (!parsed.success) {
      setInquiryMessage(
        "Uzupełnij nazwę projektu, miasto, imię, prawidłowy e-mail i potwierdzenie zakresu.",
      );
      return;
    }
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30_000);
    setBusy(true);
    setInquiryMessage("");
    try {
      const response = await fetch(inquiryEndpoint, {
        signal: controller.signal,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = await response.json();
      if (
        !response.ok ||
        data.ok !== true ||
        typeof data.reference !== "string"
      )
        throw new Error("Not stored");
      setReceipt({
        reference: data.reference,
        revision: project.revision,
        projectId: project.id,
      });
      setInquiryMessage(
        "Zapytanie zapisano w systemie GAMEFIELDS. To nie jest zamówienie ani zatwierdzona oferta. Potwierdzenie e-mail nie jest wysyłane automatycznie.",
      );
    } catch {
      setInquiryMessage(
        "Nie udało się potwierdzić zapisu zapytania. Spróbuj ponownie lub pobierz brief — szkic pozostaje na ekranie.",
      );
    } finally {
      clearTimeout(timeout);
      setBusy(false);
    }
  }
  const isSaved = saved.some(
    (p) => p.id === project.id && p.revision === project.revision,
  );
  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <a href={studioHref} className={styles.wordmark}>
          GAMEFIELDS<span>SPORT / SPACE / PLAY</span>
        </a>
        <nav aria-label="Nawigacja produktu">
          <a href="#konfigurator">Zaprojektuj</a>
          <a href="#proces">Jak to działa</a>
          <a href="/engineering/modular-3d">Studio modułowe ↗</a>
        </nav>
      </header>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>01 / KOLEKCJA GAMEFIELDS</p>
          <h1>
            Małe boisko.
            <br />
            Wielka gra.
          </h1>
          <p className={styles.intro}>
            Panna Kids. Zacznij od pomysłu na miejsce do gry. Dopasuj kierunek
            wizualny i opowiedz nam o swojej przestrzeni — wspólnie ustalimy
            finalny produkt.
          </p>
          <a className={styles.primary} href="#konfigurator">
            Zaprojektuj Panna Kids <span>↘</span>
          </a>
          <p className={styles.quiet}>
            Indywidualna wycena · bez składania zamówienia
          </p>
        </div>
        <figure className={styles.heroImage}>
          <img
            src={`${assetBase}/perspective.webp`}
            alt="Render dostarczonego modelu Panna Kids, widok perspektywiczny"
            fetchPriority="high"
            width={1400}
            height={1100}
          />
          <figcaption>PANNA KIDS / RENDER MODELU BAZOWEGO</figcaption>
        </figure>
      </section>
      <section id="konfigurator" className={styles.configurator}>
        <div className={styles.sectionHeading}>
          <div>
            <p className={styles.eyebrow}>TWOJE MIEJSCE DO GRY</p>
            <h2>Twoje Panna Kids.</h2>
          </div>
          <span>Preferencje do wyceny / nie projekt produkcyjny</span>
        </div>
        <div className={styles.workspace}>
          <div className={styles.preview}>
            <figure>
              {show3d ? (
                <div className={styles.modelFrame}>
                  <GlbViewer
                    url={`${assetBase}/panna-kids.glb`}
                    backgroundUrl={scene ? `${backgroundBase}/panna-kids-school.png` : undefined}
                    panelColor={
                      project.color === "undecided"
                        ? undefined
                        : colorPreferences.find((c) => c.id === project.color)
                            ?.hex
                    }
                  />
                </div>
              ) : (
                <img
                  src={`${assetBase}/${imageViews[image].file}`}
                  width={1400}
                  height={1100}
                  alt={`Panna Kids — ${imageViews[image].label}, render modelu bazowego`}
                />
              )}
              <figcaption>
                {scene && show3d ? "Sceneria koncepcyjna — stałe ujęcie. " : ""}Oryginalna geometria modelu. Kolor paneli zmienia się w
                podglądzie 3D; rendery pozostają bazowe. Wykończenia i
                nawierzchnia wymagają potwierdzenia.
              </figcaption>
            </figure>
            <div className={styles.views} aria-label="Widok produktu">
              <button type="button" aria-pressed={show3d && scene} onClick={()=>{setShow3d(true);setScene(true)}}>Na dziedzińcu</button>
              {imageViews.map((v, i) => (
                <button
                  type="button"
                  key={v.file}
                  aria-pressed={!show3d && image === i}
                  onClick={() => {
                    setShow3d(false);
                    setImage(i);
                  }}
                >
                  {v.label}
                </button>
              ))}
              <button
                type="button"
                aria-pressed={show3d && !scene}
                onClick={() => {setShow3d(true);setScene(false)}}
              >
                Obróć model 3D
              </button>
            </div>
            <div className={styles.previewMeta}>
              <span>PANNA KIDS / WARIANT BAZOWY</span>
              <span>OBWIEDNIA ≈ 6,00 × 6,62 × 1,52 m</span>
            </div>
            <p className={styles.quiet}>
              Na tym etapie nie zmieniamy rozmiaru ani liczby modułów. Najpierw
              potwierdzimy dokumentację i reguły połączeń tego produktu.
            </p>
            <details className={styles.inventory}>
              <summary>Dane odczytane z naszego modelu</summary>
              <p className={styles.quiet}>
                Obwiednia zawiera wystające elementy; nie jest wymiarem pola
                gry. {pannaKidsEvidence.meshCount} meshów to części geometrii,
                nie liczba modułów handlowych.
              </p>
              <dl className={styles.summary}>
                {pannaKidsEvidence.inventory.map((row) => (
                  <div key={row.family}>
                    <dt>
                      {row.family} / {row.label}
                    </dt>
                    <dd>{row.quantity} zespołów źródłowych</dd>
                  </div>
                ))}
              </dl>
              <p className={styles.quiet}>
                Inwentarz odczytany z nazw w modelu, nie zatwierdzony BOM.
                Metadane blach wskazują 2 mm; nazwa materiału ramy mówi o stali
                malowanej proszkowo. Nie potwierdzają atestu, masy, trwałości
                ani nośności.
              </p>
            </details>
          </div>
          <section
            className={styles.panel}
            aria-label="Konfiguracja Panna Kids"
          >
            <nav className={styles.steps} aria-label="Etapy konfiguracji">
              {steps.map((s, i) => (
                <button
                  type="button"
                  key={s}
                  aria-current={step === i ? "step" : undefined}
                  onClick={() => setStep(i)}
                >
                  {String(i + 1).padStart(2, "0")}
                  <span>{s}</span>
                </button>
              ))}
            </nav>
            <div className={styles.priceTarget}>
              <span>ROBOCZY CEL / KONSTRUKCJA</span>
              <strong>{pannaTargetLabel}</strong>
              <small>
                Budżet orientacyjny · niezatwierdzony. Dodatki i realizacja do
                osobnej wyceny.
              </small>
            </div>
            <fieldset disabled={!ready || busy} className={styles.fields}>
              <legend className={styles.srOnly}>Preferencje Panna Kids</legend>
              {step === 0 && (
                <>
                  <p className={styles.eyebrow}>01 / PRODUKT</p>
                  <h3>Jeden punkt wyjścia.</h3>
                  <p>
                    Pracujemy na dostarczonym modelu Panna Kids. Przygotuj szkic
                    preferencji; potwierdzimy jego wykonalność przed ofertą.
                  </p>
                  <label>
                    Nazwa projektu
                    <input
                      maxLength={100}
                      value={project.name}
                      onChange={(e) => update({ name: e.target.value })}
                    />
                  </label>
                  <div className={styles.fact}>
                    <span>Rozmiar</span>
                    <strong>Wariant bazowy</strong>
                    <small>
                      Obwiednia geometrii 6,002 × 6,623 × 1,516 m. Pole gry i
                      dokumentacja produkcyjna do potwierdzenia.
                    </small>
                  </div>
                </>
              )}
              {step === 1 && (
                <>
                  <p className={styles.eyebrow}>02 / WYGLĄD</p>
                  <h3>Wybierz kierunek.</h3>
                  <p>
                    To inspiracje do rozmowy, nie potwierdzony katalog
                    wykończeń.
                  </p>
                  <div className={styles.swatches}>
                    {colorPreferences.map((c) => (
                      <button
                        type="button"
                        key={c.id}
                        aria-pressed={project.color === c.id}
                        onClick={() => update({ color: c.id })}
                      >
                        <i style={{ background: c.hex }} />
                        {c.name}
                      </button>
                    ))}
                  </div>
                  <label>
                    Preferencja nawierzchni
                    <select
                      value={project.surface}
                      onChange={(e) =>
                        update({
                          surface: e.target
                            .value as PannaConfiguration["surface"],
                        })
                      }
                    >
                      {surfacePreferences.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </>
              )}
              {step === 2 && (
                <>
                  <p className={styles.eyebrow}>03 / ZAKRES</p>
                  <h3>Co mamy przygotować?</h3>
                  <label className={styles.check}>
                    <input
                      type="checkbox"
                      checked={project.branding}
                      onChange={(e) => update({ branding: e.target.checked })}
                    />
                    Chcę omówić branding / oznaczenia
                  </label>
                  <label>
                    Montaż
                    <select
                      aria-label="Montaż"
                      value={project.installation}
                      onChange={(e) =>
                        update({
                          installation: e.target
                            .value as PannaConfiguration["installation"],
                        })
                      }
                    >
                      <option value="undecided">Ustalmy wspólnie</option>
                      <option value="request">Poproszę o wycenę montażu</option>
                      <option value="own">Chcę omówić montaż własny</option>
                    </select>
                  </label>
                  <p>
                    Transport, przygotowanie terenu i sposób posadowienia
                    ustalimy osobno. Nie doliczamy niepotwierdzonych cen.
                  </p>
                </>
              )}
              {step === 3 && (
                <>
                  <p className={styles.eyebrow}>04 / MIEJSCE</p>
                  <h3>Gdzie zacznie się gra?</h3>
                  <label>
                    Miasto realizacji
                    <input
                      maxLength={120}
                      autoComplete="address-level2"
                      value={project.city}
                      onChange={(e) => update({ city: e.target.value })}
                    />
                  </label>
                  <label>
                    Stan miejsca
                    <select
                      value={project.site}
                      onChange={(e) =>
                        update({
                          site: e.target.value as PannaConfiguration["site"],
                        })
                      }
                    >
                      <option value="to-check">Potrzebuję oceny terenu</option>
                      <option value="existing">Istniejąca przestrzeń</option>
                      <option value="new">Nowy teren</option>
                    </select>
                  </label>
                  <label>
                    Preferowany miesiąc — opcjonalnie
                    <input
                      type="month"
                      value={project.desiredMonth}
                      onChange={(e) => update({ desiredMonth: e.target.value })}
                    />
                  </label>
                  <p>
                    Preferowana data nie jest potwierdzeniem terminu. Nie
                    wymagamy od Ciebie danych geotechnicznych ani obliczeń.
                  </p>
                </>
              )}
              {step === 4 && (
                <>
                  <p className={styles.eyebrow}>05 / TWÓJ SZKIC</p>
                  <h3>Gotowi do rozmowy.</h3>
                  <dl className={styles.summary}>
                    {pannaSummary(project)
                      .filter(([k]) => k !== "Wersja")
                      .map(([k, v]) => (
                        <div key={k}>
                          <dt>{k}</dt>
                          <dd>{v}</dd>
                        </div>
                      ))}
                  </dl>
                  <p>
                    Finalny zakres, cena, termin i zgodność techniczna wymagają
                    potwierdzenia. Przed realizacją wymagana jest weryfikacja
                    techniczna.
                  </p>
                </>
              )}
              <div className={styles.stepActions}>
                {step > 0 && (
                  <button type="button" onClick={() => setStep((s) => s - 1)}>
                    ← Wstecz
                  </button>
                )}
                {step < 4 ? (
                  <button
                    className={styles.primary}
                    type="button"
                    onClick={() => setStep((s) => s + 1)}
                  >
                    Dalej →
                  </button>
                ) : (
                  <a className={styles.primary} href="#zapytanie">
                    Przejdź do zapytania ↘
                  </a>
                )}
              </div>
              <div className={styles.saveActions}>
                <button type="button" onClick={save}>
                  Zapisz szkic
                </button>
                <button type="button" onClick={share}>
                  Udostępnij link
                </button>
                <button type="button" onClick={download}>
                  Pobierz brief
                </button>
              </div>
              <small>
                {isSaved
                  ? "Ta wersja jest zapisana w tej przeglądarce."
                  : "Ta wersja ma niezapisane zmiany."}{" "}
                Wersja {project.revision}. Zapis lokalny nie jest kontem
                klienta.
              </small>
            </fieldset>
          </section>
        </div>
        <p className={styles.status} role="status" aria-live="polite">
          {message ||
            "Szkic preferencji nie jest ofertą handlową ani zamówieniem."}
        </p>
        {saved.length > 0 && (
          <section className={styles.saved}>
            <h3>Moje szkice w tej przeglądarce</h3>
            {saved.map((p) => (
              <button
                type="button"
                disabled={busy}
                key={p.id}
                onClick={() => {
                  setProject(p);
                  setStep(4);
                  setMessage("Otworzono zapisany szkic.");
                }}
              >
                {p.name} <span>wersja {p.revision} ↗</span>
              </button>
            ))}
            <button
              type="button"
              disabled={!ready || busy}
              onClick={() => {
                setProject(newPannaConfiguration(crypto.randomUUID()));
                setStep(0);
                setReceipt(null);
              }}
            >
              + Nowy szkic
            </button>
          </section>
        )}
      </section>
      <section className={styles.process} id="proces">
        <p className={styles.eyebrow}>OD POMYSŁU DO REALIZACJI</p>
        <h2>
          Prosty początek.
          <br />
          Przemyślany proces.
        </h2>
        <div>
          {[
            ["01", "Twój szkic", "Wybierasz preferencje i opisujesz miejsce."],
            [
              "02",
              "Potwierdzenie zakresu",
              "Ustalamy produkt, teren, możliwości i wycenę.",
            ],
            [
              "03",
              "Projekt i realizacja",
              "Dopiero po akceptacji oferty i wymaganej weryfikacji technicznej.",
            ],
          ].map(([n, h, p]) => (
            <article key={n}>
              <span>{n}</span>
              <h3>{h}</h3>
              <p>{p}</p>
            </article>
          ))}
        </div>
      </section>
      <section className={styles.inquiry} id="zapytanie">
        <div>
          <p className={styles.eyebrow}>NASTĘPNY KROK</p>
          <h2>
            Porozmawiajmy
            <br />o Twoim miejscu.
          </h2>
          <p>
            Przygotujemy zakres rozmowy na podstawie tej konkretnej wersji Panna
            Kids.
          </p>
          <div className={styles.priceTarget}>
            <span>ROBOCZY CEL CENOWY / KONSTRUKCJA</span>
            <strong>{pannaTargetLabel}</strong>
            <small>Budżet orientacyjny · propozycja niezatwierdzona</small>
            <p>
              Nie jest ceną katalogową ani ofertą. Bez nawierzchni,
              przygotowania terenu, transportu, montażu i opracowania projektu.
              Koszty wykonania wymagają sprawdzenia; finalna cena do
              indywidualnej wyceny.
            </p>
          </div>
        </div>
        {inquiryEndpoint ? (
          <form onSubmit={submit}>
            <p role="status" aria-live="polite">
              {inquiryMessage}
            </p>
            <fieldset disabled={!ready || busy}>
              <legend className={styles.srOnly}>Dane do zapytania</legend>
              <label>
                Imię i nazwisko
                <input
                  required
                  minLength={2}
                  maxLength={120}
                  autoComplete="name"
                  value={contact.name}
                  onChange={(e) =>
                    setContact({ ...contact, name: e.target.value })
                  }
                />
              </label>
              <label>
                E-mail
                <input
                  required
                  type="email"
                  maxLength={254}
                  autoComplete="email"
                  value={contact.email}
                  onChange={(e) =>
                    setContact({ ...contact, email: e.target.value })
                  }
                />
              </label>
              <label>
                Organizacja — opcjonalnie
                <input
                  maxLength={160}
                  autoComplete="organization"
                  value={contact.company}
                  onChange={(e) =>
                    setContact({ ...contact, company: e.target.value })
                  }
                />
              </label>
              <label>
                Co warto wiedzieć? — opcjonalnie
                <textarea
                  maxLength={2000}
                  rows={3}
                  value={contact.note}
                  onChange={(e) =>
                    setContact({ ...contact, note: e.target.value })
                  }
                />
              </label>
              <label className={styles.check}>
                <input
                  type="checkbox"
                  required
                  checked={acknowledged}
                  onChange={(e) => setAcknowledged(e.target.checked)}
                />
                Rozumiem, że wysyłam preferencje do wyceny, a nie zamówienie.
              </label>
              <p className={styles.quiet}>
                Miasto uzupełnisz w kroku „Miejsce”. Dane kontaktowe służą
                obsłudze zapytania; nie trafiają do zapisanego szkicu ani
                udostępnianego linku.
              </p>
              {project.city.trim().length < 2 && (
                <p>
                  <a href="#konfigurator" onClick={() => setStep(3)}>
                    Uzupełnij miasto w kroku „Miejsce” ↗
                  </a>
                </p>
              )}
              <button className={styles.primary} type="submit">
                {busy
                  ? "Zapisywanie zapytania…"
                  : "Wyślij zapytanie o ofertę →"}
              </button>
            </fieldset>
            {receipt?.projectId === project.id && (
              <div className={styles.receipt} role="status">
                <strong>Zapytanie przyjęte</strong>
                <p>Numer: {receipt.reference}</p>
                <p>
                  Dotyczy wersji {receipt.revision}. Późniejsze zmiany szkicu
                  nie zmieniają przyjętego zapytania.
                </p>
              </div>
            )}
          </form>
        ) : (
          <div className={styles.staticNotice}>
            <h3>Przygotuj brief do rozmowy.</h3>
            <p>
              Ten publiczny podgląd nie wysyła formularzy i nie zapisuje zapytań
              na serwerze. Pobierz podsumowanie i przekaż je swojemu opiekunowi
              GAMEFIELDS.
            </p>
            <button
              className={styles.primary}
              type="button"
              disabled={!ready}
              onClick={download}
            >
              Pobierz brief do wyceny ↗
            </button>
            <p>
              <a
                href="https://gamefields.eu/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Kontakt z GAMEFIELDS ↗
              </a>
            </p>
            <p className={styles.quiet}>
              Plik zawiera preferencje projektu, bez modelu 3D i danych
              kontaktowych.
            </p>
          </div>
        )}
      </section>
      <footer className={styles.footer}>
        <strong>GAMEFIELDS / PANNA KIDS</strong>
        <a href={studioHref}>Studio i pozostałe funkcje ↗</a>
        <span>Produkt i warunki realizacji do potwierdzenia.</span>
      </footer>
    </main>
  );
}
