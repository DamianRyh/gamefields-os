# GAMEFIELDS Makeover — faza 1 (bez wdrożenia)

Status: eksperymentalny komponent prezentacyjny na osobnej gałęzi. Nie jest podpięty do publicznego Studio ani WordPressa.

## Audyt istniejących zasobów (28.10.2026)

- Studio ma `StreetFootballRealisticPreview`, z geometrią 15 × 10 m i homografiami kalibrowanymi do pięciu zestawów scen: park, szkoła, podwórko, Warszawa/PKiN i Kraków/Rynek.
- `PannaStudioPreview` wykorzystuje prawdziwy model/parametry projektu do renderingu 3D.
- `/workshop-preview` generuje podgląd 3D z zapisanej publicznej konfiguracji, bez mutowania szkicu.
- Workshop używa istniejącej bazy D1 i `/api/workshop`, ze świadomym zapisem, sanitizacją danych i możliwością wycofania projektu.
- Mapa PLAY i zgłoszenia miejsc są odrębnym produktem. Nie ingerujemy w PR #13 ani jego mechanizmy poparcia.

## Dodany element

`components/makeover-comparison.tsx`: samodzielny, responsywny komponent do porównania **dwóch wcześniej przygotowanych i wzajemnie wyrównanych** obrazów. Ma natywny suwak sterowany klawiaturą, podpisy alternatywne, jawne oznaczenie wizualizacji koncepcyjnej oraz brak zależności od zewnętrznych usług.

Przykładowe użycie po przygotowaniu zgodnych obrazów:

```tsx
<MakeoverComparison
  beforeSrc="/approved-before.jpg"
  afterSrc="/approved-concept.jpg"
  beforeAlt="Istniejące boisko asfaltowe"
  afterAlt="Proponowana nawierzchnia sportowa GAMEFIELDS"
  locationName="Przykładowa lokalizacja"
/>
```

## Granice funkcji

1. Oba zdjęcia muszą reprezentować tę samą perspektywę, pole kadru i odpowiednio wyrównaną geometrię. Komponent **nie** dopasowuje zdjęć.
2. Nie można bez walidacji przepinać dowolnego zdjęcia mieszkańca pod kalibrację scen 15 × 10 m.
3. Używać tylko obrazów, do których istnieją prawa/licencje i zgoda na publikację.
4. Nie prezentować takiego porównania jako dokładnego projektu wykonawczego.
5. Nie publikować prywatnej lokalizacji ani prywatnego zdjęcia bez odpowiedniej weryfikacji.
6. Nie łączyć anonimowego Workshop D1 z danymi osobowymi lub kontami PLAY bez oddzielnego projektu bezpieczeństwa.

## Kolejne etapy

- **Faza 2:** read-only strona testowa w Studio z wyborem zapisanej konfiguracji i zaakceptowanej pary zdjęć (bez automatycznej publikacji).
- **Faza 3:** kontrolowane narzędzie ustawienia punktów referencyjnych na zdjęciu użytkownika, z podglądem błędów wyrównania i możliwością odrzucenia ujęcia.
- **Faza 4:** przyłączenie do odrębnego procesu zgłoszenia lokalizacji i leadów, dopiero po decyzji, która aplikacja oraz baza są źródłem prawdy.
- **Faza 5:** testy Playwright 390/768/1440, accessibility, przypadki błędów ładowania i prawa do mediów; dopiero potem rozważać integrację w UI.

Nie uruchomiono builda i testów CI z tego środowiska. Brak publikacji.

## Faza 2 — eksperymentalna kalibracja czteropunktowa (28.10.2026)

Dodano `lib/makeover-calibration.ts` i route `/makeover-calibrate` w mirrorze Studio. Użytkownik lokalnie wczytuje JPG/PNG/WebP (do 8 MB), wyznacza cztery narożniki płaskiej nawierzchni w kolejności TL → TR → BR → BL, a narzędzie oblicza homografię i nakłada publiczną miniaturę SVG rzeczywiście zapisanej konfiguracji Workshop (`/api/workshop?id=...&format=svg`). Wynik można pobrać do PNG. Zdjęcie nie jest wysyłane na serwer, a praca nie jest publikowana.

Kontrole wstępne: skończone współrzędne, narożniki w obrębie kadru, wypukły czworokąt, brak kolinearności, minimalne długości krawędzi, obrazy maksymalnie 1800 px na dłuższym boku. Algorytm używa podziału na trójkąty i przekształceń afinicznych do aproksymacji homografii.

**Granice:** to wizualizacja nawierzchni (2D), nie osadzenie konstrukcji 3D w fotografii; nie odtwarza przesłonięć, cieni ani rzeczywistej geometrii działki. Cztery punkty nie zapewniają metrów w świecie rzeczywistym. Przy obiektywie szerokokątnym oraz nierównej powierzchni potrzebna jest dodatkowa korekta. Widok nie jest połączony z publiczną nawigacją ani z formularzami. Brak builda i testów przeglądarkowych w tym środowisku; przed integracją należy wykonać TypeScript, build, E2E na 390/768/1440, kontrolę perspektywy na zdjęciach testowych i przegląd dostępności.


## Faza 3 — izolowany cutout 3D i ręczne osadzenie (28.10.2026)

- `app/workshop-cutout`: read-only render istniejącej konfiguracji, oparty o `PannaStudioPreview`; z przezroczystego canvas WebGL pobierany jest rzeczywisty obrys alfa i wysyłany jako PNG (do 2,8 mln znaków base64) wyłącznie do zweryfikowanego `parentOrigin`. Nie dodaje białego tła.
- `app/makeover-3d-lab`: lokalne zdjęcie JPG/PNG/WebP, nakładka autentycznego renderu 3D, ręczna korekta położenia, rozmiaru, obrotu i przezroczystości, eksport PNG.
- Użyte istniejące formaty, renderer, endpoint odczytu Workshop i walidacja projektu. Brak nowego GLB, brak drugiego silnika i brak mutacji w D1.

**Ważne:** to nie jest jeszcze fotogrametryczna kalibracja pełnego modelu 3D. Ortograficzny renderer i cztery narożniki płaskiej nawierzchni nie wystarczają do odzyskania wszystkich parametrów kamery telefonu; brak też obsługi obiektów przesłaniających, światła i cieni. Suwaki w /makeover-3d-lab służą tylko do poglądowego ustawienia. Nie używać do ofert z wymiarem ani dokumentacji wykonawczej.

Przed merge: potwierdzić transparentne piksele na prawdziwych scenach w Chrome/Safari i mobilnie; sprawdzić brak białych elementów od tekstur, rozmiary payloadów, zgodność identyfikatorów, brak race-condition przy zmianie projektu, testy TS/build/Playwright, dostępność. Dodać timeout przy renderingu i komunikat o błędzie iframe. Dopiero po tym wdrażać wspólną kalibrację kamery dla 3D (minimum dopasowanie orientacji i skali na znanych wymiarach oraz test obrazowy).


## Faza 4 — solver perspektywicznej kamery i review eksperckie (28.10.2026)

Dwóch niezależnych recenzentów przeanalizowało matematykę i kod poprzednich etapów. Kluczowy wniosek: dotychczasowy `Renderer` rysuje ortograficznie (stałe clip-W=1), więc czteropunktowej homografii nie wolno stosować do gotowego PNG 3D — zniekształcałoby to wysokości. Poprawna metoda wymaga osobnego trybu perspektywicznego i kalibracji osi modelu.

Nowy moduł `lib/makeover-perspective-camera.ts`:

- Buduje homografię z rzeczywistych wymiarów L × W (metry) do czterech narożników (piksele).
- Przy znanym parametrze `focalPx` używa go w macierzy K; bez niego wyznacza ograniczoną estymację i zawsze oznacza ją jako przybliżoną.
- Dekomponuje kolumny K^-1 H, ortonormalizuje osie i wyznacza translację, sprawdzając dodatnią głębokość.
- Zwraca błąd reprojekcji RMS i maksimum w pikselach oraz flagę `quality`, nigdy nie deklaruje certyfikowanej dokładności.
- Dołącza `tests/makeover-perspective-camera.mjs` z syntetyczną kamerą, rzutem narożników, znanym/estymowanym f i degenerate-case. Test jest przygotowany, lecz nie został uruchomiony w tym środowisku.

Poprawki z review wdrożone w poprzednich modułach:
- Warp wzoru powstaje na osobnym canvas, a alfa jest stosowana raz — bez ciemnych szwów w zachodzących trójkątach.
- Wczytywanie zdjęć używa generacji/tokenu, aby opóźniony wynik nie nadpisał nowszego pliku.
- Cutout raportuje błędy do weryfikowanego parent iframe, a 3D lab ma timeout.

**Blokady przed integracją 3D:**
1. Testy solvera, stabilności reprojekcji i poprawnej osi +Y w syntetycznych kadrach.
2. Opcjonalna projekcja perspektywiczna w rendererze bez modyfikacji domyślnego trybu Studio.
3. Per-model ground-anchor transform: różne GLB/JSON mają odmienne układy lokalne.
4. Przypadki szerokokątnych obiektywów, dystorsja, przesłonięcia, cienie i skala.
5. Testy TS/build/Playwright/Chrome/Safari/mobile oraz alternatywne wprowadzanie punktów dla klawiatury.

Gałąź nadal eksperymentalna, bez merge i bez publikacji.
