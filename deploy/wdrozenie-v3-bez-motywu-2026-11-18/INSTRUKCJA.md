# PACZKA DO WDROŻENIA v3 — bez zmian w motywie, Gamefields, 18.11.2026

Zastępuje v2. Powód: plików motywu nie da się pobrać z serwera (REST/Jetpack: `unavailable` / `no_site_found`), więc nie ma kopii wymaganej przed zmianą motywu.
**v3 nie dotyka motywu.** Wszystko idzie przez formularz CF7 i treść stron, które WordPress wersjonuje (rewizje) — każdy krok da się cofnąć z panelu.
Zmiany motywu (folder `B-motyw-pozniej/`) czekają, aż właściciel zrobi kopię motywu z hostingu (instrukcja na końcu).

Repo: `damianryh/gamefields-os`, branch `claude/cool-gates-frk23j`, folder `deploy/wdrozenie-v3-bez-motywu-2026-11-18/`.

## Zasady
- Przed każdym krokiem kopia: właściwości formularza (`apply.py` robi ją sam), treść strony = numer rewizji WordPressa.
- **Nie wysyłaj formularza na żywo** bez zgody właściciela.
- Jeśli coś na żywo różni się od paczki w miejscu, które zmieniasz — zatrzymaj się i zapytaj.
- Kolejność 1 → 2 → 3 → 4. Każdy krok działa samodzielnie i jest zgodny wstecz.

## Co działa po v3, a co dopiero po motywie
| Funkcja | v3 (teraz) | po motywie 1.0.37 |
|---|---|---|
| Strefa zdjęć (do 3, zmniejszanie zdjęć z telefonu), typ miejsca, zgoda, autoodpowiedź | strona główna, `/kontakt/`, `/studio/` | wszystkie strony z formularzem |
| Pasek „Masz plac? Wyślij zdjęcie.” pod hero, przycisk w nagłówku strony głównej | tak | tak |
| Studio: link do konfiguracji + PNG w mailu, naprawa Studio otwartego bezpośrednio | tak | tak |
| Kroki formularza na stronie głównej (dziś nie działają) | naprawione | tak |
| Mapa możliwości w źródle strony | tak | tak |
| Social: karta po wysłaniu, linie w sekcjach, Mapa, mail, `sameAs` | tak | tak |
| Pomiar GA4 `gf_lead`, `gf_social` | na tych 3 stronach | wszędzie |
| Pasek na telefonie „Wyślij zdjęcie placu” | na tych 3 stronach | wszędzie |
| Nagłówek podstron „Wyślij zdjęcie placu”, stopka „Obserwuj Gamefields”, fioletowy pas nad stopką na 13 podstronach | — | tak |

## Krok 1. Formularz CF7 3758 („a71dc3a”) — folder `1-formularz-cf7-3758/`
```
python3 apply.py            # odczyt na żywo, backup-<czas>.json, różnice; nic nie zapisuje
python3 apply.py --apply    # zapis przez REST CF7 i sprawdzenie
python3 apply.py --restore backup-<czas>.json
```
Ręcznie w panelu CF7 (jeśli skrypt niedostępny — najpierw skopiuj obecne treści zakładek do pliku):
`szablon-formularza.txt` → zakładka Formularz (zastąp całość); `mail-1-dopisz.txt` (tylko dopisujesz); `mail-2-autoodpowiedz.txt`; `komunikat.txt`.
Zmiana addytywna: te same 3 kroki i nazwy pól, ta sama skrzynka. Nowe: `project-photo-2/-3`, `place-type`, `marketing-consent` (nieobowiązkowa), ukryte `lead-source`, `project-link`, plik `project-render`; Mail 2 (autoodpowiedź z linkami social); komunikat „Dziękujemy. Damian odezwie się w ciągu 1–2 dni roboczych.”
Bez kroku 2 formularz działa (3 zwykłe pola plików zamiast strefy zdjęć).

## Krok 2. Strona główna (3462) — folder `2-strona-glowna-3462/`
Podmień w całości bloki `wp:html` o tych nazwach (`<!-- gf-blok: NAZWA -->`) i dodaj nowy na końcu:
| Blok | Zmiana |
|---|---|
| `01-styl` | style paska zdjęcia i linii social; JSON-LD `sameAs` (Instagram, LinkedIn, Facebook) |
| `02-naglowek` | pasek „Masz plac? Wyślij zdjęcie.” z przyciskiem „Wybierz zdjęcie placu →”; nagłówek „Wyślij zdjęcie” / „Wyślij zdjęcie placu”; „Na skróty” |
| `05-realizacje` | „Na bieżąco z budowy: Instagram i Facebook.” |
| `08-samorzady` | „Wyślij zdjęcie placu” → `#zdjecie`; „Starty naborów… na LinkedIn” |
| `18-warsztat` | „Najciekawsze projekty pokazujemy na Instagramie @gamefields.eu” |
| `21-mozliwosci` | Mapa możliwości + „Nie przegap naboru” — **zastępuje blok wklejony wcześniej ręcznie** (`id="mozliwosci"` ma być raz) |
| `22-kontakt` | tekst przy formularzu (1–2 dni robocze) |
| `24-gf-lead` | **NOWY, na samym końcu treści**: skrypt i style strefy zdjęć, Studio, social, pomiaru (to samo co plik motywu `gf-lead.js/css`) |
Pozostałe bloki bez zmian. `cala-strona-homepage.html` = cała treść strony (wszystkie bloki + `24-gf-lead`), gdyby prościej było podmienić całość — wtedy najpierw porównaj z treścią na żywo.

## Krok 3. `/kontakt/` (3716) i `/studio/` (3644) — folder `3-kontakt-3716-i-studio-3644/`
Na obu stronach **dodaj na końcu treści** blok z `gf-lead-blok.html` (bez zmiany reszty treści). Daje strefę zdjęć w formularzu, odbiór linku i PNG ze Studio (`/studio/`), kartę social po wysłaniu i pomiar.
`/kontakt/` ma własny skrypt kroków — blok go nie zastępuje (sprawdzone).

## Kontrole po krokach 1–3 (390 i 1440 px, bez wysyłania)
- strona główna: „Wybierz zdjęcie placu →” otwiera wybór zdjęć i przewija do formularza z miniaturami; przyciski kroków formularza działają; od 1200 px w nagłówku „Wyślij zdjęcie placu”; `id="mozliwosci"` raz;
- `/kontakt/`: ścieżki „Kim jesteś?” i kroki działają jak przed zmianą; krok „Miejsce” zaczyna się od strefy zdjęć; zdjęcie >5 MB z telefonu zostaje przyjęte;
- `/studio/`: okno formularza ze strefą zdjęć;
- konsola bez błędów JS, brak poziomego przewijania.
Cofnięcie: poprzednie rewizje stron; formularz `apply.py --restore`.

## Krok 4. Studio (Sites) — folder `4-studio/`
`studio.patch` (git apply na `main`) albo `zmienione-pliki.tgz` (rozpakuj w `integrations/studio/canvas-editor/`), potem `pnpm install --frozen-lockfile`, `npx tsc --noEmit`, `pnpm run build`, publikacja Sites jak dotąd.
`pnpm run test:studio` nie przechodzi także na `main` (oczekuje 28 kierunków wzorów, jest 36) — to nie regresja. Nie commituj zmiany `lib/generated/workshop-thumbnail.mjs` z buildu.
Sprawdź na `/studio/`: Projektuj boisko → Podsumowanie → „Odbierz propozycję na maila” → okno formularza, w nim `project-link` (link `…/?shared=…`), `project-render` (PNG), `project-details` (JSON). Studio otwarte bezpośrednio: przycisk otwiera stronę główną z wypełnionym formularzem.

## Krok 5. GA4 i profile social (bez kodu)
GA4: oznacz zdarzenie wysłania formularza z Site Kit jako kluczowe; `gf_lead` i `gf_social` zostaw jako zwykłe. Profile: opisy, linki z UTM i przypięty post — `5-social/STRATEGIA-SOCIAL-2026-11.md`.

## Etap B (później): motyw 1.0.37 — folder `B-motyw-pozniej/pliki/`
Najpierw **właściciel robi kopię motywu z hostingu** (2 minuty, bez programisty):
panel hostingu → Menedżer plików (albo FTP) → `wp-content/themes/` → folder `gamefields` → „Kompresuj / Pobierz jako ZIP” → zapisz plik `gamefields-kopia-<data>.zip`.
Dopiero potem wgraj 5 plików (te same ścieżki w `wp-content/themes/gamefields/`): `functions.php`, `header.php`, `footer.php`, `assets/js/gf-lead.js`, `assets/css/gf-lead.css`.
Bloki `24-gf-lead` i `gf-lead-blok.html` mogą zostać (skrypt uruchamia się tylko raz) albo można je usunąć.
Cofnięcie: wgranie plików z kopii ZIP.

## Po wdrożeniu
Wpis do `README.md` w głównym folderze repo (data, rewizje WP przed/po, wersja Sites, plik backupu formularza, wyniki kontroli) i PR z `claude/cool-gates-frk23j` do `main`.
