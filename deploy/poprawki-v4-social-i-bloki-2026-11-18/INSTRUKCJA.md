# POPRAWKI v4 — social media i blokada skryptów przez Complianz, 18.11.2026

Paczka do wgrania na stronę, która ma już v3 (wszystkie bloki v3 są na żywo — sprawdzone).
Edycja **wyłącznie blokami** `wp:html` (`<!-- gf-blok: NAZWA -->`): podmieniasz tylko wymienione bloki, w całości, resztę zostawiasz.

## Co naprawia
1. **Complianz blokował dwa skrypty** (zmieniał je na `type="text/plain"` do zgody marketingowej):
   - `gf-lead` — bo zawierał adresy Instagrama/Facebooka/LinkedIn → bez zgody nie działały: strefa zdjęć, odbiór projektu ze Studio, karta po wysłaniu, pomiar;
   - Mapa możliwości — bo zawierała adres kafelków OpenStreetMap → bez zgody nie działały nawet 3 pytania.
   Teraz w skryptach nie ma żadnych adresów serwisów zewnętrznych (linki są w HTML, adres kafelków w atrybucie `data-tiles`; mapa wczytuje się tylko po kliknięciu „Pokaż mapę”).
2. **Social media**: zamiast list z kropkami — jedna sekcja „Gamefields w sieci / Zobacz, co budujemy.” z trzema kartami
   (Instagram ze zdjęciami realizacji, LinkedIn dla gmin i firm, Facebook dla mieszkańców). W Mapie możliwości — jedna linia z dwoma przyciskami.
3. **Każdy blok ma własne style** — żaden nie zależy od innego bloku, więc nic nie „rozjeżdża się” przy wgrywaniu po kolei.

## Strona główna (3462) — folder `strona-glowna-3462/`
Zapisz numer bieżącej rewizji. Potem:
| Blok na żywo | Działanie |
|---|---|
| `gf-blok: realizacje` | podmień na `realizacje.html` (usunięta linia „Na bieżąco z budowy…”) |
| — | **dodaj nowy blok** `social.html` **zaraz po** `realizacje` (przed `planer`) |
| `gf-blok: samorzady` | podmień na `samorzady.html` (linia o LinkedIn ma własne style) |
| `gf-blok: mozliwosci` | podmień na `mozliwosci.html` (jedna linia social zamiast kart; mapa bez blokady) |
| `gf-blok: gf-lead` | podmień na `gf-lead.html` (skrypt bez adresów social + szablon linków po wysłaniu) |
Wyczyść cache LiteSpeed (Purge All).

## `/kontakt/` (3716) i `/studio/` (3644) — folder `kontakt-3716-i-studio-3644/`
Na obu stronach podmień blok `gf-blok: gf-lead` na `gf-lead.html`. Wyczyść cache.

## Kontrole (390 i 1440 px, adres bez parametru po wyczyszczeniu cache, **w oknie prywatnym bez akceptowania cookies**)
- w źródle strony nie ma `type="text/plain" data-service="instagram"` ani `data-service="openstreetmaps"` (DevTools → Elements, szukaj `text/plain`);
- strona główna: sekcja „Zobacz, co budujemy.” po realizacjach — 3 karty, zdjęcia w karcie Instagram, przyciski otwierają profile w nowej karcie;
- Mapa możliwości: pytania działają bez zgody cookies; na dole linia „Nie przegap naboru…” z przyciskami LinkedIn i Facebook; „Pokaż mapę” wczytuje mapę;
- formularz: „Wybierz zdjęcie placu →” otwiera wybór zdjęć, strefa „Dodaj zdjęcia placu” z miniaturami (także na `/kontakt/` i `/studio/`);
- konsola bez błędów JS, brak poziomego przewijania.
Cofnięcie: poprzednie rewizje stron + wyczyszczenie cache.

## Motyw (później, po kopii z hostingu) — folder `motyw-pozniej/`
Te same pliki co w v3 `B-motyw-pozniej/`, zaktualizowane: `gf-lead.js` bez adresów social, `functions.php` drukuje szablon linków w stopce strony. Kolejność i kopia — jak w instrukcji v3.

## Uwaga do polityki prywatności
Mapa (OpenStreetMap) i zdjęcia ładują się dopiero po kliknięciu „Pokaż mapę”. Jeśli chcesz, żeby Complianz pytał o zgodę także przed mapą, można to zrobić później w ustawieniach Complianz — nie blokując przy tym pytań i formularza.
