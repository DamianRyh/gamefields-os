# Cyfrowy rejestr artykułów i specyfikacja — 22.10.2026

`public/catalog/component-registry.json` obejmuje 56 istniejących cyfrowych elementów, stabilne articleId/family/revision/unit i SHA256 źródła. Hash każdego źródła sprawdzono z biblioteką lokalną przed utworzeniem rejestru. Do publicznego rejestru nie kopiowano wewnętrznych modeli ani raportów wykonawczych. Wszystkie wpisy mają approval i connectionApproval UNCONFIRMED. Jest to inwentaryzacja źródeł, nie zatwierdzony katalog zakupowy.

`componentBill` obsługuje osobny kontrakt GF-DIGITAL-ASSEMBLY-1. Odrzuca nieznane artykuły, mieszanie rodzin, rozbieżne rewizje, powtórzone identyfikatory instancji i parametry URL/asset/scale. Ilości wynikają z instancji, a nie nazw dekoracji. Wynik zawsze pozostaje manufacturingReady=false. Adapter jest przygotowany do integracji; Studio nie uzyskuje edytora technicznych instancji przez samą obecność rejestru. Nie zmieniono istniejącego silnika montażu OS.

W Podsumowaniu istniejącego Studio przycisk „Pobierz specyfikację projektu JSON” eksportuje GF-PROJECT-SPECIFICATION-1: pełny zwalidowany Project z grafikami, SHA256 kanonicznej konfiguracji, stabilny produkt i rodzinę, rewizję modelu i katalogu, obecne ilości nawierzchni oraz swobodne obiekty oznaczone DECORATIVE_OR_CONCEPTUAL. Lista dostępnych artykułów rodziny nie jest zestawieniem części użytych w projekcie.

`technicalBill.rows=null` — brak danych nie staje się zerem ani automatycznym BOM. Ceny nie są utrwalane w tym pliku: aktualna orientacyjna kalkulacja pozostaje w Studio, z nieznanymi zakresami. Specyfikacja nie jest dokumentacją wykonawczą. Nie podmieniono R02, modeli, stawek ani schematu Project.

Testy `component-specification.mjs`: 56 unikalnych artykułów, rodziny/revizje/źródła, niedozwolone zasoby/skala, ilości z instancji, stabilny hash przy przestawieniu kluczy, zmiana hasha po edycji koloru, pełna grafika, brak awansu nazwy dekoracji na artykuł. Rejestr ma SHA256 z artykułów posortowanych kluczami. Zmiana źródła wymaga ponownej weryfikacji i rewizji rejestru.

Dalszy etap S4: potwierdzone połączenia i artykuły komercyjne, jawny adapter z instancji OS do Studio i ich ilości. S5-04: specyfikacja konfiguracji gotowa; specyfikacja techniczna/BOM nadal zależy od tych danych. Pozostałe stawki i fizyczne badania pozostają otwarte.

## Wyniki tego wydania

PASS: TypeScript, build, test:studio, quote-engine, construction-pricing i pełna regresja mobilna (96 aren,48Street,16materiałów,375/390/430/1440,JSON i Radar). `verify-component-registry.mjs` potwierdził56 źródeł; przy rozdzielonych checkoutach podaj oba katalogi źródeł jako argumenty. Ręcznie pobrano specyfikację Octa i niezależnie przeliczono identyczny SHA w Node. Na375px dokument ma375px, przycisk50px wysokości i tekst16px. Bez testu fizycznego telefonu i bez wysłania zapytania.
