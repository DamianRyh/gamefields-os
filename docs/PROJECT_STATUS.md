## 2026-10-26 — oferta projektów nawierzchni, wdrożone

Studio v105: 12 projektów Signature jako pierwsza karuzela Nawierzchnia → Wzór; następnie 25 kierunków i 12 wariantów w tym samym panelu, bez nowego okna. Wybór zachowuje konstrukcję, sport i obiekty; obsługuje cofanie. Oferta główna: 12 samodzielnych nawierzchni, odpowiadające im wizualizacje w parku na hover/fokus/przycisk dotykowy i dokładne linki do projektu. Źródła witryny: `integrations/wordpress/homepage/premium-2026-10-26`; mirror Studia: `integrations/studio/canvas-editor`. Wersja 105, źródło Sites `1fb829c56aaea1cd3eb15618f5543e5012549e65`, wdrożenie `appgdep_6adf92fb2f9881919793560dfd9c619a` succeeded. WordPress rewizja 4111. TSC, test:studio, build, test:mobile, preset/undo/link 390/1440 oraz publiczne Studio i homepage: PASS. Nie wysłano formularza. Wizualizacje są koncepcyjne. Priorytet modeli Panna i Street Arena 15 na końcu zachowany.

## 2026-10-26 — nowa strona główna z Figmy

Wdrożono nową homepage na https://www.gamefields.eu/ (WordPress 3462): wybór konstrukcji, katalog 8 modeli, osobne nawierzchnie, kolekcje, powiększenie materiałów i 3D ładowane po kliknięciu. Formularz CF7 i przekazywanie projektu ze Studio zachowane. Testy 375/390/430/768/1440 px oraz publicznej strony 390/1440 px przeszły. Źródła i rollback: `integrations/wordpress/homepage/premium-2026-10-26/README.md`; poprzednia rewizja WP 4098, nowa 4104. GitHub nie publikuje automatycznie WordPressa.

# Gamefields project status

Updated: 2026-10-04

## Source and delivery

- `main` includes the live design-preview workflow from PR #24 at commit `d66d9ddf`.
- Open concurrent work: PR #13, Gamefields PLAY v0.13 community redesigns.
- Public Studio: `https://gamefields-studio.ryhfs90.chatgpt.site` (Sites version 14).
- Target public PLAY origin: `https://gamefields.eu/play`.
- WordPress MU gateway still requires hosting file-manager or SFTP installation when not already present.

## Current Studio work

- Branch: `feat/studio-multisport-realistic-previews`.
- Organic Flow, Urban Contrast and Classic Lines have dedicated realistic WebP previews for Street Football 3×3 and Basketball 3×3.
- Preview assets are preloaded and selected through a `sport × design` mapping, so switching stays instant and never shows imagery for the wrong sport.
- The plan/realistic toggle keeps the selected direction.
- Studio version 14 is published; the Basketball 3×3 extension is the current unpublished iteration.

## Known limitations

- Dedicated photorealistic previews currently cover two sports and three curated directions, not every sport or pattern-library combination.
- The next rendering architecture should use one clean realistic scene and perspective mask per sport, then composite colors and graphics client-side with Canvas/WebGL instead of storing every combination as a separate bitmap.
- Builder projects use account persistence where connected; JSON export remains the backup path.
