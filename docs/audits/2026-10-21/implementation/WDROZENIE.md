# Gamefields — realizacja zaleceń po audycie

## Wydanie pomiarów i synchronizacji tekstur — Studio81

22.10.2026: źródło `e1e6666b96e006c72ab4ebc0e0a953d36214fabf`, wersja `appgprj_6abbd0ba26f0819197701343bf156f1b~appgver_c7ff626b281481918336f9feeb61301d`, deployment `appgdep_6ad9f5cc257c81919909cfa4e060c6f2` — **succeeded**, środowisko revision3. [Studio](https://gamefields-studio.ryhfs90.chatgpt.site). Paczka `sha256:120efbb0bf9f646c765b4c12feb17f3e5537bf9a380267e500d091b2d5574613`.

PASS: TypeScript/build/test:studio, renderer-texture-jobs, quote-engine/construction-pricing, pełne test:mobile (96aren/48Street/16materiałów,JSON,Radar;375/390/430/1440) i Surface7viewport. Pełne480próbek lokalnego renderera/96komórek/0błędów; niezależna kontrola hashów, median i maksimów PASS. Poprawiono oczekiwanie na współdzielone dekodowanie/upload tekstur. Brak deklaracji porównawczego przyspieszenia v80→v81, FPS, prezentacji GPU lub testu fizycznego telefonu. Budżet liczbowy i profilowanie paneli nadal PENDING.

Kompilacja i testy ukończone po zwolnieniu miejsca; wcześniejsza blokada ENOSPC jest historyczna. Modele, cennik i SQL niezmienione; nie wysłano formularzy.

## S2-04/S6 — pierwsza baza pomiarowa renderera, 22.10.2026

**DONE — scenariusz i pierwsza lokalna baza. PARTIAL — cały etap wydajności/budżetu.** Po zwolnieniu miejsca build i pomiary zostały ukończone. Pełna macierz8modeli ×2szerokości375/1440 ×5powtórzeń ×6operacji: **480próbek,96komórek,0błędów**. Niezależny ekspert odtworzył wszystkie mediany/maksima oraz sprawdził hashe wejść i geometrii.

| Operacja | Zakres median [ms] | Maksimum próbek [ms] |
|---|---:|---:|
| startup-fresh-context | 303.7–818.8 | 4225.4 |
| startup-same-context-navigation | 320.3–924.4 | 1035.5 |
| panel-colour | 3.2–51.0 | 106.9 |
| panel-text | 187.1–2208.6 | 2218.8 |
| complex-project-import | 37.6–78.7 | 110.1 |
| complex-scene-cached-redraw | 197.0–2027.0 | 2269.3 |

Mierzono finalne wydanie draw aktualnej generacji po oczekiwaniu na jej tekstury, nie prezentację GPU ani FPS. Lokalne środowisko AppleM1/Darwin23.4.0, Node24.19.0, Chromium149.0.7827.55, SwiftShader, DPR1. Nowy kontekst nie oznacza zimnego cache systemu; druga nawigacja nie gwarantuje pełnego trafienia cache i nie zawsze była szybsza. W1 używa jawnego historycznego szkicu; pozostałe modele publicznego parametru arena.

Złożony import obejmuje walidację JSON, backup recovery i renderowanie SVG500statycznych ścieżek. Późniejsze cached-redraw jest osobną operacją. Najwolniejsza mediana tekstu paneli2208,6ms: Circle Cage2/1440. Generowanie/dekodowanie/upload/draw grafik paneli to pierwszy obszar do profilowania; sam test nie rozdziela ich kosztów. Zachowano pojedynczy start4225,4ms. Brak porównywalnego pomiaru v80, więc nie deklarujemy przyspieszenia przed/po.

Poprawka współdzieli Promise dekodowania/uploadu i leniwego generowania paneli; aktualna generacja prawidłowo oczekuje pracy, anulowana nie publikuje zakończenia. Testy pokrywają współbieżność, nadpisanie, clear/reload, błąd/retry i dispose. To poprawka synchronizacji, nie zmiana modeli czy stawek.

Zasady dalszego porównania: pięć surowych próbek każdej komórki, mediana, różnica ms/% i maksimum obu serii. Bez p95 przy n=5. Zmieniony sprzęt/runtime/fixture/DPR/cache wymaga nowej bazy. Wzrost wymaga naprzemiennego ponowienia bazowej i nowej serii; pojedynczy max nie stanowi SLA. Budżet liczbowy pozostaje PENDING do pomiaru rozrzutu między seriami i uzgodnienia celów produktu/urządzeń.

[Metoda i wyniki](../../../../integrations/studio/canvas-editor/docs/RENDERER_BASELINE.md), [surowe480próbek i hashe](../../../../integrations/studio/canvas-editor/docs/renderer-baseline-2026-10-22.json). Nie przeprowadzono testu fizycznego telefonu ani prezentacji GPU.


---



## Wydanie inspektora OS — Studio80

22.10.2026: źródło `3a75f940c647312fb9f562ef0175a6eb858bf652`, wersja `appgprj_6abbd0ba26f0819197701343bf156f1b~appgver_e459c0510a0c8191802e879a0fea8c00`, deployment `appgdep_6ad9b14bfc408191a821a28a737fad34` — **succeeded**, środowisko revision3. [Studio](https://gamefields-studio.ryhfs90.chatgpt.site). Paczka SHA256 `ed0dd62684b94b79af9be470e582e72c7972e2e72b544e8c4efc8486662585de`.

PASS: TypeScript/build/test:studio,594 konfiguracje konstrukcji+25 części, walidacje negatywne i4 odmowy SOURCE,25 hashy runtime, quote-engine/construction-pricing, pełne test:mobile i Surface7viewport. Pierwszy test mobilny zatrzymał niejednoznaczny selektor dwóch pól JSON; pola nazwano osobno, selektory doprecyzowano i pełną regresję powtórzono z wynikiemPASS.

Ręczny test zbudowanego Workera: fałszywe bom999999 pominięte, wynik28 instancji, eksport manufacturingReady=false. Aktywny Project dokładnie niezmieniony po inspekcji/pobraniu/czyszczeniu/błędzie; wynik po odświeżeniu nie jest zachowywany.375px bez przepełnienia, tabela325px/tekst16px, przycisk46px. Bez deklaracji fizycznego urządzenia lub zatwierdzenia wykonawczego.

Kontrakt: [OWNED_CONFIGURATION_INSPECTOR](../../../../integrations/studio/canvas-editor/docs/OWNED_CONFIGURATION_INSPECTOR.md). Nie zmieniono R02, stawek, SQL ani silnika aktywnego OS; nie wysyłano formularzy. Na potrzeby paczki usunięto jedynie odtwarzalne archiwa już opublikowanych wydań78/79, zachowując źródła i raporty.

---


## Historia — profil grafik Studio79

22.10.2026: źródło `6064726a56ee7f67de8dea67e8ebf535a6968ef1`, wersja `appgprj_6abbd0ba26f0819197701343bf156f1b~appgver_38006ef1d96081918b36e73454fd0ba8`, deployment `appgdep_6ad9aaf1e1288191bdc0aeb4d418280a` — **succeeded**, środowisko revision3. [Studio](https://gamefields-studio.ryhfs90.chatgpt.site). Paczka SHA256 `0993fcf376a91fc718280fb20440c068276fdde287bdd306b9b86b5f7edd1f32`.

PASS: TypeScript/build/test:studio, graphic-source-policy, graphic-boundaries, quote-engine/construction-pricing, pełne test:mobile oraz Surface7viewport. Ręcznie: mieszana paczka dodała poprawne SVG i odrzuciła aktywne; eksport zachował dokładne bajty poprawnego SVG i nie zawierał odrzuconego obiektu. Nieprawidłowy import pozostawił konfigurację dokładnie bez zmian; poprawny import potwierdzono nazwą. Na375px brak przepełnienia, tekst informacji14px. Bez testu fizycznego telefonu, gwarancji kosztu renderowania lub pełnej walidacji PNG.

Kontrakt: [GRAPHIC_SOURCE_POLICY](../../../../integrations/studio/canvas-editor/docs/GRAPHIC_SOURCE_POLICY.md). Nie zmieniono modeli R02, stawek ani SQL; nie wysłano formularza. Dane produkcyjne nie otrzymały testowych grafik.

---


## Historia — rejestr i specyfikacja Studio78

22.10.2026, źródło `dd5856cc2a9b67d54b09ca67bd1580ea2125bf5b`, wersja `appgprj_6abbd0ba26f0819197701343bf156f1b~appgver_f5da9ba168f48191baee4e21cf9f4152`, deployment `appgdep_6ad9a4d7865c8191934cd1af12ee1e6f` — **succeeded**, środowisko revision3. [Studio](https://gamefields-studio.ryhfs90.chatgpt.site). Paczka zgodna ze źródłem, SHA256 `1381653a8a87b566c99a2b0bd0233f09495e020f7f8381eb3427f244ddd52bb8`.

PASS: TypeScript, build, test:studio, component-specification, weryfikacja56 źródeł, quote-engine, construction-pricing i pełne test:mobile (96aren,48Street,16materiałów,JSON,Radar;375/390/430/1440). Rzeczywisty pobrany eksport ma poprawny kod GF-CT-008, powierzchnię29,823379m², pełny projekt i SHA zgodny z niezależnym odtworzeniem. Na375px brak przepełnienia, przycisk50px i tekst16px. Brak testu fizycznego urządzenia i czytnika ekranu. Bez wysyłania formularzy, zmian SQL, podmiany R02 lub stawek.

Kontrakt i ograniczenia: [COMPONENT_SPECIFICATION](../../../../integrations/studio/canvas-editor/docs/COMPONENT_SPECIFICATION.md). Rejestr cyfrowy i gotowy adapter nie oznaczają wdrożonego technicznego BOM. Jego status pozostaje PARTIAL; rows=null w specyfikacji jest celowe.

---

## Historia — wersja 77, odzyskiwanie i warianty, 22.10.2026

Źródło `d770de1a5fcb4e10c77ac80a6ff697d0d3e1b185`. Zapisana wersja `appgprj_6abbd0ba26f0819197701343bf156f1b~appgver_cbf02b25e8bc819196b71b437ff67ccd`. Publikacja: `appgdep_6ad99e344664819188ef8ec2e456a076` — **succeeded**, środowisko revision3, [Studio](https://gamefields-studio.ryhfs90.chatgpt.site). Na produkcji potwierdzono sekcje odzyskiwania i pustej biblioteki wariantów oraz działającą kalkulację Panna Octa. Nie dodawano testowych wariantów do magazynu produkcyjnego.

- S3-01: zgodny adapter Project, kopia przed zastąpieniem, ochrona uszkodzonego szkicu i błędów pamięci, pobranie surowych danych oraz jawne wznowienie. Format starych JSON i nazwy własne zachowane.
- S3-03: sześć nazwanych pełnych wariantów w istniejących Plikach projektu. Porównanie dwóch planów 2D i parametrów; przywrócenie z Cofnij i kontrolą rewizji. Cofnięcie ostatniego usunięcia działa po odświeżeniu.
- Dane pozostają w przeglądarce/profilu/kontekście strony; to nie kopia w chmurze. Porównanie nie udaje aktualnej wyceny: cena odświeża się po przywróceniu.
- Rejestr rewizji: 42 pliki zweryfikowane, sześć różnic obrysu, wszyscy kandydaci R02 z releaseEligible=false. Pełne wewnętrzne raporty zachowane lokalnie; do publicznego repozytorium trafia wyłącznie status. Bez podmiany modeli, zmiany cen i zapisów SQL.

PASS: TypeScript, build, test:studio, project-vault, draft-write, quote-engine, construction-pricing, pełne test:mobile (375/390/430/1440; 96 scen aren, 48 Street, 16 materiałów, JSON i Radar). Ręczna kontrola zbudowanego Workera potwierdziła odzyskanie, zapis A/B z odmiennymi obiektami, porównanie, eksport, dokładne przywrócenie/Cofnij oraz cofnięcie usunięcia po odświeżeniu. Widok375px bez przepełnienia; poprawiono odstęp nagłówka porównania od przyklejonego paska.

Lokalne pakowanie przerwał ENOSPC po zapisaniu i wypchnięciu źródła. Skorzystano z obsługiwanego budowania serwerowego tej samej zapisanej wersji. Nie usuwano modeli ani projektów klienta. Nie wysyłano formularzy ani wiadomości.

Następne zależności: docelowe rewizje i techniczne dane konstrukcji, zatwierdzony rejestr artykułów/kompatybilności i BOM, pozostałe stawki oraz specyfikacja z rewizją. Odrębnie: bezpieczne/wrogie grafiki, pomiary renderera, fizyczne urządzenia i badania z ludźmi. [Aktualna kolejność prac](../../../product-intelligence/2026-10-21/REALIZACJA_ZMIANY.md).

---

## Historia — wersja 76, realizacja zmiany.txt

**21.10.2026:** [Studio](https://gamefields-studio.ryhfs90.chatgpt.site) wersja **76**, commit `0e5000edf7d3c955518e8140af9d2dd10276885c`, deployment `appgdep_6ad920a463148191967a841c4190ba77` — **succeeded**, revision środowiska 3. Kontynuacja planu Product Intelligence z udziałem prowadzącego wdrożenie i trzech agentów: geometria, UX i stan sprintów. Dokument właściciela urywa się w Sprincie6; nie dopowiadano brakującej części.

### Wdrożony etap S2-01 / S2-02

- Wspólny adapter danych ośmiu bieżących modeli rozdziela **wymiary zapisane w projekcie**, **obrys i powierzchnię nawierzchni** oraz **obrys konstrukcji z bramkami**. Sekcja „Wymiary i nawierzchnia” znajduje się w Konstrukcji i w podsumowaniu.
- Kalkulacja i podsumowanie korzystają z tego samego pola górnych trójkątów modelu. Usunięto konkurencyjne pole prostokąta z podsumowania. Octagon: **29,82 m²** w obu miejscach; jego obrys nawierzchni to 6 × 6 m, a zapisane wymiary projektu pozostają 4,962 × 4,962 m.
- Metadane generowane z bieżących źródeł zawierają SHA256 i rewizję. W1 konstrukcja mierzona z rzeczywistego GLB, podłoże z obecnego JSON; P1 korzysta z aktualnego osobnego podłoża. Brak zatwierdzonych rozstawów modułów lub stref bezpieczeństwa oznacza dane nieznane, nie zero.
- Nie zmieniono geometrii, schematu projektu, migracji, cennika ani ilości wcześniej używanych do wyceny. Nie wdrożono automatycznie przyszłych płyt z kart R02. Potwierdzanie przekazania zapytania z wersji75 pozostaje zachowane.

### Sprawdzenie

PASS: TypeScript, końcowy build, test:studio (300 wzorów / 19 palet), nowy test wymiarów, quote-engine, construction-pricing, pełny test:mobile na 375/390/430/1440. Test wymiarów sprawdza osiem źródeł i ich hashe, niezmienione ilości, analityczny wielokąt Octagonu, W1 GLB, obrysy, stare zapisane wymiary, brak zgadywania dla nieznanego modelu i polskie formatowanie. Istniejące ostrzeżenia chunków/ikon Leaflet pozostają.

Ręcznie: rozwijana sekcja w Konstrukcji, otwarcie źródła klawiaturą, podsumowanie przy375px (szerokość dokumentu375px; wiersze309px, bez przepełnienia). Po publikacji potwierdzono Octagon29,82m² zarówno w podsumowaniu, jak i kalkulacji oraz zachowany subtotal konstrukcji15 300zł. Nie wysłano zapytania. Nie mierzono ponownie Lighthouse ani wydajności renderera.

![Wspólne dane wymiarów w opublikowanym Studio](08-model-dimensions.png)

### Aktualny plan i granice zakończenia

[Stan realizacji zmiany.txt](../../../product-intelligence/2026-10-21/REALIZACJA_ZMIANY.md) rozdziela wykonane funkcje od kolejnych zależności. Zaktualizowano mapę funkcji i backlog; stare zalecenie wyłączonej ceny zachowano jako historyczne i oznaczono jako zastąpione późniejszą decyzją właściciela.

S2-02 jest zakończony w zakresie ilości aktualnych modeli cyfrowych. S2-01 pozostaje częściowy: pole gry, rozstawy modułów i bezpieczne odstępy wymagają danych technicznych. Dalej: zgodność rewizji modeli z kartami produktów, adapter odzyskiwania projektu i porównanie nazwanych wariantów; następnie zatwierdzony rejestr części/BOM. **Nie oznaczono całych sprintów jako zakończonych.**

Wciąż pozostają: różnice źródeł R02 i grubości warstw; instalacja/aktywacja WPCode przez właściciela; fakty umowne prywatności; potwierdzenie odbioru wcześniejszego pojedynczego testu poczty; fizyczne urządzenia, czytnik i badania z uczestnikami.

---

## Poprzedni etap — wersja 75, 21 października 2026

**Wdrożone publicznie:** [Studio](https://gamefields-studio.ryhfs90.chatgpt.site), wersja **75**. Commit źródłowy `afee6406ca1c7818c20cad4acf2241418e3d8245`; deployment `appgdep_6ad91b8a28a481918db470404f658961` — **succeeded**, revision środowiska 3. Zachowano publiczny dostęp, modele, projekt JSON i cennik.

### Domknięcie S5-03: potwierdzenie przekazania projektu

- Studio czeka na potwierdzenie dołączenia parametrów do formularza. Wiadomość musi pochodzić z właściwej domeny i okna, dotyczyć bieżącego identyfikatora próby oraz potwierdzać dokładną długość przekazanego tekstu.
- Po 15 sekundach bez odpowiedzi pojawia się komunikat z możliwością ponowienia próby lub pobrania kopii JSON. Spóźnione i zduplikowane odpowiedzi nie potwierdzają nowej próby. W trakcie oczekiwania przycisk zapytania jest nieaktywny.
- W osadzonym Studio podsumowanie zamyka się dopiero po potwierdzeniu. W pełnym ekranie nowo otwarte okno formularza zgłasza gotowość, a Studio pokazuje jawny stan „Parametry dołączone do formularza”.
- WordPress sprawdza poprawność JSON przed zastąpieniem zawartości pola i odsyła potwierdzenie lub odrzucenie. Starsze Studio bez identyfikatora próby nadal może przekazać poprawny JSON.
- Potwierdzenie dotyczy **dołączenia parametrów**, nie wysłania zapytania ani doręczenia e-maila. Wysyłka nadal wymaga działania użytkownika. Nie wysłano żadnej kolejnej wiadomości testowej.

### Dowody i sprawdzenie

PASS: TypeScript, końcowy build, test:studio z testami dużego JSON i transportu, quote-engine, construction-pricing oraz końcowy test:mobile na 375/390/430/1440. Zakres mobilny: 96 scen O1/P1, 48 scen Street, 16 zmian materiału, JSON, szkic i przejścia Radaru. Pierwszy przebieg mobilny przerwano po drobnej korekcie resetowania statusu; wynik PASS pochodzi z pełnego przebiegu na końcowym buildzie. Pozostały wcześniejsze ostrzeżenia wielkości chunków i ścieżek ikon Leaflet.

Nowy test transportu sprawdza źródło/domenę, identyfikator, długość danych, gotowość okna, stare i podwójne odpowiedzi, odrzucenie, timeout, ponowienie, sprzątanie timerów oraz błąd wysyłki. Oddzielny test na **wyrenderowanych bajtach publicznej strony WordPress** kompiluje odbiornik i sprawdza 200 obiektów, uszkodzony JSON, limit oraz zgodność ze starszym nadawcą. Uwzględniono kodowanie znaków przez filtry treści WordPress.

Ręcznie w przeglądarce: brak odpowiedzi w lokalnym podglądzie → komunikat po 15 sekundach i aktywna ponowna próba. Po publikacji oba tryby — osadzony oraz pełnoekranowy — otrzymały potwierdzenie. W formularzu odczytano poprawny JSON: Panna Octa, 4 881 znaków, aktualna kalkulacja partial. Nie zmieniono szkicu klienta ani konfiguracji poczty.

![Potwierdzenie dołączenia projektu w opublikowanym Studio](07-inquiry-acknowledged.png)

### Pozostałe zależności i zakres kolejnych etapów

- **WPCode Lite nadal nie jest zainstalowany.** Narzędzie WPVibe wymaga instalacji przez właściciela oraz osobistego włączenia przygotowanego fragmentu. Optymalizacja czterech arkuszy na sześciu stronach pozostaje niewdrożona; nie zastąpiono jej globalnym wyłączeniem zasobów sklepu.
- Uzupełnienie polityki prywatności wymaga potwierdzonych danych adresowych i umownych hostingu/poczty, retencji i transferów. Odbiór wcześniejszego pojedynczego testu w skrzynce nadal niepotwierdzony.
- Rzeczywiste urządzenia, czytnik ekranu i badania z uczestnikami pozostają do wykonania. Ta wersja nie oznacza zakończenia całej wieloetapowej listy Product Intelligence, np. technicznego BOM i porównywania wariantów.
- Nie wykonywano ponownego Lighthouse w tej kontynuacji. Ostatni pomiar laboratoryjny pozostaje 94/100 wydajności, LCP 2,8 s; brak danych CrUX. Nie deklarujemy poprawy na podstawie samego wdrożenia.

---

## Poprzedni etap — wersja 74, 21 października 2026

**Stan tego etapu:** Studio wersja **74**, publicznie wdrożone. Source commit `23b395853d0d826ee3de07f5f3b1b6a38666c0fe`; deployment `appgdep_6ad8ecb49a988191b11960f74ff09bd7` — **succeeded**, revision środowiska 3. [Studio](https://gamefields-studio.ryhfs90.chatgpt.site). Wersja 73 z orientacyjnym cennikiem konstrukcji pozostaje zachowana w tej wersji; brak zmian cen ani zakresu wyceny.

### Zrealizowane w kontynuacji

- Usunięto ciche obcinanie danych zapytania po 18 000 znaków. Kompletne parametry, pozycje elementów, napisy, kolory i dostępna aktualna kalkulacja przechodzą jako poprawny JSON. Limit 500 000 znaków jest zgodny w Studio, odbiorniku WordPress strony 3462 i polu CF7 formularza 3758.
- Usunięto bajty grafik z nawierzchni **oraz z paneli** z wiadomości zapytania. Metadane wskazują obecność plików; pliki logo pozostają do przesłania osobno. Projekt źródłowy i jego eksport JSON zachowują grafiki.
- Przy przekroczeniu limitu wyświetla się instrukcja pobrania kopii JSON; przy zablokowaniu okna formularza — komunikat umożliwiający ponowną próbę. Nie przekazujemy urwanego JSON.
- WordPress zmieniono dwiema operacjami match-once: limit odbiornika oraz wyłącznie pole project-details. Odbiorca i konfiguracja poczty nie zostały zmienione. Odczyt konfiguracji CF7 i publicznego DOM potwierdził nowy limit.

### Aktualny pomiar strony głównej

Jeden pomiar Lighthouse mobile: **Performance 94 / Accessibility 100 / Best Practices 96 / SEO 100**. LCP **2,8 s**, CLS **0**, TBT **0 ms**, FCP **2,0 s**, Speed Index **3,1 s**. To wynik laboratoryjny, bez danych CrUX i bez deklaracji pełnej dostępności. Zastępuje wcześniejszy, pośredni wynik 70/100 opisany w części historycznej poniżej.

Pozostałe wskazania: minifikacja CSS około 17 KiB, nieużywany CSS około 147 KiB. Lighthouse zgłosił błąd konsoli bez szczegółów; w dwóch odczytach konsoli przeglądarki nie został odtworzony. Nie oznaczamy go jako naprawionego.

### Weryfikacja

PASS: TypeScript (bezpośrednio przez lokalny kompilator; brak shimu pnpm exec tsc), build, test:studio (300 wzorów / 19 palet), quote-engine, construction-pricing, test:mobile (375/390/430/1440; sceny, materiały, JSON, zachowanie szkicu, Radar). Build ma wcześniejsze ostrzeżenia rozmiaru chunków i ścieżek ikon Leaflet.

Nowy test inquiry-summary: **200 elementów, Unicode, pełna kalkulacja, 1,4 mln znaków źródła logo panelu; wynik 168 599 znaków**. JSON daje się odczytać do ostatniego elementu; brak bajtów grafik; oryginał niezmieniony; za duży projekt odrzucany komunikatem. Test jest dołączony do test:studio.

Po publikacji potwierdzono w przeglądarce: strona główna → uruchom Studio → podsumowanie Panna Octa z 15 300 zł za wycenione pozycje → zapytanie → publiczne pole formularza zawiera poprawny JSON (4 881 znaków), 2 obiekty, kalkulację partial i metadane grafik; limit 500 000. Fokus trafia do e-mail. **Nie wysłano kolejnej wiadomości.** Duży projekt sprawdzony automatycznie, nie wysłany produkcyjną pocztą.

### Nadal wymaga działania lub danych

1. **WPCode Lite nadal nie jest zainstalowany.** Narzędzie WPVibe wymaga instalacji przez właściciela i osobistego włączenia fragmentu; nie obchodzimy tej reguły innym kanałem. Gotowy fragment scoped-assets pozostaje do przeglądu. Nie odłączono globalnie CSS sklepu.
2. Dane umowne prywatności: adres podmiotu, hosting/poczta, retencja logów i kopii oraz ewentualne transfery. Nie dopisano niepotwierdzonych faktów.
3. Odbiór wcześniejszej jednej wiadomości testowej w skrzynce info@gamefields.eu nadal niepotwierdzony; status CF7 sent nie dowodzi dostarczenia do skrzynki.
4. Testy fizycznych urządzeń, czytnika ekranu i badania z klientami pozostają niewykonane.

---

## Historia wcześniejszego wdrożenia

21 października 2026. Wdrożenie w istniejących adresach Gamefields, z udziałem trzech agentów: wydajność WordPress, dostępność Studio oraz prywatność i treści historyczne.

## Zrealizowane

1. **Ładowanie strony głównej.** Studio przestało automatycznie pobierać aplikację i zasoby3D. Na początku iframe ma `hidden`, `data-src` i brak `src`; przycisk „Uruchom Studio3D” ładuje ten sam konfigurator w tym samym miejscu. Bez JavaScript przycisk pozostaje prawdziwym odnośnikiem do konfiguratora. Podczas wczytywania jest komunikat i stały odnośnik do pełnego ekranu.
2. **Obraz i czcionki.** Podgląd używa rzeczywistych wariantów WordPress768/1024 zamiast oryginału1672px. Ich metadane wskazują124318/206684B zamiast580320B. Dwa pliki WOFF2 Space Grotesk (22288+18940B) są na istniejącym hostingu Studio, z licencją SIL OFL. Na stronie głównej nie ma już linków do Google Fonts. Nie zmieniono kroju ani polskich znaków. Nie oznacza to usunięcia wszystkich zewnętrznych zasobów całego serwisu.
3. **Integracja Studio → zapytanie.** W przeglądarce potwierdzono: UruchomStudio → działający modelPannaOcta → Podsumowanie → Zapytajorealizację → parametry dołączone do formularza i fokus e-mail. Nie wysłano wiadomości w tym sprawdzeniu.
4. **Wąskie ekrany i klawiatura.** Naprawiono przycinanie nagłówka przy szerokości do360px. Przy320px szerokość dokumentu wynosi320px, nagłówek167px mieści logo, akcje, nazwę i status. Nowy test sprawdza720×500 i320×500 jako przybliżenie reflow przy200%, dialogi,25przejśćTab w podsumowaniu,20Tab/ShiftTab w bibliotece, Escape, przywracanie fokusu, filtry i przejściaRadaru. To nie fizyczny telefon ani rzeczywisty test czytnika ekranu.
5. **Prywatność.** Strona4087 jest oficjalną stroną prywatności WordPress — zapis opcji i odczyt4087 potwierdzony. Dodano potwierdzony kierunek wysyłki CF7 na info@gamefields.eu. Pełna konfiguracja prywatności pozostaje zależna od faktów z umów i paneli dostawców.
6. **Treści historyczne.** Sprawdzono26starszych stron: wszystkie mają jużYoastnoindex=1. Oddzielono prawdziwe stare treści Gamefields od demonstracyjnych. Niczego nie usuwano ani nie przekierowywano bez danych o ruchu i planu adresów.

## Wynik pomiaru wydajności

Po odroczeniu iframe, przed końcową optymalizacją obrazów i fontów, Lighthouse mobile dał70/100 zamiast wcześniejszych57/100. TBT spadło z1310 do0ms; FCP3,0s, SpeedIndex3,4s, CLS0,086. LCP wzrosło do6,3s — ten problem był powodem zmniejszenia obrazu i usunięcia zewnętrznego arkusza fontów. Nie deklarujemy jeszcze końcowego LCP po tych ostatnich zmianach. Dostępność/dobrepraktyki/SEO:100/100 w tym pojedynczym automatycznym pomiarze, bez deklaracji pełnej zgodności.

## Testy i publikacja

Studio wersja71, commit142391e275bb481b50279949a0ea26599ed251d0, deployment appgdep_6ad860d2040c8191b093e520f33f6fe3 — succeeded.

PASS: TypeScript, produkcyjny build, test:studio (300wzorów/19palet), studio-usability375/390/430/1440, nowy reflow-keyboard720/320. Po dodaniu fontów wykonano ponownybuild i porównanoSHA256 plików źródłowych zdist. Nie uruchamiano ponownie testów geometrii, ponieważ nie zmieniono modeli ani renderera.

## Pozostałe zależności — bez deklarowania ich jako wykonanych

- **WPCode:** przygotowano dokładny kod odłączający cztery arkusze na sześciu zweryfikowanych stronach oferty. Chroni stronę główną,Studio,OS,formularze i konteksty sklepu. WordPress blokuje edycję motywu; WPCode nie jest jeszcze zainstalowany według ostatniej próby zapisu. Właściciel zadeklarował instalację. Narzędzie zapisze snippet wyłączony; tylko właściciel może go włączyć. Kod:wpcode-scoped-assets-payload.json. Nie został wykonany. Lokalnie brak interpreteraPHP, więc nie deklarujemyphp-l.
- **Prywatność i zgody:** brak kontraktowych danych operatora WordPress/poczty, retencji logów/backupów oraz transferów. Complianz jest aktywny, ale tabela konfiguracji banerów była pusta. Szczegółowa checklista znajduje się wprivacy-and-legacy.md. Nie ustawiono zgód na podstawie domysłów.
- **Formularz:** poproszono o zgodę na jedną jednoznacznie oznaczoną wiadomość testową na info@gamefields.eu. Po zgodzie właściciela wysłano dokładnie jeden test z zatwierdzoną treścią i adresem kontaktowym. Formularz zwrócił stan sent i komunikat „Dziękujemy. Twoje zapytanie zostało wysłane.” Nie ponawiano wysyłki. Odbiór w skrzynce pozostaje niepotwierdzony.
- **Badania z ludźmi i urządzeniami:** fizyczny telefon, czytnik ekranu i badanie z klientami wymagają rzeczywistych urządzeń/uczestników. Testy viewportów i klawiatury wykonano, ale nie zastępują tych badań.

## Dowody

![Szybki podgląd i jawne uruchomienieStudio](02-home-final-desktop.png)
![Mobilny przycisk uruchomienia](04-home-mobile.png)
![Parametry przekazane do formularza](03-inquiry-parameters.png)
![Wąski nagłówekStudio](05-studio-narrow.png)
![Wysłany jeden test formularza](06-form-test-sent.png)

Podejście do odraczania ciężkiego osadzenia: [Google Chrome — third-party facades](https://developer.chrome.com/docs/lighthouse/performance/third-party-facades). Czcionka i licencja: [oficjalne repozytorium Google Fonts](https://github.com/google/fonts/tree/main/ofl/spacegrotesk).




