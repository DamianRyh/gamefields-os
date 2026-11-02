# Gamefields homepage "Studio" — 2026-11

Nowa strona główna gamefields.eu (WordPress, strona **3462**, szablon `templates/page-full.php`): „boisko jako plakat”.
Projekt powstał jako makieta w Claude (płótno „Gamefields Studio — nowa strona”) i został tu przeniesiony do bloku `wp:html`.

## Źródła i budowanie

`python3 build.py` składa `homepage.html` (dokładna treść `content.raw` dla WordPressa) z:

- `style.css` — wszystko pod `.gfs`, jeden krój (Inter jako GHInter z `../premium-2026-10-26/assets/InterVariable.woff2`),
- `body.html` — treść strony,
- `script.js` — interakcje (bez znaku podwójnego ampersandu, bo WordPress zamienia go na encję),
- `kept-workshop.html` — Warsztat społeczności z obecnej strony, bez zmian w logice,
- `kept-faq-contact.html` — FAQ i skrypty pola `project-details` formularza CF7 `a71dc3a`, bez zmian w logice.

`index.html` to lokalny podgląd z zastępczym formularzem.

Modele 3D (`public/models/gamefields/source/*.glb`, `assets/panna-octa.glb`) i przykładowe zdjęcie placu są serwowane przez jsDelivr z tego repozytorium, przypięte do commita `ASSET_COMMIT` w `build.py`. Przeglądarka 3D: `@google/model-viewer@3.5.0` z jsDelivr, ładowana po wyrenderowaniu strony.

## Co robi strona

- Hero: model 3D (Play, Court, Ring, Octa) do obracania, kolor ramy zmienia model i kolor boiska; kursor jako piłka.
- Kolekcja 8 boisk z filtrem kształtu, kafle prowadzą do Studio (`/konfigurator-boisk/?arena=`).
- Studio: schemat z boku z wysokościami 0,90 / 1,80 m w skali 1:1 i suwakiem wzrostu. Szerokości panelu, wejścia i bramki są schematyczne, bez wymiarów.
- Plakaty: 12 wzorów Signature (rysunki techniczne SVG ze Studio) albo wzór generowany, podpis, format, rama, kolor ściany. „Zamów print” dopisuje zamówienie do pola `project-details` i przewija do formularza. Ceny nie są publikowane.
- Zestawy (5 miejsc), „Na Twoim placu” (przeciąganie, skala, własne zdjęcie tylko w przeglądarce), Warszawa FC × RTOA (4 plansze), kroki, FAQ, kontakt.
- Formularz: istniejący CF7 `a71dc3a`. Chipy „Kim jesteś / Czego potrzebujesz” dopisują linię `Profil zapytania:` do `project-details`. Zachowano `gf_product`, podgląd/usuwanie dołączonych parametrów i przyjmowanie projektu ze Studio (`gf-inquiry`, tylko z `window.opener`).

## Wdrożenie i cofnięcie

Przed wdrożeniem zapisano prywatną kopię obecnej treści jako stronę WordPress **4268** (treść identyczna, sha256 `a547ffa4…f6f8`). Szkic do odbioru: osobna strona robocza. Publikacja zmienia wyłącznie pole `content` strony 3462. Cofnięcie: wersje WordPressa albo treść strony 4268.
