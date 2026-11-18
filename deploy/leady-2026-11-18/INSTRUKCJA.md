# PACZKA DO WDROŻENIA — leady Gamefields, 18.11.2026

Wszystko jest gotowe. Niczego nie trzeba budować ani pisać — tylko wgrać w kolejności 1 → 2 → 3 → 4 (+ 5 w GA4).

| Folder w paczce | Co z nim zrobić |
|---|---|
| `1-motyw/gamefields-1.0.36.zip` | cały motyw 1.0.36: Wygląd → Motywy → Dodaj → Wyślij motyw → „Zastąp obecny” **albo** |
| `1-motyw/pliki/` | tylko 5 zmienionych plików, wgrane w te same miejsca w `wp-content/themes/gamefields/` (bezpieczniejsze, jeśli na serwerze są pliki spoza repo) |
| `2-formularz-cf7-3758/` | `python3 apply.py` (podgląd) → `python3 apply.py --apply`; **albo ręcznie w panelu CF7**: `szablon-formularza.txt` → zakładka Formularz (zastąp całość), `mail-1-dopisz.txt`, `mail-2-autoodpowiedz.txt`, `komunikat.txt` |
| `3-strona-glowna-3462/bloki/` | 4 bloki `wp:html` do podmiany na stronie 3462 (każdy w całości); `cala-strona-homepage.html` = pełna treść strony, gdyby prościej było podmienić całość |
| `4-studio/` | `studio.patch` (git apply na `main`) albo `zmienione-pliki.tgz` (rozpakuj w `integrations/studio/canvas-editor/`), potem build i publikacja Sites |

Szczegóły, kontrole i cofanie każdego kroku — poniżej. Ścieżki `integrations/...` odnoszą się do repo `damianryh/gamefields-os`, branch `claude/cool-gates-frk23j`; te same pliki są w tej paczce.

---

# Wdrożenie: leady „Wyślij zdjęcie placu” + Studio „Odbierz propozycję na maila” + Mapa możliwości

Repo: `damianryh/gamefields-os`, branch **`claude/cool-gates-frk23j`** (commity `c5058c5` … `da7ba28`, 6 commitów nad `main`).
Wszystko jest gotowe w kodzie i przetestowane lokalnie. Zadanie: wgrać na produkcję w podanej kolejności, z kopią przed każdym krokiem.

## Zasady
- Przed każdym krokiem zrób kopię tego, co jest na żywo (pliki motywu, właściwości formularza, treść strony 3462). Zapisz numer rewizji WordPressa.
- **Nie wysyłaj formularza na żywo** bez zgody właściciela (każde wysłanie to prawdziwy mail).
- Nie zmieniaj niczego poza listą poniżej. Jeśli coś na żywo różni się od repo w miejscu, które masz zmienić — zatrzymaj się i zapytaj.
- Kolejność 1 → 2 → 3 → 4. Każda wersja jest zgodna wstecz (stare Studio + nowy WordPress i odwrotnie działają), więc częściowe wdrożenie niczego nie psuje.

## Krok 1. Motyw Gamefields 1.0.35 → 1.0.36
Folder: `integrations/wordpress/theme/gamefields/`. Wgraj **tylko te 5 plików** (resztę motywu zostaw):
| Plik | Zmiana |
|---|---|
| `functions.php` | `GFT_VERSION` 1.0.36; ładowanie `gf-lead.css` i `gf-lead.js` na każdej stronie; funkcje `gft_photo_band_pages()` i `gft_photo_band()` |
| `header.php` | „Zapytanie” → „Wyślij zdjęcie” (`/kontakt/#zdjecie`); nowy link `.gf-photo-link` „Wyślij zdjęcie placu” przed „Studio 3D” |
| `footer.php` | `gft_photo_band()` przed zamknięciem `main`; przycisk w stopce „Wyślij zdjęcie placu” (`#zdjecie` na stronie głównej, `/kontakt/#zdjecie` gdzie indziej) |
| `assets/js/gf-lead.js` | NOWY |
| `assets/css/gf-lead.css` | NOWY |

`gamefields.zip` w repo jest nieaktualny od 1.0.30 — **nie wgrywaj go**. Wgraj pliki tak, jak wgrywano 1.0.33–1.0.35.

Sprawdź po wgraniu (390 i 1440 px, bez wysyłania):
- na każdej stronie ładuje się `/wp-content/themes/gamefields/assets/js/gf-lead.js?ver=1.0.36` i `gf-lead.css?ver=1.0.36`, brak błędów JS w konsoli;
- podstrony (np. `/realizacje-gamefields/`, `/wynajem-boisk-mobilnych/`, `/boiska-dla-szkol/`): nagłówek z fioletowym „Wyślij zdjęcie placu” od 1200 px, menu nie nachodzi na przyciski; fioletowy pas „Masz plac? Wyślij zdjęcie.” nad stopką; na 390 px przycisk „Wyślij zdjęcie” w jednej linii;
- na telefonie po przewinięciu pojawia się dolny przycisk „Wyślij zdjęcie placu” (nie na `/kontakt/`, `/studio/`, koszyku, zamówieniu);
- `/kontakt/` i `/studio/` działają jak przed zmianą (kroki formularza, ścieżki „Kim jesteś?”).
Cofnięcie: przywróć 5 plików z kopii (lub `GFT_VERSION` 1.0.35 i usuń dwa nowe pliki).

## Krok 2. Formularz Contact Form 7 3758 („a71dc3a”)
Folder: `integrations/wordpress/forms/cf7-3758/` — opis w `README.md`.
```
cd integrations/wordpress/forms/cf7-3758
python3 apply.py            # odczyt na żywo + backup-<czas>.json + różnice, NIC nie zapisuje
python3 apply.py --apply    # zapis przez REST CF7 i sprawdzenie
python3 apply.py --restore backup-<czas>.json   # cofnięcie
```
`apply.py` używa REST `https://www.gamefields.eu/wp-json/contact-form-7/v1/contact-forms/3758` (wymaga uwierzytelnienia administratora / hasła aplikacji).
Jeśli nie możesz uruchomić skryptu: w panelu CF7 wklej `form.html` jako szablon formularza i ręcznie zrób zmiany maili opisane niżej.

Co się zmienia (addytywnie — te same 3 kroki `data-gf-step` 0–2 i nazwy pól, ta sama skrzynka odbiorcy):
- formularz: do 3 zdjęć (`project-photo`, `project-photo-2`, `project-photo-3`, JPG/PNG/WebP ≤5 MB) na górze kroku „Miejsce” (`id="zdjecie"`); `place-type` (Gmina/Orlik/Szkoła/Park/Event/Inne); opis „Opisz miejsce i co chcesz osiągnąć”; nieobowiązkowa zgoda `[acceptance marketing-consent optional]`; ukryte `lead-source`, `project-link` i plik `project-render`;
- Mail 1: załączniki + `[project-photo-2] [project-photo-3] [project-render]`; temat + `· [place-type] · [lead-source]`; na końcu treści: typ miejsca, źródło, zgoda, link do konfiguracji;
- Mail 2 (NOWA autoodpowiedź do `[your-email]`): temat „Gamefields — mam Twoje zgłoszenie”, podsumowanie, „1–2 dni robocze”, link do konfiguracji, `Reply-To: info@gamefields.eu`, bez załączników, „Pomiń wiersze z pustymi tagami” włączone;
- komunikat po wysłaniu: „Dziękujemy. Damian odezwie się w ciągu 1–2 dni roboczych.”

Najpierw pokaż właścicielowi wynik `python3 apply.py` (różnice), dopiero potem `--apply`.
Sprawdź po wgraniu (bez wysyłania): na stronie głównej i `/kontakt/` krok „2. Miejsce” zaczyna się od strefy „Dodaj zdjęcia placu”; wybór 3 zdjęć daje 3 miniatury; duże zdjęcie z telefonu (>5 MB) zostaje przyjęte (zmniejsza się automatycznie); w kroku 3 jest checkbox zgody obok tekstu.
Jedno testowe wysłanie **tylko za zgodą właściciela** — wtedy sprawdź: mail z 1–3 zdjęciami, temat z typem miejsca, autoodpowiedź do nadawcy.

## Krok 3. Strona główna (strona 3462)
Folder: `integrations/wordpress/homepage/studio-2026-11/`, gotowe bloki w `bloki/` (każdy to jeden blok `wp:html` zaczynający się od `<!-- gf-blok: NAZWA -->`). Treść całej strony: `homepage.html` (23 bloki). Jeśli zmieniasz źródła, odbuduj: `python3 build.py`.

Zmienione bloki — podmień **tylko te**, każdy w całości:
| Blok | Zmiana |
|---|---|
| `01-styl` | style paska „Masz plac? Wyślij zdjęcie.” |
| `02-naglowek` | pasek pod hero z przyciskiem „Wybierz zdjęcie placu →”; w nagłówku „Wyślij zdjęcie” (telefon) i „Wyślij zdjęcie placu” (od 1200 px); w „Na skróty” „Wyślij zdjęcie / Odpisuję w 1–2 dni robocze” |
| `21-mozliwosci` | Mapa możliwości — **jest już na żywo jako ręcznie wklejony blok**: zastąp tamten blok tym (nie dodawaj drugiego; `id="mozliwosci"` ma wystąpić raz) |
| `22-kontakt` | tekst przy formularzu: „…Wyślij zdjęcie placu, odpiszę osobiście w ciągu 1–2 dni roboczych.” |
`23-skrypty` i pozostałe bloki — bez zmian (zmieniły się tylko numery plików).

Przed podmianą porównaj bloki na żywo z repo. Jeśli inny blok różni się od repo (ktoś zmienił go na serwerze), nie nadpisuj go.
Sprawdź (390 i 1440 px): „Wybierz zdjęcie placu →” od razu otwiera wybór zdjęć, a po wyborze przewija do formularza z miniaturami; przyciski kroków formularza („1. Potrzeba”, „Dalej”) działają (dziś na żywo nie działają); `id="mozliwosci"` raz; brak poziomego przewijania i błędów JS.
Cofnięcie: poprzednia rewizja strony 3462.

## Krok 4. Studio (Sites, `gamefields-studio.ryhfs90.chatgpt.site`)
Źródło: `integrations/studio/canvas-editor/` z tego brancha. Publikacja jak dotąd (`DEPLOYMENT.md`): `pnpm install --frozen-lockfile`, `tsc`, `pnpm run build`, publikacja Sites.
Zmienione: `components/studio-workspace.tsx`, `components/project-image.tsx`, `components/project-quote.tsx`, `lib/inquiry-transport.ts`, nowe `lib/court-png.ts`, `lib/inquiry-link.ts`, test `tests/inquiry-transport.mjs`.
- w podsumowaniu przycisk „Odbierz propozycję na maila” (było „Wyślij projekt do wyceny”); wysyła podsumowanie jak dotąd + link 1:1 do konfiguracji (zapis `/api/shared`, 30 dni) + PNG z góry; oba opcjonalne, limit 8 s;
- link „Poproś o ofertę dla tego projektu” w podsumowaniu przewija do tego przycisku (nie wychodzi na `/kontakt/` bez projektu).
Kontrole: `npx tsc --noEmit` PASS, `node --experimental-strip-types tests/inquiry-transport.mjs` PASS, `pnpm run build` PASS.
Uwaga: `pnpm run test:studio` NIE przechodzi także na `main` (oczekuje 28 kierunków wzorów, jest 36 od #120) — to nie jest regresja tej zmiany.
`lib/generated/workshop-thumbnail.mjs` zmienia się przy buildzie — nie commituj tej zmiany.
Sprawdź po publikacji na `https://www.gamefields.eu/studio/` (bez wysyłania): Projektuj boisko → Podsumowanie → „Odbierz propozycję na maila” → otwiera się okno z formularzem, a w nim (DevTools) `project-link` ma link `https://gamefields-studio…/?shared=…`, `project-render` ma plik PNG, `project-details` ma JSON projektu. Także Studio otwarte bezpośrednio pod swoim adresem: przycisk otwiera stronę główną z wypełnionym formularzem (dziś po 15 s pokazuje błąd).

## Krok 5. GA4 (panel Google Analytics, bez kodu)
Site Kit już wysyła zdarzenie wysłania formularza CF7 — oznacz je w GA4 jako **zdarzenie kluczowe**. Nowe zdarzenie `gf_lead` (parametry `lead_source`, `place_type`, `photos`, `page_path`) służy do szczegółów, nie oznaczaj go jako kluczowego (inaczej leady liczą się podwójnie). Opcjonalnie dodaj wymiary niestandardowe dla `lead_source` i `place_type`.
Meta Pixel — nie instalować na tym etapie.

## Po wdrożeniu
Dopisz wpis do `README.md` w głównym folderze repo (data, rewizje WP przed/po, wersja Sites, wyniki kontroli) i do `integrations/wordpress/forms/cf7-3758/README.md` (nazwa pliku backupu). Zrób PR z brancha `claude/cool-gates-frk23j` do `main`.
