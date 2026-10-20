# Jedna kolekcja boisk: WordPress, OS i Studio

Wdrożenie 20.10.2026 do istniejących stron WordPress: 3462 `/` oraz 3465 `/boiska-street-football/`. Bez nowych stron produktów.

- Katalog: osiem obecnych modeli, stałe kody GF-CT-001–008, jednolite WebP z renderów Blender, trzy kolumny na komputerze / jedna na telefonie, filtry kształtu i tabela tych samych modeli.
- Osiem przejść `/os/?module=...`; siedem przejść `/konfigurator-boisk/?arena=...`. W-1 zachowuje własny podgląd, z możliwością zapytania o konfigurację.
- Strona główna: sekcja wyboru konstrukcji, wejście do katalogu/3D, wspólna etykieta Boiska.
- Formularz: nowe identyfikatory produktów dodane do istniejącej obsługi gf_product. Nie nadpisano starych aliasów ani nie wysyłano testowego zapytania.
- Jedynie rendery marketingowe są publiczne. Źródłowe PDF/STEP/DXF, Blender i robocze karty wewnętrzne nie zostały podlinkowane. Propozycje nowych nazw nie są opublikowane.

`catalog.html` jest końcowym blokiem istniejącej strony 3465. `homepage-product-entry.html` jest nową sekcją strony głównej. `media.json` zawiera rzeczywiste URL-e obrazów WordPress. `public/catalog/products.json` jest publicznym rejestrem modeli i przejść. Kopia renderów w `public/catalog` pozwala odtworzyć media.

Zmiany WordPress wykonano punktowo przez content/edit. GitHub nie publikuje automatycznie treści WordPress. Cofanie: rewizje stron WordPress; zachowano lokalne kopie sprzed zmian. Starszych stron produktowych nie usunięto ani nie przypisano arbitralnie do nowych modeli.

Weryfikacja: filtry 4/3/1, osiem kart i osiem wierszy porównania, brak przepełnienia poziomego przy 390 px, potwierdzone wczytanie Octagonu w OS i wybór Octagonu w Studio, dołączenie W-1 do formularza. Nie badano dostarczania wiadomości, pełnej zgodności WCAG ani wszystkich konfiguracji Studio. Wizualizacje nie zastępują zatwierdzonej dokumentacji wykonawczej.
