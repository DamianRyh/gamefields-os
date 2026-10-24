# Priorytety po Studio88 — wykonany zakres i granice

## Street Field i renderowanie

Profil1440px rozdziela zgłoszenia PNG, oczekiwanie obrazów, uploady, draw i długie zadania. PoprzednieABBA85/87 pozostaje historycznym wynikiem mieszanym; instrumentowane5powtórzeń nie jest jego zamiennikiem ani pomiarem GPU/FPS. Cache lokalizacji uniformów i atrybutów należy do jednej instancji programu. Szerokość grafiki panelu jest przechowywana w WeakMap po referencji niezmiennych wierzchołków. Geometria, formuła szerokości, rasterPNG, UV i tekstury pozostają takie same.

Wstępny profil88/kandydat zachował trzy dokładne obrazy oraz liczbę4PNG,4wczytańPNG,14uploadów i135drawArrays na edycję. Wyszukania uniformów1374→0, atrybutów405→0 po rozgrzaniu programu. Czasy były mieszane: nie deklarujemy ogólnego przyspieszenia ani zamknięcia budżetu wydajności. Końcowy profil wiąże faktyczne hashe pakietów z receipt źródła wydania; jest publikowany obok centralnego raportu. PNG/upload i warunki urządzenia nadal mają koszt.

## O1, błędy i ponowienie

- Model: przerwanie fetch po15s; pusta odpowiedź też jest błędem. Zewnętrzna geometria jest przypisana do konkretnego modelu, nie przenoszona do innego modelu podczas zmiany.
- Obraz i tekstury materiałowe:20s, usunięcie nieudanego wpisu z cache P1, odpięcie callbacków po sukcesie/błędzie/timeout, jawne ponowienie.
- Generacja podglądu: watchdog30s kończy nieskończone oczekiwanie; martwy renderer nie czyści ani nie publikuje zakończenia. Token tekstury blokuje także stare zadanie, gdy nowa próba używa tego samego klucza (ABA).
- Utrata WebGL: komunikat i przycisk ponowienia, nowy canvas/renderer; brak automatycznego resetowania Project. Hotspoty nie zasłaniają przycisku odzyskiwania.
- Usunięto dodatkową generację wyzwalaną wyłącznie przez ready. Cleanup używa własnej instancji renderera. Ręczne retry nie zmienia projektu lub wyceny.

Kontrolowane testy375/1440 obejmują zatrzymane obrazy/model/logo, watchdog, rzeczywistą utratę kontekstu, retry i późne wyniki.40normalnych nawigacji O1 przeszło. Osobny obserwator rAF w diagnostyce zgłosił timeout przy DOM już ready=true/request=complete, załadowanym obrazie i aktywnym WebGL; zachowano jego raport. Interwałowy odczyt gotowości rozwiązał problem obserwacji w nowym harnessie. Nie dowodzi to identycznej przyczyny pierwszego historycznego przerwaniaABBA bez diagnostyki. Błędy z tych prób są jawne w preflightJSON, nie usunięte z raportów.

## Porównanie wariantów3D

W Plikach projektu zaznacz dwa zapisy i włącz porównanie3D w dużym oknie modalnym z obsługą Escape i powrotem fokusu. Wspólna kamera Boczny/Zgóry/Zboiska i przełączanie A/B używają jednego dodatkowego canvasu na żądanie. Plany2D, parametry i aktualne ceny obu zapisów pozostają dostępne. Zamknięcie/odznaczenie usuwa dodatkowy renderer. Stara rewizja nie jest rysowana aktualną geometrią. Projekt bez modelu zachowuje plan2D.

Podgląd używa istniejących modeli konstrukcji, kolorów/wykończenia, panelowego logo/tekstu i nawierzchni z obiektami court. Lista „widoczne tylko na planie2D” jawnie pokazuje wyposażenie poglądowe oraz grafikę poza nawierzchnią. Nie udajemy dostępności brakujących własnych modeli3D akcesoriów. Pełne odwzorowanie każdego swobodnego obiektu i historycznych modeli pozostaje poza ukończonym zakresem. UI nie modyfikuje Project/IndexedDB; porównanie nie zatwierdza geometrii.

## Geometria i BOM

Powtórzono generator8rewizji/25zasobów dwa razy; JSON identyczny SHA256`e47ae0f8244d1375e9c7e124ae0ee8fc9019cc4659c415ac90649aa86565efef`. Poprawiono nieaktualny opisF04:26zarejestrowanych artykułów istnieje, potwierdzonego złożeniaOS nadal brak. Wszystkie56artykułów zachowują UNCONFIRMED; technicalBill.rows=null, manufacturingApproved=false.

[Publiczna checklista](ENGINEERING_COMMERCIAL_GAPS.md), [szablon wejściowy](../pricing/engineering-input-template.json). Szczegółowe arkusze dokumentacji wewnętrznej nie są publikowane w publicznym repo. Do wykonawczego BOM nadal potrzebne zatwierdzone instancje, połączenia, kotwienie i fundamenty. Brakujących parametrów bezpieczeństwa nie wypełniamy zgadywanymi liczbami.

## Robocze stawki na polecenie właściciela

Właściciel potwierdził brak danych i polecił „podłóż wartości”. Osobna kartaGF-WORKING-2026-10-23-v1 ma6nawierzchni,29typów wyposażenia z UI, montaż8konstrukcji,4poziomy grafiki, linie, branding, wykończenie, projekt i transport. Osiem dotychczasowych cen konstrukcji zachowano. API i UI jawnie oznaczają workingAssumptions; brutto/VAT pozostaje niepotwierdzone, a nieznane dodatki nadal dają wynikpartial. To roboczy budżet, nie oferta lub zatwierdzony koszt wykonania.

Dokładne kwoty i zakres: [WORKING_RATES.md](WORKING_RATES.md). Test192kombinacji oraz niezależnie sprawdzony przykładOcta[kwota archiwalna]netto potwierdzają arytmetykę, nie ceny rynkowe. Referencje dostawców służą kontroli rzędu wielkości; podział kosztów jest przyjętym założeniem. Środowisko produkcyjne otrzymuje kartę przez natywne narzędzieSites, nie przez hosting.json; poprzednia karta jest zachowana.

## Kontrola wydania

TypeScript/build/domain, pełne mobile+nowe areny+Surface,58przypadków stron Circle,84porównania rastra,60stanów tekstur, niezależne ceny i porównanie3D oraz fault-injection są bramkami przed publikacją. Dokładny wynik i receipt są w centralnym raporcie po ich zakończeniu. Fizyczne urządzenia, zatwierdzenie techniczne i finalna oferta pozostają osobnymi zależnościami. Nie oznaczamy całego planu jako ukończonego.
