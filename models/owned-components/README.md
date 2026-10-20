# System wyłącznie z komponentów Gamefields

Decyzja użytkownika 20.10.2026: jedna zgodna rodzina na boisko. Publiczny system modułowy korzysta z rzeczywistych GLB, bez generycznych brył, dowolnego skalowania, dodawanych znikąd piłkochwytów i przykładowych cen.

13 komponentów wydzielono przez kopie obiektów z modeli Street Field, Octagon i Circle Cage. Eksport stosuje wyłącznie przesunięcie i obrót; skala pozostaje 1:1. `provenance.json` zachowuje obiekty źródłowe i sumy SHA-256. Pliki publiczne znajdują się w `public/models/gamefields/owned-modular/assets/`.

- Street Field: osobne panele długości, szerokości, wejście, panel bramkowy i słup; liczba całych modułów określa wymiar. Nie miesza się wariantów długości i szerokości.
- Octagon: ośmiobok o stałym kącie i obrysie, własne panele standardowe, bramkowe i wejściowe oraz słupy.
- Circle Cage: osiem łuków 45°, stały promień, własne wejścia/bramki i odwrócony górny moduł wejścia. Jeden lub dwa poziomy odpowiadają istniejącym wariantom 1.0/2.0.
- P-1, Panna Kids O-1, W-1: oryginalne konstrukcje i ich istniejące komponenty K/PO/RW. Bez generowania nowych połączeń, których nie potwierdzają źródła.
- Street Football 15 × 10: zachowany oryginalny model złożony; jego obecny eksport jest zagregowany, więc nie oferujemy nieistniejących osobnych modułów.

Nawierzchnia pomocnicza jest osobną warstwą, nie elementem stalowej konstrukcji. Zestawienie i zapis JSON wyprowadzane są z rzeczywistych instancji; import waliduje rodzinę, identyfikatory oraz zakresy i odrzuca obce części/URL/skale. Nie jest to zatwierdzenie połączeń, fundamentów lub obliczeń konstrukcyjnych.

Kod: `components/gamefields/owned-modular/`. Build: `node scripts/build-owned-modular.mjs`; włączony w dotychczasowy `build:modular:review`. Istniejący domyślny widok modular-3d osadza nowy edytor, pozostałe natywne widoki produktów zachowane. WordPress /os/ używa tego samego zasobu dla zakładek modułów i komponentów.

Sprawdzone: testy silnika rodzin i niepoprawnych importów, TypeScript, modular-product, source-components, build, modular-review oraz podgląd wszystkich rodzin w WebGL na komputerze i telefonie.
