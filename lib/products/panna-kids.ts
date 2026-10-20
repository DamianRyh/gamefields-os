import { z } from "zod";
import evidence from "./panna-kids-evidence.json";
export { evidence as pannaKidsEvidence };
export const PANNA_KIDS_TARGET = {
  priceNetPln: 24900,
  sourceStatus: "BUDGETARY_DEFAULT",
  approved: false,
  targetGrossMarginPct: 30,
  maximumAllInCostNetPln: 17430,
  confirmedCostNetPln: null,
} as const;

export const pannaTargetLabel =
  new Intl.NumberFormat("pl-PL", { maximumFractionDigits: 0 }).format(
    PANNA_KIDS_TARGET.priceNetPln,
  ) + " zł netto";

// Source geometry is evidence of appearance, not a manufacturing specification.
export const PANNA_KIDS = {
  id: "panna-kids",
  name: "Panna Play",
  catalogueVersion: 1,
  dimensionsM: null,
  priceNetPln: null,
  productionStatus: "UNCONFIRMED",
  engineeringApproval: "REQUIRED",
} as const;

export const colorPreferences = [
  { id: "undecided", name: "Dobierzmy razem", hex: "#c6c4bb" },
  { id: "graphite", name: "Grafit", hex: "#333b3b" },
  { id: "chalk", name: "Ciepła biel", hex: "#e8e4d8" },
  { id: "blue", name: "Głęboki niebieski", hex: "#2544a0" },
] as const;
export const surfacePreferences = [
  { id: "undecided", name: "Potrzebuję rekomendacji" },
  { id: "existing", name: "Mam istniejącą nawierzchnię" },
  { id: "epdm", name: "Chcę omówić EPDM" },
  { id: "modules", name: "Chcę omówić nawierzchnię modułową" },
] as const;
export const pannaConfigurationSchema = z
  .object({
    schemaVersion: z.literal(1),
    catalogueVersion: z.literal(1),
    productId: z.literal("panna-kids"),
    id: z.string().uuid(),
    revision: z.number().int().min(1).max(1_000_000),
    name: z.string().trim().min(1).max(100),
    color: z.enum(["undecided", "graphite", "chalk", "blue"]),
    surface: z.enum(["undecided", "existing", "epdm", "modules"]),
    branding: z.boolean(),
    installation: z.enum(["undecided", "request", "own"]),
    city: z.string().trim().max(120),
    site: z.enum(["to-check", "existing", "new"]),
    desiredMonth: z.string().regex(/^(|\d{4}-(0[1-9]|1[0-2]))$/),
  })
  .strict();
export type PannaConfiguration = z.infer<typeof pannaConfigurationSchema>;
export const pannaInquirySchema = z
  .object({
    submissionId: z.string().uuid(),
    configuration: pannaConfigurationSchema.extend({
      city: z.string().trim().min(2).max(120),
    }),
    contact: z
      .object({
        name: z.string().trim().min(2).max(120),
        email: z.string().trim().email().max(254),
        company: z.string().trim().max(160),
        note: z.string().trim().max(2000),
      })
      .strict(),
    acknowledged: z.literal(true),
  })
  .strict();
export function newPannaConfiguration(id: string): PannaConfiguration {
  return {
    schemaVersion: 1,
    catalogueVersion: 1,
    productId: "panna-kids",
    id,
    revision: 1,
    name: "Moje Panna Play",
    color: "undecided",
    surface: "undecided",
    branding: false,
    installation: "undecided",
    city: "",
    site: "to-check",
    desiredMonth: "",
  };
}
export function pannaSummary(c: PannaConfiguration) {
  return [
    ["Produkt", PANNA_KIDS.name],
    ["Projekt", c.name],
    ["Wersja", `${c.id} / ${c.revision}`],
    ["Rozmiar", "Wariant bazowy — wymiary do potwierdzenia"],
    [
      "Kolor — preferencja",
      colorPreferences.find((p) => p.id === c.color)!.name,
    ],
    [
      "Nawierzchnia — preferencja",
      surfacePreferences.find((p) => p.id === c.surface)!.name,
    ],
    ["Branding", c.branding ? "Prośba o wycenę brandingu" : "Bez brandingu"],
    [
      "Montaż",
      {
        undecided: "Do ustalenia",
        request: "Prośba o wycenę montażu",
        own: "Chcę omówić montaż własny",
      }[c.installation],
    ],
    ["Lokalizacja", c.city || "Do ustalenia"],
    [
      "Teren",
      {
        "to-check": "Do sprawdzenia",
        existing: "Istniejąca przestrzeń",
        new: "Nowy teren",
      }[c.site],
    ],
    [
      "Preferowany miesiąc",
      c.desiredMonth || "Do ustalenia — brak potwierdzonego terminu",
    ],
    [
      "Obwiednia modelu / nie pole gry",
      "6,002 × 6,623 × 1,516 m — pomiar geometrii",
    ],
    [
      "Roboczy cel cenowy",
      `${pannaTargetLabel} za konstrukcję / BUDGETARY_DEFAULT — niezatwierdzony`,
    ],
    ["Cena końcowa", "Do indywidualnej wyceny — brak potwierdzonego cennika"],
  ] as const;
}
export function pannaBrief(c: PannaConfiguration) {
  return (
    "GAMEFIELDS / PANNA KIDS\nBRIEF DO WYCENY — NIE JEST ZAMÓWIENIEM\n\n" +
    pannaSummary(c)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n") +
    "\n\nWybrane kolory, nawierzchnia i usługi są preferencjami do potwierdzenia.\nZakres do ustalenia: konstrukcja, nawierzchnia, przygotowanie terenu, transport i montaż.\nBrak zatwierdzonego BOM i obliczeń konstrukcyjnych. Engineer Gate: wymagana weryfikacja, bez auto-approve.\n"
  );
}
