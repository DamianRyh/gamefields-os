# Prosty podział Studio i progresywna grafika — 25.10.2026

Na podstawie oznaczonego przez właściciela zrzutu WhatsApp16:20 usunięto przełącznik Model3D, globalny Plan edycji obiektów, link Radar·mapa oraz powtarzane tytuły Konstrukcja/Nawierzchnia/Grafika i nazwy sekcji karuzel. Trzy narzędzia pozostają w głównej nawigacji. Nazwy produktów i odcieni nadal identyfikują karty; etykiety sekcji zachowano dla technologii asystujących. Pliki projektu są pod ikoną folderu w górnym pasku. Radar nadal istnieje jako osobna strona, lecz nie jest skrótem na scenie Studio.

## Podział i większe podglądy

Dwie równe części przestrzeni roboczej po odjęciu niezbędnego paska/nawigacji: telefon pionowo (model nad wyborem), szeroki ekran i krótki poziom obok siebie (model po lewej, wybór po prawej). Nie oznacza to dwóch połówek pełnego fizycznego ekranu razem z chromem przeglądarki. Scena pozostaje nieruchoma; przewija się panel. Nazwa projektu jest edytowalna bezpośrednio na scenie. Karty mają duże kwadratowe podglądy i swipe, kliknięcie, strzałki, klawiaturę. Zatwierdzenie swipe jest blokowane podczas aktywnego dotyku i czeka350ms od ostatniego przewinięcia, aby duża karta nie zatwierdzała się w połowie gestu. Powiększono dopasowanie modelu z78% do90% szerokości w głównym Studio; usunięto stary dodatkowy CSSzoom1.12, aby model nie wychodził poza swoją połowę. Bez zmian geometrii.

## Moduły jako standardowe narzędzie

Przycisk Budowanie modułowe prowadzi do zakładki Rozbudowa we wspólnym panelu Konstrukcji. Dla PannaGrid, PannaOcta i PannaCage90/180 parametry są od razu dostępne bez Włącz budowanie. Samo otwarcie narzędzia nie zmienia istniejącego szkicu ani ceny. Pierwsza świadoma zmiana parametru zapisuje Project.modular; cofnięcie przywraca model bazowy. Jedna zgodna rodzina na projekt, oryginalne komponenty1:1. Dla rodzin bez potwierdzonego układu nadal nie wymyślamy rozbudowy. Konstrukcja i montaż modułów pozostają do odrębnej wyceny.

## Grafika — kolejne poziomy

- Linie: istniejące dekoracje i niezależne oznaczenia sportowe.
- Logo: bezpieczny PNG/statycznySVG do2MB, widok warstw, wybór elementu.
- Tekst: treść do500znaków, kolor, położenie poziome/pionowe, rozmiar, obrót i widoczność na żywym3D.
- Po wyborze warstwy: Wyśrodkuj, Duplikuj (limit200elementów), Usuń i wspólne Cofnij/Ponów. Pozycje na okręgu ograniczone do jego wnętrza. Bez przechodzenia do osobnego planu2D.

Nie oferujemy wyboru czterech abstrakcyjnych band dla nowych grafik nawierzchni, których renderer3D nie pokazuje. Archiwalne elementy tych miejsc pozostają wJSON i mają jawne przeniesienie na nawierzchnię. Niezależne logo/tekst na stalowych panelach pozostaje w Kolory→Logo i detale konstrukcji. Dane graficzne i zabezpieczeniaSVG zachowane; kosztów lub technicznych danychBOM nie dopisywano.

## Kontrola

TypeScript, build, test:studio,160przypadków dopasowania kamery z8narożnikami; mobile375/390/430/1440 z materiałami/JSON/Radarem; moduły4rodziny×390/1440; biały mobilny układ5formatów320×568–844×390 i zmiana orientacji; karuzele390/1440 z rzeczywistym emulowanym swipe i Cofnij. Nowy studio-focus-browser320/390/1440 mierzy równe części, duży kwadratowy podgląd, nazwę na scenie, brak usuniętych kontrolek, brak niezamówionej zmiany modułów przy otwarciu, pierwszy krok+cofnięcie, tekst/logo/duplikację i JSON oraz zachowany model3D podczas edycji.

Dowody: outputs/studio-ux/focus-browser.json, integrated-browser.json, visual-carousel-browser.json i white-mobile-layout.json oraz zrzuty focus-layout/visual-design. Wyniki końcowe i publikacja odnotowane w centralnym raporcie; receipt poza checkoutem. EmulacjaChromium nie zastępuje fizycznegoSafari ani badania z klientami. Zachowane wcześniejsze ostrzeżenia wielkości chunków i ikonLeaflet.
