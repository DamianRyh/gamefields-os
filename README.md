## 2026-10-26 — oferta projektów nawierzchni, wdrożone

Studio v105: 12 projektów Signature jako pierwsza karuzela Nawierzchnia → Wzór; następnie 25 kierunków i 12 wariantów w tym samym panelu, bez nowego okna. Wybór zachowuje konstrukcję, sport i obiekty; obsługuje cofanie. Oferta główna: 12 samodzielnych nawierzchni, odpowiadające im wizualizacje w parku na hover/fokus/przycisk dotykowy i dokładne linki do projektu. Źródła witryny: `integrations/wordpress/homepage/premium-2026-10-26`; mirror Studia: `integrations/studio/canvas-editor`. Wersja 105, źródło Sites `1fb829c56aaea1cd3eb15618f5543e5012549e65`, wdrożenie `appgdep_6adf92fb2f9881919793560dfd9c619a` succeeded. WordPress rewizja 4111. TSC, test:studio, build, test:mobile, preset/undo/link 390/1440 oraz publiczne Studio i homepage: PASS. Nie wysłano formularza. Wizualizacje są koncepcyjne. Priorytet modeli Panna i Street Arena 15 na końcu zachowany.

## 2026-10-26 — nowa strona główna z Figmy

Wdrożono nową homepage na https://www.gamefields.eu/ (WordPress 3462): wybór konstrukcji, katalog 8 modeli, osobne nawierzchnie, kolekcje, powiększenie materiałów i 3D ładowane po kliknięciu. Formularz CF7 i przekazywanie projektu ze Studio zachowane. Testy 375/390/430/768/1440 px oraz publicznej strony 390/1440 px przeszły. Źródła i rollback: `integrations/wordpress/homepage/premium-2026-10-26/README.md`; poprzednia rewizja WP 4098, nowa 4104. GitHub nie publikuje automatycznie WordPressa.

# Gamefields OS

Street Football 15 × 10: `/products/street-football-15x10` or `?view=street-football-15x10` in the public static catalogue. Two-object GLB and Blender source: `public/products/street-football-15x10/`. Blank, independently recolorable panels and a separate 20 cm surface without markings. Test: `node tests/street-football-15x10.mjs` after `pnpm build:modular:review`.

Gamefields OS is the operating system and design environment behind Gamefields Studio.

## Gamefields Engineering v0.2

The repository contains an experimental **Gamefields Engineering** module at `/engineering`.

Current capabilities include parametric steel-court geometry, generated structural nodes and members, preliminary BOM, configurable pre-design wind/impact screening, serviceability screening, automatic SHS post-section optimization, and an analysis API at `POST /api/engineering/analyze`.

The calculation layer is intentionally marked **PRE-DESIGN**. It is not a certified Eurocode implementation and does not replace final structural calculations, connection/foundation design, or approval by an appropriately qualified structural engineer.

Technical scope and roadmap: [`docs/gamefields-engineering.md`](docs/gamefields-engineering.md).
