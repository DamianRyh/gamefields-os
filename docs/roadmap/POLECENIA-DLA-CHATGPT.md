# Polecenia dla ChatGPT (kolejka, jeszcze nieprzekazane)

Właściciel przekaże je razem, gdy zdecyduje. Kolejność ma znaczenie: wcześniejsze punkty są pilniejsze.
Przy każdym poleceniu: dołącz wskazany plik jako załącznik (ChatGPT nie otwiera GitHuba). Pliki są w repozytorium w `docs/roadmap/`.

Ostatnia aktualizacja: 13.11.2026 (ceny)

---

## 1. ✅ Poprawka polityki prywatności (wdrożone, sprawdzone 13.11)

Załącznik: brak.

```
Popraw sekcję „Pomiar odwiedzin” w polityce prywatności (strona 4087):

1. W miejscu krótkiego kodu Complianz wyświetla się „[object Object]”. Usuń ten krótki kod. Zdanie przed nim zmień na: „Możesz ją zmienić albo wycofać w każdej chwili przyciskiem „Zarządzaj zgodą” poniżej albo w rogu strony.” Pod nim dodaj blok „Własny HTML” z tym kodem (sprawdzony — otwiera okno zgód):
<p><button type="button" onclick="cmplz_set_banner_status('show')" style="min-height:44px;padding:0 20px;border-radius:999px;border:1.5px solid #47132D;background:#fff;color:#47132D;font:inherit;font-weight:700;cursor:pointer">Zarządzaj zgodą</button></p>

2. Pierwszy akapit sekcji zastąp tym tekstem:
„Za Twoją zgodą korzystamy z Google Analytics 4, żeby wiedzieć, które części strony i Studio pomagają w projektowaniu boiska. Bez zgody pomiar jest wyłączony.”

Pokaż mi podgląd, potem opublikuj i wyczyść cache LiteSpeed.
```

## 2. ✅ Strony autentyczności (zastąpione przez 2a, wdrożone)

Załącznik: `DLA-CHATGPT-autentycznosc.md`. Jeśli ChatGPT ma kłopot z dużym plikiem: dołącz osobno strony z `integrations/wordpress/pages/autentycznosc-2026-11/` (`damian-gawrych.html`, `jak-powstaje-arena.html`, `koncepcje.html`, `sztuka-z-gry.html`).

```
W załączniku jest kompletna instrukcja z całym kodem — nie otwieraj linków do GitHuba. Szkic „Damian Gawrych” (ID 4626) już istnieje: porównaj go z kodem z załącznika i popraw, jeśli się różni. Utwórz jako szkice pozostałe trzy strony: „Jak powstaje arena” (/jak-powstaje-arena/), „Koncepcje” (/koncepcje/), „Sztuka z gry” (/sztuka-z-gry/), szablon „Pełna szerokość”, tytuły SEO i opisy z instrukcji. Potem fragmenty na istniejących stronach (zadania 2–3). Pokaż mi podgląd wszystkich stron (komputer i telefon) przed publikacją, potem opublikuj i wyczyść cache LiteSpeed.
```

## 2a. ✅ Dokończenie stron autentyczności (wdrożone, sprawdzone 13.11)

Na stronie: „Damian Gawrych” w **starej wersji** (bez danych od właściciela: od 2005/2008, Jaktorów, Polsat zamiast TVP Sport, Instagram, akcja charytatywna), „Jak powstaje arena” poprawnie. Brak: „Koncepcje” (link ze strony Damiana daje 404), „Sztuka z gry”, fragmenty na O nas / Eventy / Szkoły, link z Realizacji do budowy areny, link „Kim jestem” na stronie głównej.

Załączniki: `damian-gawrych.html`, `koncepcje.html`, `sztuka-z-gry.html` z `integrations/wordpress/pages/autentycznosc-2026-11/` oraz `DLA-CHATGPT-autentycznosc.md`.

```
Dokończ strony autentyczności. Wszystko jest w załącznikach — nie otwieraj linków do GitHuba.

1. Strona „Damian Gawrych” (/damian-gawrych/) ma na żywo starą wersję. Zastąp całą zawartość bloku „Własny HTML” kodem z załącznika damian-gawrych.html (bez zmian). Po zmianie na stronie mają być m.in.: „W pannę gram od 2005 roku”, „Jaktorowie”, „Polsat”, linki do Instagrama i damiangawrych.pl. Tytuł SEO zmień na: „Damian Gawrych — autor studia Gamefields | panna i street football od 2005”.
2. Utwórz strony „Koncepcje” (/koncepcje/) i „Sztuka z gry” (/sztuka-z-gry/) z plików koncepcje.html i sztuka-z-gry.html, szablon „Pełna szerokość”, tytuły SEO i opisy z DLA-CHATGPT-autentycznosc.md.
3. Zrób zadania 2 i 3 z DLA-CHATGPT-autentycznosc.md: fragmenty ze zdjęciami na /o-nas/, /eventy-sportowe/, /boiska-dla-szkol/, link z /realizacje-gamefields/ do /jak-powstaje-arena/, link „Kim jestem: Damian Gawrych” i zmiana „founder” w JSON-LD na stronie głównej, profil autora wpisów.
Pokaż mi podgląd przed publikacją, potem opublikuj i wyczyść cache LiteSpeed.
```

## 3. ✅ Strony dla samorządów (wdrożone, sprawdzone 13.11)

Załącznik: `DLA-CHATGPT-samorzady.md`.

```
W załączniku jest kompletna instrukcja z całym kodem — nie otwieraj linków do GitHuba. Utwórz jako szkice dwie strony: „Dofinansowanie boisk” (/dofinansowanie-boisk/) i „Realizacje dla miast” (/realizacje-dla-miast/), szablon „Pełna szerokość”, tytuły SEO i opisy z instrukcji. Potem dodaj linki z istniejących stron (zadanie 2). Pokaż mi podgląd (komputer i telefon), potem opublikuj i wyczyść cache LiteSpeed.
```

## 4. Studio: ceny zgodne ze stroną, widełki i karta projektu PDF

Załącznik: brak. **Koszty i marżę właściciel wkleja do polecenia sam, na czacie z ChatGPT. Nie zapisujemy ich w repozytorium.**
Sprawdzenie po wdrożeniu: `python3 tools/pricing/check_studio_prices.py` (porównuje ceny konstrukcji w Studio z `offer/price-from.json`, wynik „OK” przy każdym modelu).

```
1. W ustawieniach serwera Studio Gamefields ustaw SALES_MARGIN i koszty konstrukcji INTERNAL_COST_CARD.arenaNet według tabeli, którą wklejam niżej. Klucze modeli: circle-cage-1 (Panna Octa Cage 90), o1 (Panna Play), w1 (Panna Ring), octagon (Panna Octa), street-field (Panna Grid), circle-cage-2 (Panna Octa Cage 180), p1 (Panna Court), street15 (Boisko 3 na 3). Nie zmieniaj innych pozycji karty. Nie zapisuj kosztów ani marży w kodzie, repozytorium ani w DEPLOYMENT.md.
[TU WKLEJ TABELĘ: marża i 8 kosztów]
2. Opublikuj nową wersję Studio z gałęzi main repozytorium DamianRyh/gamefields-os (katalog integrations/studio/canvas-editor). Zmiany: widełki ceny w przycisku Podsumowanie i w podsumowaniu, karta projektu PDF. Przed publikacją uruchom tsc, test:price, build i test:mobile.
3. Po publikacji sprawdź: w podsumowaniu Panny Play pozycja „Konstrukcja z bramkami” = 40 000 zł, przycisk Podsumowanie pokazuje „… tys. zł netto”, „Pobierz kartę projektu (PDF)” otwiera okno drukowania. Zapisz numer wersji i ID wdrożenia w DEPLOYMENT.md (bez kosztów).
```

## 5. ✅ Ceny konstrukcji na stronie głównej (wdrożone, sprawdzone 13.11)

Załącznik: `DLA-CHATGPT-ceny.md`.

```
W załączniku jest kompletna instrukcja z całym kodem — nie otwieraj linków do GitHuba. Na stronie głównej (ID 3462) dodaj sekcję „Ile kosztuje arena?” z cenami konstrukcji, skrót „Ceny” na telefonie, nową odpowiedź w FAQ „Czy cena jest widoczna od razu?” i ceny w danych strukturalnych (kroki 1–5). Nie podmieniaj całej strony, tylko wstaw fragmenty. Pokaż mi podgląd (komputer i telefon), potem opublikuj i wyczyść cache LiteSpeed.
```

## 6. ✅ Studio: tylko cena konstrukcji + karta konstrukcji 3D (wdrożone, sprawdzone 13.11)

Załącznik: brak. `main` łączy kod produkcyjny wykonawcy (karta konstrukcji 3D bez podłoża, gałąź `studio-produkcja-karta-konstrukcji`, commit abc3394) z trybem `PRICE_MODE="construction"` (przycisk Podsumowanie i podsumowanie pokazują cenę konstrukcji bez widełek z nawierzchnią).

```
Opublikuj Studio z najnowszego commita gałęzi main repozytorium DamianRyh/gamefields-os (integrations/studio/canvas-editor), bez własnych zmian w kodzie. Zawiera Twoją kartę konstrukcji 3D (commit abc3394) oraz tryb samej ceny konstrukcji w przycisku i podsumowaniu. Nie zmieniaj INTERNAL_COST_CARD ani SALES_MARGIN. Przed publikacją: tsc, test:price, build, test:mobile, node tests/construction-card-browser.mjs. Po publikacji sprawdź dla Panny Play: przycisk Podsumowanie „Konstrukcja: 40 000 zł netto”, w podsumowaniu „Cena konstrukcji” bez widełek, „Pobierz kartę konstrukcji (PDF)” daje kartę z modelem 3D i ceną 40 000 zł netto. Zapisz numer wersji i ID wdrożenia w DEPLOYMENT.md (bez kosztów).
```

## 7. Studio: nawierzchnia betonowa i 7 wykończeń jako osobne ceny, nowe nazwy materiałów (publikacja z main)

Załącznik: brak. Ceny betonu i wykończeń to ceny sprzedaży z cenników właściciela, zapisane w kodzie (`lib/concrete-base.ts`, `lib/surface-finish.ts`). Metraż wykończeń: powierzchnia konstrukcji +10%. Karta kosztów i marża bez zmian.

```
Opublikuj Studio z najnowszego commita gałęzi main repozytorium DamianRyh/gamefields-os (integrations/studio/canvas-editor), bez własnych zmian w kodzie. Nowości: nawierzchnia betonowa i siedem wykończeń jako osobne ceny obok konstrukcji, jeden metraż wykończeń (powierzchnia konstrukcji +10%), nowe nazwy materiałów. Nie zmieniaj INTERNAL_COST_CARD ani SALES_MARGIN. Przed publikacją: tsc, test:price, build, test:mobile, node tests/construction-card-browser.mjs, node tests/concrete-base-browser.mjs. Po publikacji sprawdź dla Panny Play (nawierzchnia betonowa 9100 zł zaznaczona): w Nawierzchnia → Materiał „Malowanie farbą sportową” → „Wzór zaawansowany”: przycisk Podsumowanie „Konstrukcja 40 000 zł · Nawierzchnia 14 700 zł netto”, w podsumowaniu wiersze konstrukcja 40 000, beton 9100, malowanie 5600, razem 54 700 zł, w wymiarach „Powierzchnia do wyceny wykończenia (+10% zapasu) 30,1 m²”; karta PDF ma te same wiersze. Wariant Premium każdego materiału daje nawierzchnię: „Nawierzchnia EPDM wylewana” 21 200 zł, „Płytki sportowe PP” 21 200 zł, „Sztuczna trawa” 17 900 zł, „Akryl Hard Court” 19 400 zł, „Płyty gumowe” 24 000 zł, „Maty gumowe” 21 900 zł. Klient nie widzi liczby płytek, tylko m². Na telefonie przycisk Podsumowanie pokazuje kwotę razem. Zapisz numer wersji i ID wdrożenia w DEPLOYMENT.md (bez kosztów).
```
