# Realizacja dokumentu zmiany.txt — aktualizacja 22.10.2026

Aktualny etap: **Studio 82 opublikowane** — współdzielenie grafik paneli i porównanie wyników; zakres i kolejność dalszych prac opisano poniżej.

Dokument właściciela jest planem rozwoju istniejącego Studio. Nie zastępuje bieżących decyzji właściciela ani nie oznacza startu nowej aplikacji. Kończy się w połowie pozycji „Testy regres” w Sprincie6; brakującej części nie odtworzono z domysłów.

We wcześniejszym etapie pracowały równolegle cztery role wykonawcze: agent prowadzący wdrożenie, agent geometrii i źródeł, agent UX wymiarowania oraz agent stanu planu. Wyniki weryfikowano w bieżącym kodzie; nie traktowano rekomendacji jako gotowej funkcji.

| Obszar planu | Status | Co potwierdzono / czego brakuje |
|---|---|---|
| Audyt, mapa funkcji, 9 benchmarków, architektura | PARTIAL | Dokumenty i ograniczony zakres badań istnieją w repozytorium. Nie wszystkie ścieżki konkurencji były dostępne; pierwotne obserwacje pozostają historyczne. |
| S1-01: tekst o wyłączonej cenie | SUPERSEDED | Późniejsza decyzja właściciela przywróciła kalkulację. Aktywne orientacyjne ceny konstrukcji i częściowe sumy pozostają włączone. |
| S1: narzędzia, czytelność i nawigacja | PARTIAL | Cztery narzędzia, Nawierzchnia, klawiatura, fokus i testy reflow istnieją. Nie oznacza to pełnego badania wszystkich 12 odpowiedzialności ani certyfikacji. |
| S2-01: semantyka wymiarów | PARTIAL | Wspólny adapter ośmiu modeli: zapisane wymiary, nawierzchnia i obrys konstrukcji rozdzielone. Pole gry, rozstaw modułów i strefy bezpieczeństwa wymagają potwierdzonych danych technicznych. |
| S2-02: powierzchnie aktualnych modeli | DONE — zakres cyfrowych modeli | Wspólne pole górnych trójkątów dla kalkulacji i podsumowania; Octagon ma29,823379m², a nie pole prostokąta. Nie jest to zatwierdzenie projektu budowlanego ani przyszłych rewizji. |
| S2-03/04: wizualizacja i wydajność renderera | PARTIAL | Studio 82: profil paneli i współdzielenie PNG, porównanie 480+480 próbek oraz 48 identycznych obrazów trzech kamer. Pozostały koszt upload/draw i budżet czasowy nadal do wykonania. |
| S3: personalizacja, zapis i warianty | PARTIAL | 300 wzorów,19 palet, obiekty, undo/redo, lokalny szkic i JSON działają. S3-01 i S3-03 ukończone w zakresie lokalnym opisanym niżej; synchronizacja konta i porównywanie cen/3D nie są wdrożone. |
| S4: komponenty i BOM | PARTIAL | Istnieją reguły jednej rodziny i rejestr56 cyfrowych artykułów. Niezależny inspektor OS regeneruje cyfrowe instancje i eksportuje ilości z rewizjami. Zatwierdzenie połączeń i powiązanie technicznego BOM z Project nadal wymagają danych. |
| S5-01/02: kalkulacja | PARTIAL | Wersjonowany cennik ośmiu konstrukcji, retry, anulowanie i ochrona przed spóźnioną wyceną. Ceny nawierzchni, montażu, transportu i pełny łańcuch technicznego BOM nadal niekompletne. |
| S5-03: przekazanie zapytania | DONE — dołączenie do formularza | Kompletne ograniczone JSON, pominięcie plików graficznych, potwierdzenie domeny/okna/próby/długości, timeout i ponowienie. Oba tryby przeglądarki sprawdzone w wersji75; nie potwierdza to odbioru e-maila. |
| S5-04: podsumowanie i eksport | PARTIAL | Edytowalne grupy i JSON istnieją. Eksport konfiguracji z pełnym Project, SHA256 i rewizją modelu/katalogu gotowy. Techniczna specyfikacja wykonawcza z BOM nadal pozostaje do wykonania. |
| S6: stabilizacja | PARTIAL | TypeScript, build i regresje są bramkami wdrożeń. Fizyczne urządzenia, czytniki ekranu i badania z klientami pozostają osobnymi zadaniami. |

## Wykonane kolejne etapy — 22.10.2026

| Etap | Status i granice |
|---|---|
| Rejestr zgodności rewizji | DONE — inwentaryzacja i integralność 42 plików: 10 live, 16 finalnych ASM/WEB, 16 warstw. Sześć z ośmiu R02 ma inny obrys; zgodne gabaryty pozostałych dwóch nie dowodzą równoważności. Stary zbiorczy QA ma nieaktualne hashe ośmiu Blenderów; poprawny agregat zapisano osobno w bibliotece roboczej. |
| Podmiana modeli R02 | PENDING — wszystkie releaseEligible=false. Obecne modele i ich ilości pozostają niezmienione. Pełne raporty wewnętrzne nie są publikowane w publicznym repozytorium. |
| S3-01: adapter i odzyskiwanie | DONE — lokalny zakres: stare JSON i nazwy własne, walidacja ID, kopia przed zastąpieniem, ochrona uszkodzonego szkicu, pobranie surowych danych, jawne wznowienie, błędy quota i konfliktów. |
| S3-03: nazwane warianty | DONE — do sześciu pełnych zapisów, porównanie dwóch planów 2D i parametrów, przywrócenie z Cofnij, kontrola sourceRevision, cofnięcie ostatniego usunięcia także po odświeżeniu. |

Dane przechowywane są w przeglądarce/profilu/kontekście strony, nie w chmurze. JSON zachowuje pełne grafiki i jest niezależną kopią. Nie prezentujemy nieaktualnej ceny wariantu: po przywróceniu działa bieżąca kalkulacja. Web Locks chronią współbieżny zapis szkicu tam, gdzie są obsługiwane; starsze karty i przeglądarki bez tej funkcji nie mają pełnej gwarancji atomowości.

## Kolejne wykonane prace — rejestr i specyfikacja

- **S4-01 PARTIAL:** rejestr56 cyfrowych artykułów; articleId/family/revision/unit i SHA256 źródła. Sprawdzono56 źródłowych hashy, unikalność ID i rewizję rejestru. Wszystkie approval/connectionApproval pozostają UNCONFIRMED. Nie opublikowano wewnętrznych modeli ani raportów.
- **S4-02 PARTIAL:** izolowany kontrakt GF-DIGITAL-ASSEMBLY-1 odrzuca mieszane rodziny, nieznane artykuły, obce URL, skalę, duplikaty i niezgodne rewizje. Wynik wylicza ilości z instancji, ale nie zatwierdza połączeń. Nie podłączono jeszcze technicznego edytora instancji do Studio ani nie zmieniono istniejącego silnika OS.
- **S4-04 PARTIAL:** eksport rozdziela swobodne obiekty od artykułów; nazwa dekoracji równa articleId nie daje jej statusu części konstrukcyjnej. Bez przebudowy starego Project JSON.
- **S5-04 PARTIAL:** w Podsumowaniu dostępny eksport GF-PROJECT-SPECIFICATION-1 z pełnym projektem/grafikami, deterministycznym SHA256 konfiguracji, rewizją modelu/katalogu i ilością nawierzchni. technicalBill.rows=null, ponieważ Studio nie ma zatwierdzonych instancji. Dostępny katalog rodziny nie jest BOM wybranego boiska. Aktualnych cen nie utrwalamy jako wiążącej wyceny.

## S3-02 — profil statycznych grafik

**DONE w zakresie profilu statycznego SVG:** wspólny validator w upload i projectSchema; zasięg obejmuje import, szkic, warianty, szablony, kalkulację i specyfikację. Poprawne grafiki zachowują dokładne bajty. Niedozwolone źródła są odrzucane przed zmianą projektu; recovery chroni surowy zapis. Mieszana paczka poprawnego/aktywnego SVG i odrzucony import sprawdzone w przeglądarce.

Profil odrzuca skrypty, zdarzenia, DTD/encje, animację, zewnętrzne odwołania i nieobsługiwane konstrukcje; do2MB UTF8/base64,10000tokenów,głębokość64. `use`, filtry, obrazy osadzone, arkusze style i metadane edytorów wymagają innego eksportu/PNG. Dotychczasowy kontrakt PNG zachowano; nie deklarujemy nowej walidacji sygnatur PNG ani gwarancji kosztu renderowania ścieżek/wzorów. Nie stwierdzono i nie deklarujemy wykazanego wcześniejszego XSS. Kontrakt opisuje ograniczenia.

Pracował prowadzący wdrożenie i trzech ekspertów: profil SVG, mapowanie komponentów OS i kolejność prac. Niezależny przegląd źródeł i testów nie znalazł blokującego obejścia ograniczonego profilu. Zweryfikowano także zgodność13 aktywnych GLB OS F05/F06/F07 z rejestrem poSHA; nie zmieniono konfiguracji OS ani modeli.

## Inspektor cyfrowej konfiguracji OS

**DONE — niezależny zakres cyfrowy:** w istniejących Plikach projektu dodano zwijaną sekcję kontroli natywnego eksportu GF-OWNED-ASSEMBLY-1. Ściśle sprawdzany pełny config generuje instancje przez przypiętą kopię istniejącego silnika; dołączone bom jest ignorowane. Mapowanie family+alias wiąże articleId/revision/sourceRevision.25 aktywnych zasobów sprawdzono poSHA; eksport zawiera rewizję silnika, katalogu i rejestru.

Testy obejmują594 konstrukcje i25 pojedynczych komponentów oraz4 odmowy całości SOURCE. Rodziny p1/o1/w1/street15 nie mają potwierdzonego rozbicia całości w tym silniku; ich skład nie jest zgadywany z katalogu. F01/F02/F03 umożliwiają dostępne pojedyncze części, street15 nie udostępnia trybu komponentu.

Wynik GF-OWNED-INSPECTION-1 pozostaje osobnym dokumentem: DIGITAL_INSTANCES_ONLY, manufacturingReady=false. UI nie otrzymuje setterów Project ani kalkulacji. Ręcznie potwierdzono28 instancji mimo fałszywego wejściowego bom999999, poprawny eksport i dokładną niezmienność projektu Studio po sukcesie/pobraniu/czyszczeniu/błędzie. Błąd usuwa poprzedni wynik. Wynik nie jest zapisywany w bibliotece ani do technicznego BOM Studio.

Prace prowadzono z ekspertami kontraktu/mapowania i UX/akceptacji; testy domenowe powstały niezależnie od adaptera. Natywny plik OS nie przypina historycznych zasobów: wynik używa źródeł sprawdzonych przy wydaniu inspektora i nie potwierdza zgodności dawnej wizualizacji.

## Kolejność dalszej pracy

1. **Pozostały koszt paneli:** osobno profilować dekodowanie, upload i draw, zachowując kontrolę anulowania oraz identyczny obraz. Porównywać na tej samej macierzy; zebrać rozrzut serii przed budżetem czasowym. Współdzielenie PNG oraz budżet liczby kodowań są już wykonane.
2. **Strony paneli Circle Cage:** ustalić jawne mapowanie inner/outer/both na rzeczywiste strony meshów i dodać przypadki akceptacyjne. Nie uznawać identycznych obrazów side=both za test wszystkich stron.
3. **Powiązanie OS–Project:** jawny kontrakt konfiguracji i rewizji geometrii. Ta sama rodzina/nazwa nie oznacza identycznego boiska. Nie dopisywać niezależnych ilości inspektora do aktywnego technicalBill.
4. **Dane wykonawcze:** potwierdzić rewizje/obrysy R02, połączenia, rozstawy i artykuły. Dopiero po potwierdzeniu oraz wiązaniu instancji rozszerzyć techniczny BOM; obecnie rows=null i UNCONFIRMED.
5. **Dane komercyjne i badania:** nawierzchnia, montaż, transport i warunki podatkowe; wycena tej samej konfiguracji. Osobno kontrola rastrów, fizyczne urządzenia, czytnik ekranu i badania z klientami. Orientacyjne ceny konstrukcji pozostają aktywne.

Pozostałe zależności WordPress: instalacja i osobista aktywacja WPCode przez właściciela, potwierdzone fakty prywatności, odbiór wcześniejszego pojedynczego testu poczty. Nie wysyłać kolejnych testów bez nowej instrukcji.

Historia badań i aktualny stan są rozdzielone. Nowa kontrola ilości korzysta z żywych źródeł Blender/GLB i ich SHA256; dokumenty kart produktów nie są automatyczną autoryzacją podmiany modeli.


## Historia — etap wymiarów v76

Studio wersja76; źródło `0e5000edf7d3c955518e8140af9d2dd10276885c`; deployment `appgdep_6ad920a463148191967a841c4190ba77` — succeeded. Testy TypeScript/build/test:studio/quote/construction-pricing/test:mobile PASS. Ręcznie sprawdzono Konstrukcję, źródło klawiaturą,375px oraz zgodność29,82m² w publicznym podsumowaniu i kalkulacji. [Raport wdrożenia](../../audits/2026-10-21/implementation/WDROZENIE.md).


## Wydanie odzyskiwania i wariantów

Źródło `d770de1a5fcb4e10c77ac80a6ff697d0d3e1b185`, zapisana wersja 77. Publikacja `appgdep_6ad99e344664819188ef8ec2e456a076` — **succeeded**, środowisko revision3. Na publicznym Studio sprawdzono nowe sekcje i działającą cenę konstrukcji; dane użytkownika nie były zastępowane wariantami QA. Potwierdzenie: raport WDROZENIE.md. Kontrakt: [PROJECT_RECOVERY_VARIANTS](../../../integrations/studio/canvas-editor/docs/PROJECT_RECOVERY_VARIANTS.md).

PASS: TypeScript, build, test:studio (w tym project-vault/draft-write), quote-engine, construction-pricing, pełne test:mobile na 375/390/430/1440. Ręcznie lokalnie sprawdzono uszkodzony szkic, odzyskanie, zapis A/B, porównanie, pobranie pełnego JSON, przywrócenie/Cofnij i cofnięcie usunięcia po ponownym wczytaniu. Widok 375px bez poziomego przepełnienia. Testy lokalnego zbudowanego Workera nie oznaczają testu fizycznego telefonu.


## Wydanie rejestru i specyfikacji — Studio78

22.10.2026, źródło `dd5856cc2a9b67d54b09ca67bd1580ea2125bf5b`, wersja `appgprj_6abbd0ba26f0819197701343bf156f1b~appgver_f5da9ba168f48191baee4e21cf9f4152`, deployment `appgdep_6ad9a4d7865c8191934cd1af12ee1e6f` — **succeeded**, środowisko revision3. [Studio](https://gamefields-studio.ryhfs90.chatgpt.site). Paczka zgodna ze źródłem, SHA256 `1381653a8a87b566c99a2b0bd0233f09495e020f7f8381eb3427f244ddd52bb8`.

PASS: TypeScript, build, test:studio, component-specification, weryfikacja56 źródeł, quote-engine, construction-pricing i pełne test:mobile (96aren,48Street,16materiałów,JSON,Radar;375/390/430/1440). Rzeczywisty pobrany eksport ma poprawny kod GF-CT-008, powierzchnię29,823379m², pełny projekt i SHA zgodny z niezależnym odtworzeniem. Na375px brak przepełnienia, przycisk50px i tekst16px. Brak testu fizycznego urządzenia i czytnika ekranu. Bez wysyłania formularzy, zmian SQL, podmiany R02 lub stawek.

Kontrakt i ograniczenia: [COMPONENT_SPECIFICATION](../../../integrations/studio/canvas-editor/docs/COMPONENT_SPECIFICATION.md). Rejestr cyfrowy i gotowy adapter nie oznaczają wdrożonego technicznego BOM. Jego status pozostaje PARTIAL; rows=null w specyfikacji jest celowe.


## Wydanie profilu grafik — Studio79

22.10.2026: źródło `6064726a56ee7f67de8dea67e8ebf535a6968ef1`, wersja `appgprj_6abbd0ba26f0819197701343bf156f1b~appgver_38006ef1d96081918b36e73454fd0ba8`, deployment `appgdep_6ad9aaf1e1288191bdc0aeb4d418280a` — **succeeded**, środowisko revision3. [Studio](https://gamefields-studio.ryhfs90.chatgpt.site). Paczka SHA256 `0993fcf376a91fc718280fb20440c068276fdde287bdd306b9b86b5f7edd1f32`.

PASS: TypeScript/build/test:studio, graphic-source-policy, graphic-boundaries, quote-engine/construction-pricing, pełne test:mobile oraz Surface7viewport. Ręcznie: mieszana paczka dodała poprawne SVG i odrzuciła aktywne; eksport zachował dokładne bajty poprawnego SVG i nie zawierał odrzuconego obiektu. Nieprawidłowy import pozostawił konfigurację dokładnie bez zmian; poprawny import potwierdzono nazwą. Na375px brak przepełnienia, tekst informacji14px. Bez testu fizycznego telefonu, gwarancji kosztu renderowania lub pełnej walidacji PNG.

Kontrakt: [GRAPHIC_SOURCE_POLICY](../../../integrations/studio/canvas-editor/docs/GRAPHIC_SOURCE_POLICY.md). Nie zmieniono modeli R02, stawek ani SQL; nie wysłano formularza. Dane produkcyjne nie otrzymały testowych grafik.


## Wydanie inspektora OS — Studio80

22.10.2026: źródło `3a75f940c647312fb9f562ef0175a6eb858bf652`, wersja `appgprj_6abbd0ba26f0819197701343bf156f1b~appgver_e459c0510a0c8191802e879a0fea8c00`, deployment `appgdep_6ad9b14bfc408191a821a28a737fad34` — **succeeded**, środowisko revision3. [Studio](https://gamefields-studio.ryhfs90.chatgpt.site). Paczka SHA256 `ed0dd62684b94b79af9be470e582e72c7972e2e72b544e8c4efc8486662585de`.

PASS: TypeScript/build/test:studio,594 konfiguracje konstrukcji+25 części, walidacje negatywne i4 odmowy SOURCE,25 hashy runtime, quote-engine/construction-pricing, pełne test:mobile i Surface7viewport. Pierwszy test mobilny zatrzymał niejednoznaczny selektor dwóch pól JSON; pola nazwano osobno, selektory doprecyzowano i pełną regresję powtórzono z wynikiemPASS.

Ręczny test zbudowanego Workera: fałszywe bom999999 pominięte, wynik28 instancji, eksport manufacturingReady=false. Aktywny Project dokładnie niezmieniony po inspekcji/pobraniu/czyszczeniu/błędzie; wynik po odświeżeniu nie jest zachowywany.375px bez przepełnienia, tabela325px/tekst16px, przycisk46px. Bez deklaracji fizycznego urządzenia lub zatwierdzenia wykonawczego.

Kontrakt: [OWNED_CONFIGURATION_INSPECTOR](../../../integrations/studio/canvas-editor/docs/OWNED_CONFIGURATION_INSPECTOR.md). Nie zmieniono R02, stawek, SQL ani silnika aktywnego OS; nie wysyłano formularzy. Na potrzeby paczki usunięto jedynie odtwarzalne archiwa już opublikowanych wydań78/79, zachowując źródła i raporty.


## Historia — przygotowanie pomiarów i usunięta blokada ENOSPC, 22.10.2026

Poniższy zapis opisuje wcześniejszą próbę. Aktualny stan: pełne pomiary i bramki ukończone; Studio81 opublikowane, szczegóły niżej.

**PARTIAL — kod lokalny, nieopublikowany.** Prowadzący pracował z dwoma ekspertami: scenariusza pomiarowego oraz niezależnego przeglądu renderera. Przygotowano `tests/renderer-baseline.mjs`: 8 modeli ×2 szerokości375/1440 ×5 powtórzeń ×6 operacji, łącznie480 planowanych próbek. Operacje: start w nowym kontekście, druga nawigacja w tym samym kontekście, kolor paneli, tekst paneli, import projektu z SVG500 ścieżek oraz ponowne rysowanie z cache. W1 wymaga jawnego historycznego szkicu, nie stanowi nowej pozycji oferty.

Punkt końcowy to wydanie ostatniego draw dla aktualnej generacji po oczekiwaniu na jej tekstury, nie prezentacja GPU ani FPS. Profil: lokalny zbudowany Worker, Chromium/SwiftShader, DPR1; cache przeglądarki i cache systemu rozróżnione. Przygotowany skrypt nie jest dowodem wykonania pomiarów.

Ekspert wykrył wyścig: kolejne wywołanie tej samej tekstury mogło pominąć jeszcze trwające dekodowanie. Kandydat współdzieli obietnicę dekodowania/uploadu i generowania grafiki panelu; anulowana generacja nie zgłasza zakończenia. Niezależny ponowny przegląd nie znalazł kolejnego blokera tej synchronizacji. Dedykowane testy współbieżności, błędu/retry, nadpisania, clear/reload i dispose przeszły. To nie zastępuje pełnej regresji przeglądarkowej.

**Blokada środowiska:** kompilacja zakończyła się ENOSPC przy kopiowaniu publicznego zasobu; odczyt wykazał28MB wolnego miejsca. Późniejsza próba TypeScript z zapisem tsbuildinfo także zatrzymała się ENOSPC. Nie uzyskano pełnych wyników baseline ani nowego kompletu bramek publikacji. Nie deklarujemy poprawy czasu ani gotowego budżetu wydajności. Publiczne Studio nadal v80; bieżący kandydat nie został wdrożony. Dalsza próba usunięcia niepełnego dist nie została wykonana, ponieważ automatyczna kontrola zatwierdzenia nie mogła otworzyć pliku blokady z powodu ENOSPC; nie była to ocena polecenia jako niebezpiecznego.

Następny krok po zwolnieniu min.1GB: hashe wejść pomiaru, build, smoke scenariusza, pełne480 próbek, analiza median/maksimów, regresje mobile/materials/cameras/JSON/Radar, budżet oparty na wynikach i publikacja. Powiązanie OS–Project pozostaje kolejnym etapem, a techniczny BOM nadal rows=null.


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

[Metoda i wyniki](../../../integrations/studio/canvas-editor/docs/RENDERER_BASELINE.md), [surowe480próbek i hashe](../../../integrations/studio/canvas-editor/docs/renderer-baseline-2026-10-22.json). Nie przeprowadzono testu fizycznego telefonu ani prezentacji GPU.


## Wydanie pomiarów i synchronizacji tekstur — Studio81

22.10.2026: źródło `e1e6666b96e006c72ab4ebc0e0a953d36214fabf`, wersja `appgprj_6abbd0ba26f0819197701343bf156f1b~appgver_c7ff626b281481918336f9feeb61301d`, deployment `appgdep_6ad9f5cc257c81919909cfa4e060c6f2` — **succeeded**, środowisko revision3. [Studio](https://gamefields-studio.ryhfs90.chatgpt.site). Paczka `sha256:120efbb0bf9f646c765b4c12feb17f3e5537bf9a380267e500d091b2d5574613`.

PASS: TypeScript/build/test:studio, renderer-texture-jobs, quote-engine/construction-pricing, pełne test:mobile (96aren/48Street/16materiałów,JSON,Radar;375/390/430/1440) i Surface7viewport. Pełne480próbek lokalnego renderera/96komórek/0błędów; niezależna kontrola hashów, median i maksimów PASS. Poprawiono oczekiwanie na współdzielone dekodowanie/upload tekstur. Brak deklaracji porównawczego przyspieszenia v80→v81, FPS, prezentacji GPU lub testu fizycznego telefonu. Budżet liczbowy i profilowanie paneli nadal PENDING.

Kompilacja i testy ukończone po zwolnieniu miejsca; wcześniejsza blokada ENOSPC jest historyczna. Modele, cennik i SQL niezmienione; nie wysłano formularzy.


## S2-04/S6 — profilowanie i pierwsza optymalizacja paneli

**DONE — ograniczony zakres profilowania, współdzielenia PNG i porównania. PARTIAL — pozostałe koszty renderera oraz budżet czasowy.** Powtórzona baza v81 i kandydat: po **480 próbek / 96 komórek / 0 błędów**; **48/48 końcowych obrazów canvas trzech kamer identycznych**. Hashy kodu aplikacji bazy sprawdzono z opublikowanym źródłem v81; hashe kandydata są zapisane w surowych wynikach. Wcześniejsza pierwsza baza pozostaje historyczna.

| Circle Cage 2 — mediana | Przed [ms] | Po [ms] | Zmiana |
|---|---:|---:|---:|
| Tekst paneli / 375 px | 1071,6 | 911,4 | −14,9% |
| Tekst paneli / 1440 px | 2017,2 | 1812,4 | −10,2% |
| Złożona scena: zmiana koloru / 375 px | 1026,2 | 748,8 | −27,0% |
| Złożona scena: zmiana koloru / 1440 px | 1894,0 | 1575,1 | −16,8% |

To obserwacje jednej lokalnej pary serii na M1/Chromium/SwiftShader/DPR1, nie FPS, prezentacja GPU, telefon lub SLA. Wszystkie 16 median panel-text zmalało; przy złożonym przerysowaniu poprawa w 15/16 komórek. Łącznie 55 median zmalało, 37 wzrosło, 4 bez zmiany. P1/375: 533→544,5 ms przy nakładających się zakresach i niższym maksimum. Zachowano także wyższe maksima P1/1440 i Circle Cage 1/1440, wzrost mediany drugiej nawigacji do 59,6 ms oraz importu W1/375 o 16,9 ms. Nie deklarujemy przyspieszenia każdej operacji lub próbki.

Profil z licznikami jest oddzielny od pomiaru czasu. Potwierdził 16→1 kodowań PNG / rysowań tekstu, przy niezmienionych 16 uploadach. Czas wywołania texImage2D nie jest pomiarem GPU; suma nakładających się image.onload nie jest czasem całej operacji. Deterministyczny budżet tej iteracji: najwyżej jedno kodowanie PNG na unikalną recepturę w generacji. Budżet liczbowy czasu pozostaje do ustalenia na podstawie rozrzutu i celów urządzeń.

Cache używa dokładnego rozmiaru, koloru, tekstu i logo; pozostaje lokalny dla generacji, a błąd usuwa wpis do retry. Zachowano dotychczasowy klucz tekstur, anulowanie i mapowanie stron. Test pikseli obejmuje cztery warianty oraz różne szerokości w tej samej pamięci cache. Pierwszy harness wyczerpał pamięć przy przekazywaniu całych geometrii; ograniczono go do potrzebnych paneli {id,group,v}, bez zwiększania heap. Poprawiony test i ponowienie przeszły.

Znany wcześniejszy problem pozostaje jawny: ID paneli Circle Cage 2 nie mają końcówek inner/outer, więc obecny filtr nie mapuje poprawnie wyboru stron. Ta optymalizacja go nie naprawia; kontrola 48 obrazów dotyczy side=both. Osobny kontrakt stron/meshów ma kolejny priorytet.

[Metoda, wyniki i ograniczenia](../../../integrations/studio/canvas-editor/docs/PANEL_ARTWORK_OPTIMIZATION.md), [pełne porównanie](../../../integrations/studio/canvas-editor/docs/panel-artwork-2026-10-22/comparison.json).


## Wydanie optymalizacji grafik paneli — Studio 82

22.10.2026: źródło `6bfcc1f5d961e43a6986c4ac1d3d308a4a753c7d`, wersja `appgprj_6abbd0ba26f0819197701343bf156f1b~appgver_a2da575e41c881919ac92b1cf03609c7`, deployment `appgdep_6ad9fc6852fc8191b7c715a7acf0a8ed` — **succeeded**, środowisko revision 3. [Studio](https://gamefields-studio.ryhfs90.chatgpt.site). Paczka `sha256:5e09cdd1077cc0d66579977fbe2c80e406d7f1eef064c699ffc137a96d8022df`.

PASS: TypeScript, build, test:studio, quote-engine/construction-pricing, pełne test:mobile (96 scen aren, 48 Street, 16 zmian materiałów, JSON i Radar; 375/390/430/1440) oraz Surface w 7 rozmiarach widoku. Test 138 paneli / 21 szerokości / 84 dokładnych porównań RGBA, cache i retry PASS. Pracowali prowadzący oraz eksperci scenariusza/testów i niezależnego przeglądu; sprawdzono recepturę, integrację, hashe i wyniki.

Współdzielenie PNG ograniczono do jednej generacji aktualizacji. Circle Cage 2: **16→1 kodowań PNG**, ale nadal 16 uploadów oraz osobne tekstury GPU. Bez zmian geometrii, źródeł modeli, cennika, SQL i Project JSON; nie wysyłano formularzy.

Publiczny odczyt po publikacji: zachowany szkic Panna Octa, cena częściowa 15 300 zł, model octagon data-ready=true, żądanie i zakończenie generacji zgodne (1/1). Nie wstawiano grafik QA do projektu użytkownika.
