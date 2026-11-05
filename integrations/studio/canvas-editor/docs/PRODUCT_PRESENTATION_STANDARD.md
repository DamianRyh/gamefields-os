# Standard prezentacji produktów — 2026-10-29

Właściciel wskazał `product-quality/approved-reference.png` jako wzorzec jakości: białe tło, miękkie zacienienie przy podstawie, matowy lakier, czytelne detale, naturalny metal bramek, perforacja bez grubego rastra. Plik i SHA są zachowane obok dokumentu.

## Pierwszy etap: Panna Play i Panna Court

Nowy moduł Three.js jest ładowany dopiero dla o1/p1. Wykorzystuje istniejące geometrie, zatwierdzone rewizje i konfigurację klienta. Dodaje materiały fizyczne, odbicia środowiska generowanego lokalnie, światło główne i wypełniające, mapę cienia oraz przybliżenie zacienienia styku z podłożem. Perforacja korzysta z pochodnych i antyaliasingu sprzętowego. Nawierzchnia zachowuje wzór i mapy materiału, a bandy kolory, tekst i logo.

Podczas intensywnego obrotu rozdzielczość spada; po 220 ms bez zmian wraca do limitu DPR 2. Nie działa ciągła pętla renderowania. Mapa cienia jest aktualizowana dla nowej geometrii, nie dla każdego obrotu kamery. Zasoby są zwalniane przy zmianie modelu. Jeśli nowy silnik nie wystartuje, podgląd przechodzi na istniejący WebGL1. Inne rodziny korzystają z dotychczasowego renderera.

Warsztat czeka na dopracowaną klatkę przed zrobieniem miniatury. Pomoc CREW w Studio jest przyciskiem w pasku narzędzi. Usunięto kolizję pływającego paska przewodników z przyciskiem pobierania JSON; przewodnicy i rozmowy nadal są dostępne po otwarciu pomocy.

## Kryteria kontroli

- Porównanie tej samej geometrii, podobnego kadru i koloru z referencją; kontrola samych konstrukcji i konfiguracji z nawierzchnią.
- Brak migotania paneli, poszarpanych sylwetek, prześwietlonych bramek i nienaturalnie ciemnego cienia.
- Zmiana kolorów, logo/tekstu, czterech materiałów, modelu i obrotu pozostaje sprawna.
- Brak błędów GPU, poprawna izolacja danych projektowych, fallback i brak stałej pętli podczas bezczynności.
- Podgląd mobilny oraz desktop. Kontrola eksportu i Warsztatu.

## Dowody i status

`tests/studio-realism.mjs` sprawdza o1/p1 na 390/1440 px, materiały, obrót, kolor, idle i fallback. `tests/product-quality-fixture.mjs` robi kontrolne ujęcia aktualnej geometrii bez podłoża (nie jest stroną produktu). `tests/studio-workshop-preview.mjs` sprawdza miniatury i osadzenie. Zrzuty są w lokalnym `outputs/product-quality/` i `outputs/studio-realism/`.

To pierwsze wdrożenie nowego standardu; zaliczenie testów technicznych nie oznacza automatycznie zgodności wizualnej z referencją. Przybliżenie cienia kontaktowego nie jest pełnym globalnym oświetleniem ani renderem śledzącym promienie. Po porównaniu wizualnym dalsze prace obejmą dostrojenie kolorów/metaliczności, światła i kadrów oraz kolejne rodziny produktów. Brak deklaracji identycznej jakości na wszystkich telefonach.
