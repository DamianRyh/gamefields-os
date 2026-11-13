# Polecenia dla ChatGPT (kolejka, jeszcze nieprzekazane)

Właściciel przekaże je razem, gdy zdecyduje. Kolejność ma znaczenie: wcześniejsze punkty są pilniejsze.
Przy każdym poleceniu: dołącz wskazany plik jako załącznik (ChatGPT nie otwiera GitHuba). Pliki są w repozytorium w `docs/roadmap/`.

Ostatnia aktualizacja: 13.11.2026 (kontrola strony)

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

## 2. Strony autentyczności (Damian Gawrych, Jak powstaje arena, Koncepcje, Sztuka z gry)

Załącznik: `DLA-CHATGPT-autentycznosc.md`. Jeśli ChatGPT ma kłopot z dużym plikiem: dołącz osobno strony z `integrations/wordpress/pages/autentycznosc-2026-11/` (`damian-gawrych.html`, `jak-powstaje-arena.html`, `koncepcje.html`, `sztuka-z-gry.html`).

```
W załączniku jest kompletna instrukcja z całym kodem — nie otwieraj linków do GitHuba. Szkic „Damian Gawrych” (ID 4626) już istnieje: porównaj go z kodem z załącznika i popraw, jeśli się różni. Utwórz jako szkice pozostałe trzy strony: „Jak powstaje arena” (/jak-powstaje-arena/), „Koncepcje” (/koncepcje/), „Sztuka z gry” (/sztuka-z-gry/), szablon „Pełna szerokość”, tytuły SEO i opisy z instrukcji. Potem fragmenty na istniejących stronach (zadania 2–3). Pokaż mi podgląd wszystkich stron (komputer i telefon) przed publikacją, potem opublikuj i wyczyść cache LiteSpeed.
```

## 2a. Dokończenie stron autentyczności (stan 13.11)

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

## 4. Studio: widełki ceny i karta projektu PDF

Załącznik: brak. **Wstrzymane do decyzji właściciela o cenach** (`CENY-PRZEJRZYSTOSC-2026-11.md`).

```
Opublikuj nową wersję Studio Gamefields z gałęzi main repozytorium DamianRyh/gamefields-os (katalog integrations/studio/canvas-editor, commit db857b0 lub nowszy). Zmiany: widełki ceny w przycisku Podsumowanie i w podsumowaniu, karta projektu PDF. Nie zmieniaj ustawień serwera INTERNAL_COST_CARD ani SALES_MARGIN. Przed publikacją uruchom tsc, test:price, build i test:mobile. Po publikacji sprawdź: przycisk Podsumowanie pokazuje „… tys. zł netto”, a „Pobierz kartę projektu (PDF)” otwiera okno drukowania. Zapisz numer wersji i ID wdrożenia w DEPLOYMENT.md.
```

## 5. Ceny „od … zł netto” na kartach modeli

Do przygotowania po akceptacji cen (lista zadań, punkt 2).
