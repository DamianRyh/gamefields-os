import fs from "node:fs";

const file = "app/play/court/page.tsx";
let source = fs.readFileSync(file, "utf8");

const importNeedle = 'import { useSearchParams } from "next/navigation";';
if (!source.includes(importNeedle)) throw new Error("Court redesign patch: import anchor missing");
if (source.includes('import CommunityRedesigns from "./community-redesigns";')) throw new Error("Court redesign patch: already imported");
source = source.replace(importNeedle, `${importNeedle}\nimport CommunityRedesigns from "./community-redesigns";`);

const endNeedle = '\n </main>;';
const end = source.lastIndexOf(endNeedle);
if (end < 0) throw new Error("Court redesign patch: page end missing");
if (source.includes('<CommunityRedesigns courtId={c.id}/>')) throw new Error("Court redesign patch: already mounted");
source = source.slice(0, end) + '\n  <CommunityRedesigns courtId={c.id}/>' + source.slice(end);

fs.writeFileSync(file, source);
console.log("Community redesigns mounted on Court page");
