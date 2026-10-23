# Powiązanie wersji Studio i OS — 23.10.2026

Pliki projektu umożliwiają jawne powiązanie dwóch snapshotów: pełnego Project Studio i konfiguracji Systemu modułowego. Jest to zapis referencyjny użytkownika, a nie potwierdzenie identyczności konstrukcji. Nie zmienia projektu, szkicu, historii, cen ani specyfikacji technicznej.

## Kontrakt

`GF-PROJECT-OWNED-REFERENCE-1` zachowuje pełny zwalidowany Project, także grafiki, i znormalizowany config OS. Zawiera SHA256 konfiguracji oraz przypięte rewizje źródła modelu Studio, silnika, katalogu, rejestru i odtworzonych instancji OS. Dołączone wejściowe `bom` nie jest źródłem ilości. SHA dokumentuje integralność danych; nie jest podpisem autora ani zatwierdzeniem inżynierskim.

Powiązanie wymaga całej konstrukcji OS i zgodnej rodziny; warianty Circle wymagają również zgodnej liczby poziomów. Nie wystarczy nazwa boiska lub elementu. Pojedynczy komponent pozostaje wynikiem niezależnego inspektora. Brak źródła lub niezgodna rewizja uniemożliwia utworzenie albo weryfikację powiązania.

Ponowny import odtwarza dane z config i kontroluje hashe oraz bieżące przypięte rewizje. Zmiana aktywnego Project oznacza, że zapis dotyczy wcześniejszej wersji; nie przypisuje ilości do nowej. Odczyt nowego pliku i błędy usuwają wcześniejszy wynik. Spóźnione odczyty i obliczenia nie zastępują nowszego wyniku. Limit pliku powiązania: 13 MB; natywny plik OS zachowuje limit 100 kB. Grafiki nie są po cichu pomijane.

## Granica dowodowa

Zgodność geometryczna pozostaje `UNCONFIRMED`, `manufacturingReady=false`, a techniczny BOM pozostaje pusty (`rows=null`). Rejestr cyfrowych artykułów nie zatwierdza połączeń ani kompletności konstrukcji. Circle OS ma średnicę podłoża 7,1 m przy modelu Studio 6 m; Grid ma również różnice obrysu. Nawet zgodny wymiar referencyjny Octagon nie dowodzi zgodności wszystkich trójkątów i transformacji.

Następny etap techniczny wymaga zatwierdzonego mapowania geometrii, połączeń, rozstawów i artykułów wykonawczych. Dopiero wtedy można opracować wiarygodny BOM powiązany z modelem oraz pełną wycenę. Obecny zapis jest przenośną referencją dwóch wersji danych, bez migracji formatu Project.


## Weryfikacja

PASS: TypeScript, build, test:studio (w tym project-owned-reference), quote-engine/construction-pricing. Testy domenowe sprawdzają pełne grafiki, kanoniczne SHA, powtarzalność niezależną od kolejności kluczy, niezmienność wejść, odrzucanie zmienionych i starych rewizji, nieznanych pól, rodziny/poziomów i limitów JSON.

[10 scenariuszy przeglądarkowych](project-owned-reference-2026-10-23/browser.json) na 375/1440 px: rzeczywisty download pełnego Project z SVG, ponowny import, zgodność/historyczny/powrót, usunięcie sukcesu po błędzie, odrzucenie innej rodziny oraz spóźniony odczyt. Pełny aktywny Project, liczba zapytań cenowych i prezentowana cena pozostały bez zmian podczas operacji referencyjnych. Test używa izolowanych kontekstów i lokalnego zbudowanego Workera. Początkowe oczekiwanie harnessu nie obejmowało opóźnionej wyceny celowo importowanej grafiki; poprawiono synchronizację z właściwą odpowiedzią, bez zmian aplikacji.

Surface: 7 rozmiarów, klawiatura, materiały, JSON i trzy kamery PASS. Pełna regresja mobilna jest bramką publikacji i jej wynik zapisujemy w raporcie wydania. Nie powtarzano macierzy czasowej renderera: kod renderera i źródła modeli pozostały bez zmian.


Bramki publikacji23.10: TypeScript/build/test:studio/quote-engine/construction-pricing PASS;10przypadków przeglądarkowych375/1440 z pełnym SVG, statusami i ochroną spóźnionego odczytu PASS; Surface7rozmiarów PASS; pełne test:mobile PASS (96scen aren,48Street,16zmian materiałów, JSON i Radar,375/390/430/1440).
