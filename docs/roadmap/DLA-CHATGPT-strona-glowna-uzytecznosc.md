# Dla ChatGPT: strona główna, użyteczność (Baymard), 16.11.2026

## Co się zmienia

- **Menu:** nowa pozycja „Ceny” (po „Boiska”), w motywie i na stronie głównej.
- **Kafelki boisk:** pod nazwą cena „od … zł netto”.
- **Kolejność sekcji:** po cenach od razu zdjęcia z realizacji („Z boiska.”), a sekcje dodatkowe (materiały, plakaty, zestawy, warsztat) są niżej.
  Ścieżka decyzji: co → ile kosztuje → dowody → czy się zmieści → nawierzchnie → gminy → dla kogo → Studio → autor → jak to działa → dodatki → pytania → kontakt.
- **Ceny na telefonie:** pionowa lista zamiast przewijania w bok.
- **Ceny:** pod listą krótka lista „co zawiera cena / bez czego”.

## Kolejność: najpierw motyw, potem strona

Strona wskazuje nową wersję skryptu motywu. Motyw musi być na serwerze pierwszy.

### A. Motyw Gamefields 1.0.27 → 1.0.28 (zrób kopię trzech plików przed zmianą)

1. Podmień cały plik `wp-content/themes/gamefields/assets/js/home/gf-home.js` na:
   - plik: https://raw.githubusercontent.com/DamianRyh/gamefields-os/main/integrations/wordpress/theme/gamefields/assets/js/home/gf-home.js
   - SHA-256: `af60a6a8ef86bf66f5e4d668162c2397177ea4199a69237e20d20750579484ba`
2. `functions.php`:
   - zmień `define( 'GFT_VERSION', '1.0.27' );` na `define( 'GFT_VERSION', '1.0.28' );`
   - w funkcji `gft_nav_items()`, zaraz po linii `array( 'Boiska', home_url( '/#boiska' ), '' ),`, dodaj linię:
     ```php
     		array( 'Ceny', home_url( '/#ceny' ), '' ),
     ```
3. `style.css` motywu: zmień `Version: 1.0.27` na `Version: 1.0.28`.
4. Sprawdź dowolną podstronę (np. /realizacje-dla-miast/): w menu jest „Ceny” i prowadzi do /#ceny.

### B. Strona główna (ID 3462)

Strona ma 22 bloki. Zmienia się treść 5 bloków i kolejność. 17 bloków ma treść identyczną jak teraz, tylko stoi w innym miejscu.

1. Zrób kopię obecnej strony.
2. Pobierz nową treść:
   - plik: https://raw.githubusercontent.com/DamianRyh/gamefields-os/main/integrations/wordpress/homepage/studio-2026-11/homepage.html
   - SHA-256: `603296327aa9246ee956278a4d3f197eee2caa1686218028cbe49443a86f2e4f`
   - 22 bloki, brak `&&`.
3. **Sprawdzenie bezpieczeństwa:** porównaj nowe bloki z obecnymi po nazwie (`<!-- gf-blok: NAZWA -->`).
   - Zmienione mogą być **tylko**: styl, naglowek, boiska, ceny, skrypty.
   - Pozostałe 17 musi być identycznych znak w znak.
   - Jeśli coś innego się różni, przerwij i napisz właścicielowi.
4. Nowa kolejność bloków:
   styl, naglowek, boiska, ceny, realizacje, planer, nawierzchnie, samorzady, dla-kogo, studio, autor, jak-to-dziala,
   materialy, na-twoim-placu, zestawy, plakaty, pilka, warsztat, wspolpraca, pytania, kontakt, skrypty.
5. Przygotuj szkic z nową treścią. Pokaż podgląd na komputerze i telefonie i sprawdź:
   - kafelki boisk mają ceny „od”,
   - w menu jest „Ceny”,
   - po cenach są zdjęcia „Z boiska.”,
   - na telefonie ceny są w pionowej liście,
   - strona nie przewija się w bok.
6. Po akceptacji opublikuj i wyczyść cache LiteSpeed.
