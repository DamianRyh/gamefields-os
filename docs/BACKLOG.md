## 2026-10-26 — Warsztat Gamefields, struktura i homepage wdrożone

Rewizja WordPress 4163: #warsztat przed współpracą Warsaw FC; kategoria 643 na zaakceptowane prace, CF7 4159 na zgłoszenie projektu JSON/TXT + podgląd, pseudonim, prywatny e-mail i osobna zgoda na publikację. Odczyt 10 najnowszych publikacji z datą i plikiem; starsze wpisy pozostają. Galeria rzeczywiście pusta, bez fikcyjnych klientów. Workflow: zgłoszenie e-mailem → ręczna weryfikacja → publikacja wpisu przez właściciela. To nie automatyczny zapis w chmurze ani bazodanowe przechowywanie zgłoszeń. Dokładne kolory przez pobranie/import pliku; link „Stwórz podobny” przenosi obsługiwane parametry modelu/wzoru/palety. Instrukcja: `integrations/wordpress/homepage/premium-2026-10-26/MODERACJA_WARSZTATU.md`. Testy draft/live 390/1440 (empty/10 fixtures/date/error/retry/form) PASS; żadnego zgłoszenia nie wysłano, doręczenia poczty nie potwierdzano. Cofnięcie sekcji: rewizja 4158; opublikowane prace moderowane osobno.

## 2026-10-26 — współpraca Warsaw FC × RTOA SYSTEMS na homepage, wdrożone

WordPress 3462, rewizja 4158. Sekcja #projekty zastępuje ogólną ilustrację prezentacją pierwszej współpracy Gamefields z klubem Warsaw FC i designerem RTOA SYSTEMS (Maciej Szewczyk). Cztery plansze właściciela: WP 4151–4154. Czytelne autorstwo i opis koncepcji pod mostem Łazienkowskim; bez twierdzenia o zrealizowanym obiekcie. Galeria w tej samej sekcji, powiększanie oryginałów i kontakt dla instytucji/artystów. Źródło `integrations/wordpress/homepage/premium-2026-10-26/collaboration.html`; test draft/live 390/768/1440 PASS, bez błędów JS i overflow. Zachowano modele i 12 ofert nawierzchni. Poprzednia stabilna rewizja: 4147.

## 2026-10-26 — zdjęcia i filmy modeli na stronie głównej, wdrożone

WordPress 3462 rewizja 4147: nowe materiały właściciela przypisano wizualnie do Panna Play i Panna Court, bez przypisywania zdjęć do innych konstrukcji. Monochromatyczny render przechodzi w kolor po hover/fokusie/dotyku, film H.264 MOV ładuje się dopiero przy interakcji i pauzuje po opuszczeniu. Zdjęcia oraz filmy w istniejących szczegółach modelu; 8 modeli i kolejność Panna/Street Arena 15 na końcu zachowane. Uwzględniono reduced motion, natywne sterowanie filmem i fallback oryginalnego pliku. Testy draft oraz live 390/1440: PASS, bez błędów JS. Źródło i mapping ID: `integrations/wordpress/homepage/premium-2026-10-26/model-media.json`; `verify-model-media.mjs`. Pozostałe nagrania galerii wymagają szerszej kontroli urządzeń; domyślne filmy hover zostały sprawdzone. Przywracanie: rewizja 4111.

## 2026-10-26 — oferta projektów nawierzchni, wdrożone

Studio v105: 12 projektów Signature jako pierwsza karuzela Nawierzchnia → Wzór; następnie 25 kierunków i 12 wariantów w tym samym panelu, bez nowego okna. Wybór zachowuje konstrukcję, sport i obiekty; obsługuje cofanie. Oferta główna: 12 samodzielnych nawierzchni, odpowiadające im wizualizacje w parku na hover/fokus/przycisk dotykowy i dokładne linki do projektu. Źródła witryny: `integrations/wordpress/homepage/premium-2026-10-26`; mirror Studia: `integrations/studio/canvas-editor`. Wersja 105, źródło Sites `1fb829c56aaea1cd3eb15618f5543e5012549e65`, wdrożenie `appgdep_6adf92fb2f9881919793560dfd9c619a` succeeded. WordPress rewizja 4111. TSC, test:studio, build, test:mobile, preset/undo/link 390/1440 oraz publiczne Studio i homepage: PASS. Nie wysłano formularza. Wizualizacje są koncepcyjne. Priorytet modeli Panna i Street Arena 15 na końcu zachowany.

## 2026-10-26 — nowa strona główna z Figmy

Wdrożono nową homepage na https://www.gamefields.eu/ (WordPress 3462): wybór konstrukcji, katalog 8 modeli, osobne nawierzchnie, kolekcje, powiększenie materiałów i 3D ładowane po kliknięciu. Formularz CF7 i przekazywanie projektu ze Studio zachowane. Testy 375/390/430/768/1440 px oraz publicznej strony 390/1440 px przeszły. Źródła i rollback: `integrations/wordpress/homepage/premium-2026-10-26/README.md`; poprzednia rewizja WP 4098, nowa 4104. GitHub nie publikuje automatycznie WordPressa.

# Gamefields backlog

Updated: 2026-10-04

## P0 — current Studio iteration

- Validate the three Basketball 3×3 realistic previews at desktop and mobile breakpoints.
- Open a focused PR for `feat/studio-multisport-realistic-previews`, run full CI and publish after approval.

Acceptance: selecting Basketball 3×3 and then Organic Flow, Urban Contrast or Classic Lines updates the realistic image immediately; switching back to Street Football restores its own imagery; unsupported sports never display the wrong court.

## P1 — Studio workflow

- Build the automated realistic compositor: neutral scene per sport, calibrated court mask and homography, Canvas/WebGL texture layer, sport lines/equipment above the graphic.
- Add Tennis and Padel as the next calibrated scenes, each starting with three dominant color directions.
- Extend realistic preview coverage to the highest-value Signature presets after the compositor is stable.
- Add location context so visualization surroundings can reflect park, school, housing estate or club.
- Add comparison mode for two selected directions using the same camera and location.
- Persist selected visualization context with the Builder project.

## P1 — platform integration

- Complete and verify the WordPress MU-plugin installation through hosting access.
- Move the canonical public experience to `gamefields.eu/play` with same-origin auth.
- Merge or rebase PR #13 only after its CI and product review are complete.

## P2 — quality

- Add a Studio-specific browser test for sport/direction/image mapping and cached switching.
- Add image asset budgets and automated checks for dimensions, format and maximum size.
- Validate accessibility labels and keyboard selection across the full guided workflow.
