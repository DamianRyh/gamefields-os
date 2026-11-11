# Publikacja gamefields.eu dla klientów: zmiany do wdrożenia (11.11.2026)

Dokument dla wykonawcy z dostępem do WordPressa i hostingu (ChatGPT, Codex, Claude Code albo osoba). Repozytorium jest źródłem. Na WordPressie zmieniamy tylko to, co opisane niżej.

## Stan po audycie z 11.11.2026

Sprawdzone automatycznie na żywej stronie (Playwright, 50 adresów z mapy strony, 390 px):

| Obszar | Wynik |
| --- | --- |
| Podstrony z mapy strony | 50 z 50 odpowiada 200, każda ma jeden H1 i opis meta |
| Linki wewnętrzne | 156 z 156 działa |
| Przewijanie w bok na telefonie | brak na wszystkich podstronach |
| Teksty zastępcze (lorem, [pole], „Sample Page”) | brak |
| LCP strony głównej, telefon (Pixel 5, bez dławienia) | ok. 1,4 s, obraz hero `panna-play-mv-720.webp` |
| **Martwe obrazy** | **6 podstron ma tło nagłówka 404** → zadanie A |
| **Sekcja „Stary beton. Nowe boisko.”** | **niewdrożona; zamiast niej stoi wersja „Stary plac. Nowa gra.” spoza repozytorium** → zadanie B |
| **Polityka prywatności** | **nie opisuje Google Analytics, choć pomiar działa** → zadanie C |

Zasady dla każdego zadania: kopia przed zmianą (numer wersji strony), podgląd, publikacja po akceptacji właściciela, na koniec wyczyszczenie cache LiteSpeed.

## A. Martwe obrazy nagłówków (6 podstron)

Trzy pliki z `uploads/2025/06/` usunięto z mediów, a podstrony `/malowanie-boisk/`, `/renowacja-boisk/`, `/projektowanie-boisk/`, `/boiska-dla-deweloperow/`, `/boiska-do-koszykowki/` i `/korty-padel/` nadal używają ich jako tła nagłówka.

1. Wgraj plik `integrations/wordpress/mu-plugins/gamefields-content-fixes.php` z repozytorium do `wp-content/mu-plugins/` (menedżer plików hostingu albo SFTP; utwórz katalog, jeśli go nie ma). Plik pobierzesz stąd: https://raw.githubusercontent.com/DamianRyh/gamefields-os/main/integrations/wordpress/mu-plugins/gamefields-content-fixes.php
2. Wtyczka nie zmienia bazy danych. Podmienia adresy w locie na własne rendery Gamefields: „Riviera Court” (malowanie), „Play System” (renowacja), „Organic Flow” (projektowanie).
3. Wyczyść cache LiteSpeed dla tych 6 podstron.

Sprawdzenie: na każdej z 6 podstron w narzędziach przeglądarki (Sieć) nie ma żadnego 404, a nagłówek ma tło z boiskiem.
Cofnięcie: usuń plik z `wp-content/mu-plugins/`.

Rozwiązanie docelowe, gdy będzie czas: w edytorze każdej z 6 podstron podmienić adres tła na obraz z mediów i wtedy usunąć wtyczkę.

## B. Sekcja „Stary beton. Nowe boisko.” na stronie głównej

Pełna instrukcja z gotowym kodem: `docs/roadmap/WDROZENIE-stary-beton.md`
(https://raw.githubusercontent.com/DamianRyh/gamefields-os/main/docs/roadmap/WDROZENIE-stary-beton.md).
Wstawiamy tylko fragmenty do aktualnej treści strony 3462, nie podmieniamy całości.

**Ważne (stan z 11.11, 16:00):** na stronie jest już inna wersja tej sekcji, dodana bez repozytorium: `<section id="odnowa-placu">` z nagłówkiem „Stary plac. Nowa gra.”, poprzedzona komentarzem `<!-- Modernizacja placów · 2026-11-11 -->` i własnym blokiem `<style>` z regułami `.gfs .renov-…`. Przed krokiem 2 instrukcji usuń w całości: ten komentarz, ten blok `<style>` z regułami `.renov-…` i całą sekcję `#odnowa-placu` wraz z jej skryptem, jeśli ma osobny. Potem wstaw sekcję z instrukcji w to samo miejsce, po „Zmieści się?”. Na stronie ma zostać jedna sekcja o modernizacji placów, nie dwie.

## C. Polityka prywatności: pomiar odwiedzin (strona 4087)

Na stronie działa Complianz (zgoda opt-in) i tag Google `GT-M63DMWRD`. Polityka tego nie opisuje. Dodaj poniższą sekcję **po sekcji „Usługi techniczne, pamięć przeglądarki i cookies”**, jako nagłówek H2 i akapity (w edytorze blokowym: blok Nagłówek + bloki Akapit).

> ## Pomiar odwiedzin
>
> Za Twoją zgodą korzystamy z Google Analytics 4, żeby wiedzieć, które części strony i Studio pomagają w projektowaniu boiska. Bez zgody pomiar jest wyłączony, a do Google trafiają wyłącznie sygnały bez plików cookie i bez identyfikatorów (tryb zgody Google).
>
> Po wyrażeniu zgody Google Analytics zapisuje pliki cookie `_ga` i `_ga_*` i zbiera: odwiedzone strony, czas wizyty, typ urządzenia i przeglądarki, przybliżoną lokalizację (kraj, miasto) oraz źródło wejścia. Nie łączymy tych danych z treścią zapytań.
>
> Podstawą jest Twoja zgoda (art. 6 ust. 1 lit. a RODO). Możesz ją wycofać w każdej chwili: [cmplz-manage-consent]. Wycofanie nie wpływa na zgodność z prawem pomiaru sprzed wycofania.
>
> Dostawcą usługi jest Google Ireland Limited, Gordon House, Barrow Street, Dublin 4, Irlandia. Dane mogą być przekazywane do Google LLC w USA. Google LLC uczestniczy w programie EU-U.S. Data Privacy Framework, na podstawie decyzji Komisji Europejskiej stwierdzającej odpowiedni stopień ochrony. Dane w Google Analytics przechowujemy 14 miesięcy.

Uwagi dla wykonawcy:
- `[cmplz-manage-consent]` to krótki kod Complianz, który wyświetla przycisk zmiany zgody. Wpisz go w bloku „Krótki kod”. Sprawdź w Complianz → Ustawienia, że ta nazwa kodu działa w zainstalowanej wersji.
- Okres 14 miesięcy musi się zgadzać z ustawieniem GA4 (Administracja → Przechowywanie danych). Jeśli jest tam 2 miesiące, wpisz 2 miesiące albo zmień ustawienie na 14.
- Nie publikuj pozostałych akapitów z `docs/roadmap/prywatnosc-uzupelnienia.md` (dane firmy, Warsztat, koszulki, PLAY), dopóki właściciel nie poda brakujących danych.

Sprawdzenie: sekcja jest widoczna, przycisk zmiany zgody otwiera okno Complianz.

## Po wdrożeniu

Uruchom kontrolę strony: https://github.com/DamianRyh/gamefields-os/actions/workflows/site-monitor.yml → „Run workflow”, albo lokalnie `node scripts/check-live-site.mjs`. Dołącz wynik do raportu.

## Polecenie do wklejenia wykonawcy

```
Wdróż na gamefields.eu zmiany z dokumentu:
https://raw.githubusercontent.com/DamianRyh/gamefields-os/main/docs/roadmap/PUBLIKACJA-2026-11.md

Zrób zadania A, B i C w tej kolejności. Przed każdą zmianą zrób kopię (numer wersji strony), pokaż mi podgląd i poczekaj na moją akceptację. Nie zmieniaj niczego poza opisanym zakresem i nie podmieniaj całej treści strony głównej. Po publikacji wyczyść cache LiteSpeed i przejdź sprawdzenia z dokumentu. Na koniec napisz raport: co zmieniłeś, numery wersji kopii, wynik sprawdzeń, jak cofnąć.
```
