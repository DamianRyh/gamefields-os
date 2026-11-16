# Dla ChatGPT: strona główna podzielona na bloki + odświeżony wygląd (16.11.2026)

## Po co

Do tej pory cała strona główna (ID 3462) była jednym dużym blokiem HTML, więc każda drobna zmiana wymagała zapisu całości.
Od teraz strona składa się z **22 małych bloków „Własny HTML”**, po jednym na sekcję. Każdy blok zaczyna się komentarzem
`<!-- gf-blok: NAZWA -->` (np. `gf-blok: ceny`). Kolejne zmiany będą dotyczyć tylko jednego bloku.

Ten jeden raz trzeba podmienić **całą treść strony**. Właściciel zatwierdza to wprost w poleceniu 12.

Nowa treść zawiera już logo miast (polecenie 11, część A) i odświeżony wygląd nowych sekcji:
- ceny jako karty (komputer: 3 kolumny; telefon: przewijany rząd),
- lżejsze kroki modernizacji i fakty dla gmin (telefon: 2 × 2),
- przewijane rzędy na telefonie: kroki, zdjęcia z Krakowa i normy,
- zdjęcie autora na telefonie w kadrze 4:3.

Żaden tekst nie został usunięty.

## Pliki (zwykłe pliki tekstowe)

- Cała treść strony: https://raw.githubusercontent.com/DamianRyh/gamefields-os/main/integrations/wordpress/homepage/studio-2026-11/homepage.html
  - SHA-256: `0009bc57ec6d3fa63977116fa91f295d4cfe3ae12e012ba1145c43a891f9c45b`
  - rozmiar: 142486 bajtów
- Pojedyncze bloki (na przyszłość): https://raw.githubusercontent.com/DamianRyh/gamefields-os/main/integrations/wordpress/homepage/studio-2026-11/bloki/NN-nazwa.html, np. https://raw.githubusercontent.com/DamianRyh/gamefields-os/main/integrations/wordpress/homepage/studio-2026-11/bloki/05-ceny.html

## Kroki

1. Zrób kopię obecnej strony głównej (szkic lub wersja), zapisz jej ID.
2. Pobierz `homepage.html` z linku wyżej i sprawdź, że:
   - ma 22 wystąpienia `<!-- wp:html -->`,
   - nie zawiera `&&`,
   - SHA-256 się zgadza.
3. Utwórz szkic strony głównej z tą treścią (cała zawartość pola treści = plik, bez zmian).
   Pokaż właścicielowi podgląd na komputerze i telefonie. Sprawdź:
   - „Ile kosztuje arena?” ma karty z cenami; na telefonie przewijają się w bok,
   - w sekcji dla gmin są logo miast,
   - na telefonie nie ma przewijania strony w bok,
   - działają: suwak „przed/po”, planer, Studio, formularz.
4. Po akceptacji opublikuj treść na stronie 3462 i wyczyść cache LiteSpeed.
5. Odtąd każda zmiana strony głównej to podmiana **jednego** bloku: znajdź blok z komentarzem `<!-- gf-blok: NAZWA -->`
   i zastąp go w całości plikiem `bloki/NN-NAZWA.html` (plik zawiera też `<!-- wp:html -->` i `<!-- /wp:html -->`).

Bloki: styl, naglowek, boiska, planer, ceny, nawierzchnie, samorzady, dla-kogo, realizacje, studio, autor, materialy,
plakaty, pilka, zestawy, na-twoim-placu, warsztat, wspolpraca, jak-to-dziala, pytania, kontakt, skrypty.
Blok `naglowek` otwiera, a `kontakt` zamyka wspólny kontener `<div class="gfs">`, więc tych bloków nie usuwaj
i nie zmieniaj ich kolejności.
