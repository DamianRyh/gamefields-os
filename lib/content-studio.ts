// Studio treści: wspólne definicje dla API i strony /tresci.

export const PILLARS = {
  realizacje: { name: "Realizacje od kuchni", target: 35 },
  wiedza: { name: "Wiedza dla decydentów", target: 25 },
  build: { name: "Build in public", target: 25 },
  kultura: { name: "Kultura gry", target: 15 },
} as const;

export const CHANNELS = {
  linkedin: "LinkedIn",
  film: "Krótki film",
  blog: "Blog",
  newsletter: "Newsletter",
} as const;

export const STATUSES = {
  pomysl: "Pomysł",
  szkic: "Szkic",
  zaplanowany: "Zaplanowany",
  opublikowany: "Opublikowany",
} as const;

export const METRICS = [
  ["wyswietlenia", "Wyświetl."],
  ["reakcje", "Reakcje"],
  ["komentarze", "Koment."],
  ["udostepnienia", "Udost."],
  ["klikniecia", "Kliknięcia"],
  ["zapytania", "Zapytania"],
] as const;

export type Pillar = keyof typeof PILLARS;
export type Channel = keyof typeof CHANNELS;
export type Status = keyof typeof STATUSES;
export type MetricKey = (typeof METRICS)[number][0];
export type Metrics = Partial<Record<MetricKey, number>>;

export type ContentPost = {
  id: string;
  title: string;
  pillar: Pillar;
  channel: Channel;
  status: Status;
  date: string | null;
  body: string;
  notes: string;
  url: string | null;
  metrics: Metrics;
  updatedAt: number;
};

export type ContentPostInput = Omit<ContentPost, "id" | "updatedAt">;

const has = <T extends object>(obj: T, key: unknown): key is keyof T =>
  typeof key === "string" && Object.prototype.hasOwnProperty.call(obj, key);

function cleanText(value: unknown, max: number) {
  return String(value ?? "").replace(/\0/g, "").slice(0, max);
}

export function parseMetrics(value: unknown): Metrics {
  const source = typeof value === "string" ? safeJson(value) : value;
  const out: Metrics = {};
  if (!source || typeof source !== "object") return out;
  for (const [key] of METRICS) {
    const raw = (source as Record<string, unknown>)[key];
    if (raw === null || raw === undefined || raw === "") continue;
    const n = Math.round(Number(raw));
    if (Number.isFinite(n) && n >= 0 && n <= 1_000_000_000) out[key] = n;
  }
  return out;
}

function safeJson(value: string) {
  try { return JSON.parse(value); } catch { return null; }
}

/** Waliduje dane z formularza. Rzuca kod błędu w stylu reszty API. */
export function validatePostInput(body: unknown): ContentPostInput {
  const b = (body && typeof body === "object" ? body : {}) as Record<string, unknown>;
  const title = cleanText(b.title, 200).trim();
  if (!title) throw new Error("TITLE_REQUIRED");
  if (!has(PILLARS, b.pillar)) throw new Error("INVALID_PILLAR");
  if (!has(CHANNELS, b.channel)) throw new Error("INVALID_CHANNEL");
  const status = b.status ?? "pomysl";
  if (!has(STATUSES, status)) throw new Error("INVALID_STATUS");
  let date: string | null = null;
  if (b.date) {
    date = String(b.date);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date + "T00:00:00Z"))) throw new Error("INVALID_DATE");
  }
  let url: string | null = null;
  if (b.url) {
    const parsed = new URL(String(b.url));
    if (parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.href.length > 500) throw new Error("INVALID_URL");
    url = parsed.href;
  }
  return {
    title,
    pillar: b.pillar,
    channel: b.channel,
    status,
    date,
    body: cleanText(b.body, 50_000),
    notes: cleanText(b.notes, 5_000),
    url,
    metrics: parseMetrics(b.metrics),
  };
}

/** Plan pierwszych 8 tygodni (od 30.11.2026) z dokumentu „Plan treści – marka osobista Gamefields”. */
export const EIGHT_WEEK_PLAN: Array<[string, Channel, Pillar, string]> = [
  ["2026-12-01", "linkedin", "realizacje", "Kim jestem i dlaczego buduję boiska (post otwierający)"],
  ["2026-12-02", "film", "realizacje", "Timelapse malowania linii"],
  ["2026-12-03", "linkedin", "build", "Jak powstał konfigurator 3D Gamefields"],
  ["2026-12-04", "film", "build", "Konfigurator w 30 sekund"],
  ["2026-12-05", "linkedin", "kultura", "Moje pierwsze boisko podwórkowe"],
  ["2026-12-07", "blog", "wiedza", "Renowacja czy nowe boisko: poradnik"],
  ["2026-12-08", "linkedin", "wiedza", "Renowacja czy nowe boisko: kiedy co się opłaca"],
  ["2026-12-09", "film", "realizacje", "Przed i po renowacji"],
  ["2026-12-10", "linkedin", "build", "Warsztat: każdy może opublikować projekt bez konta"],
  ["2026-12-11", "film", "kultura", "Klatka do panny w 3D"],
  ["2026-12-12", "linkedin", "kultura", "Czym jest panna i dlaczego rośnie"],
  ["2026-12-14", "blog", "wiedza", "Błędy przy zamawianiu boiska przez szkołę: poradnik"],
  ["2026-12-15", "linkedin", "wiedza", "5 błędów przy zamawianiu boiska przez szkołę"],
  ["2026-12-16", "film", "realizacje", "Dzień na budowie"],
  ["2026-12-17", "linkedin", "build", "Jedna osoba i agenci AI: jak wygląda mój dzień pracy"],
  ["2026-12-18", "film", "build", "Kulisy pracy z AI"],
  ["2026-12-19", "linkedin", "kultura", "Współpraca z Warsaw FC: jak się zaczęła"],
  ["2026-12-22", "linkedin", "realizacje", "Podsumowanie roku Gamefields w liczbach"],
  ["2026-12-23", "film", "realizacje", "Najlepsze ujęcia roku"],
  ["2026-12-29", "linkedin", "build", "Plany na 2027: co chcę zbudować"],
  ["2026-12-30", "film", "build", "Plany na 2027 w 30 sekund"],
  ["2026-12-31", "linkedin", "build", "Czego nauczyłem się, budując produkt z AI w 2026"],
  ["2027-01-02", "linkedin", "kultura", "Boisko, które zmieniło osiedle"],
  ["2027-01-02", "film", "realizacje", "Boisko zimą"],
  ["2027-01-04", "blog", "wiedza", "Jak gmina może sfinansować boisko"],
  ["2027-01-05", "linkedin", "wiedza", "Jak gmina może sfinansować boisko (programy, budżet obywatelski)"],
  ["2027-01-06", "film", "build", "Kolory boisk z Warsztatu"],
  ["2027-01-07", "linkedin", "build", "Liczby z Warsztatu: co ludzie projektują"],
  ["2027-01-08", "film", "kultura", "Trik z panny"],
  ["2027-01-09", "linkedin", "kultura", "Street football: zasady i kultura"],
  ["2027-01-11", "blog", "wiedza", "Nawierzchnia EPDM, trawa czy poliuretan: porównanie"],
  ["2027-01-12", "linkedin", "wiedza", "Nawierzchnia EPDM, trawa czy poliuretan: co wybrać"],
  ["2027-01-13", "film", "realizacje", "Test nawierzchni"],
  ["2027-01-14", "linkedin", "build", "Jak testuję i wdrażam zmiany na stronie (kulisy)"],
  ["2027-01-15", "film", "build", "Zmiana na żywo w Studio"],
  ["2027-01-16", "linkedin", "kultura", "Rodzice o boisku przy szkole"],
  ["2027-01-19", "linkedin", "wiedza", "Utrzymanie boiska po sezonie: checklista"],
  ["2027-01-20", "film", "build", "Twoje boisko w 3D w 60 sekund"],
  ["2027-01-21", "linkedin", "build", "Co dało mi 8 tygodni publikowania (szczerze)"],
  ["2027-01-22", "film", "kultura", "Podziękowanie dla społeczności"],
  ["2027-01-23", "linkedin", "build", "Zaproszenie: zaprojektuj swoje boisko w Studio"],
];
