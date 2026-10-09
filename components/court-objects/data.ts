export const palettes = [
  { name: "Night Game", colors: ["#152750", "#3560ed", "#f1ead7"] },
  { name: "Clay", colors: ["#b95339", "#652c38", "#f5e6ca"] },
  { name: "Concrete", colors: ["#777d79", "#e4ec38", "#fffef5"] },
  { name: "Forest", colors: ["#123f35", "#c9e957", "#efeed9"] },
  { name: "Heatwave", colors: ["#f16963", "#78dfe1", "#f9cbd4"] },
  { name: "Varsity", colors: ["#ece4d2", "#7c283b", "#172d51"] },
  { name: "Signal Blue", colors: ["#163bbd", "#fa642d", "#f1ead7"] },
];
export const sports = ["Basketball", "Football", "Tennis", "Multi"] as const;
export const layouts = [
  "Centre study",
  "The corner",
  "Inside the arc",
  "Cross court",
  "Off centre",
  "Full tilt",
];
export const formats = ["50 × 70", "70 × 100", "100 × 140"];
export const materials = [
  { name: "Fine Art Print", detail: "Archival paper · 310 gsm", extra: 0 },
  { name: "Framed Print", detail: "Solid oak · gallery finish", extra: 250 },
  {
    name: "Aluminium Panel",
    detail: "Sharp edges · frameless · 3 mm",
    extra: 450,
  },
  {
    name: "Court Surface Edition",
    detail: "Tactile pigment · limited edition",
    extra: 900,
  },
];
export type Design = {
  id: string;
  sport: (typeof sports)[number];
  palette: number;
  layout: number;
  scale: number;
  x: number;
  y: number;
  rotation: number;
  label: boolean;
  texture: boolean;
  name: string;
  city: string;
  coordinates: string;
  year: string;
  number: string;
  format: number;
  material: number;
};
export const initialDesign: Design = {
  id: "GF-052",
  sport: "Football",
  palette: 6,
  layout: 0,
  scale: 100,
  x: 0,
  y: 0,
  rotation: 0,
  label: false,
  texture: true,
  name: "COURT 052",
  city: "WARSAW, POLAND",
  coordinates: "52.2297° N / 21.0122° E",
  year: "2026",
  number: "052",
  format: 1,
  material: 2,
};
export const priceOf = (d: Design) =>
  [249, 349, 499][d.format] + materials[d.material].extra;
export const money = (n: number) =>
  new Intl.NumberFormat("pl-PL").format(n) + " PLN";
