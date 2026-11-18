# v3 — pozostałe kroki (stan sprawdzony na żywo 18.11.2026)

## Stan
- ✅ Krok 1 — formularz CF7 3758 wgrany. Na żywo (z pominięciem cache) są: `place-type`, `project-photo-2/-3`, `marketing-consent`, „Opisz miejsce i co chcesz osiągnąć”.
- ❌ Krok 2 — bloki strony głównej: brak (`photo-strip`, `24-gf-lead`, linie social, `sameAs`).
- ❌ Krok 3 — blok `gf-lead` na `/kontakt/` i `/studio/`: brak.
- ❌ Krok 4 — Studio (Sites): nieopublikowane.
- ❌ Krok 5 — GA4 i profile social: do zrobienia przez właściciela.

## ⚠️ Pamięć podręczna LiteSpeed
Strona ma LiteSpeed Cache z `max-age=604800` (7 dni). Zwykły adres pokazuje dziś starą wersję stron (stary formularz),
nowy formularz widać tylko pod adresem z parametrem, np. `/kontakt/?nc=1`.
**Po każdym kroku: LiteSpeed Cache → Wyczyść wszystko (Purge All)** — także teraz, po kroku 1. Kontrole rób na adresie bez parametru dopiero po wyczyszczeniu.

## Krok 2 — strona główna (3462), folder `2-strona-glowna-3462/bloki/`
Na żywo strona ma 22 bloki z oznaczeniem `<!-- gf-blok: NAZWA -->` oraz **jeden blok bez oznaczenia między `pytania` a `kontakt`**:
to ręcznie wklejona Mapa możliwości, zaczyna się od `<!-- Gamefields — Mapa możliwości. Wklej w blok „Własny HTML”…`.
1. Kopia: zapisz numer bieżącej rewizji strony 3462.
2. Podmień w całości bloki: `styl` ← `01-styl.html`, `naglowek` ← `02-naglowek.html`, `realizacje` ← `05-realizacje.html`,
   `samorzady` ← `08-samorzady.html`, `warsztat` ← `18-warsztat.html`, `kontakt` ← `22-kontakt.html`.
3. Blok bez oznaczenia (ręczna Mapa) zastąp `21-mozliwosci.html` — w tym samym miejscu (po `pytania`, przed `kontakt`). `id="mozliwosci"` ma wystąpić raz.
4. Na samym końcu treści (po `skrypty`) dodaj `24-gf-lead.html`.
5. Pozostałych bloków nie ruszaj. Jeśli któryś z podmienianych różni się na żywo od wersji sprzed zmian w repo w innym miejscu niż opisane — zatrzymaj się i zapytaj.
6. Wyczyść cache LiteSpeed.

## Krok 3 — `/kontakt/` (3716) i `/studio/` (3644)
Zapisz numery rewizji, dodaj na końcu treści każdej strony blok z `3-kontakt-3716-i-studio-3644/gf-lead-blok.html`, reszty nie zmieniaj. Wyczyść cache.

## Kontrole po krokach 2–3 (390 i 1440 px, adresy bez parametru, po wyczyszczeniu cache, bez wysyłania)
- źródło strony głównej zawiera `gfLeadLoaded`, `photo-strip`, `linkedin.com/company/gamefields`; `id="mozliwosci"` raz;
- „Wybierz zdjęcie placu →” otwiera wybór zdjęć, potem formularz z miniaturami; przyciski kroków formularza działają;
- `/kontakt/`: ścieżki „Kim jesteś?” i kroki jak dotąd; krok „Miejsce” zaczyna się od strefy „Dodaj zdjęcia placu” (zamiast trzech surowych pól plików);
- `/studio/`: okno formularza ze strefą zdjęć;
- konsola bez błędów JS, bez poziomego przewijania.
Cofnięcie: poprzednie rewizje stron + wyczyszczenie cache.

## Krok 4 — Studio (Sites), folder `4-studio/`
Bez zmian względem INSTRUKCJA.md (patch albo pliki → `pnpm install --frozen-lockfile` → `npx tsc --noEmit` → `pnpm run build` → publikacja Sites).
Studio działa także przed krokami 2–3, ale link i PNG trafią do maila dopiero, gdy na stronie jest blok `gf-lead`.

## Krok 5 — właściciel (bez kodu)
- GA4 → Administracja → Zdarzenia: oznacz zdarzenie wysłania formularza z Site Kit jako kluczowe (nie `gf_lead`, nie `gf_social`).
- Profile: opisy i linki z UTM, przypięty post — `5-social/STRATEGIA-SOCIAL-2026-11.md`.
