# Inspektor konfiguracji OS — 22.10.2026

W istniejących „Plikach projektu” zwijana sekcja „Sprawdź konfigurację modułową OS” przyjmuje eksport Systemu modułowego. Nie ma dostępu do ustawiania Project, historii, szkicu ani kalkulacji. Wynik pozostaje w pamięci komponentu; odświeżenie lub opuszczenie Plików go usuwa. Można pobrać osobny GF-OWNED-INSPECTION-1.

## Kontrakt i źródła

Wymagany eksport GF-OWNED-ASSEMBLY-1 z kompletnym config (także config.schema); do100000 bajtów. Nieznane pola, rodziny, tryby, części, błędne typy i zakresy są odrzucane przed silnikiem. Załączone bom jest ignorowane nawet wtedy, gdy zawiera fałszywe ilości lub adresy. Instancje ponownie generuje wierna kopia istniejącego silnika `lib/vendor/owned-modular/engine.mjs`; aktywnego silnika OS nie zmieniono.

Mapowanie family+alias daje stabilne articleId/revision/sourceRevision z rejestru. Części z innej rodziny nie są podstawiane po podobnej nazwie. Adapter componentBill sumuje faktycznie wygenerowane instancje. Rewizje silnika, katalogu nazw, rejestru i źródeł znajdują się w wyniku. `scripts/verify-owned-inspector.mjs <katalog-OS>` sprawdza zgodność silnika i25 rzeczywistych zasobów runtime z artykułami; test domenowy dodatkowo sprawdza hashe przypiętych plików silnika i katalogu. Nowe źródła wymagają nowego evidence (--write) i wydania.

Natywny eksport OS nie zawiera historycznej rewizji zasobów. Inspektor używa przypiętych aktualnych źródeł; nie dowodzi identyczności wcześniejszej wizualizacji. Nie pobiera GLB w czasie sprawdzania. Skopiowany hash sam nie dowodzi pobrania ani sprawdzenia pliku w przeglądarce; kontrolę źródeł wykonano przed wydaniem.

## Zakres

- F05/F06/F07: konstrukcje z rzeczywistych instancji, zmienne parametry dopuszczone istniejącym silnikiem.
- Tryb pojedynczego komponentu:25 udostępnionych części w sześciu rodzinach OS. Street15 nie ma trybu osobnego komponentu.
- Całości p1/o1/w1/street15: odrzucane w trybie assembly, ponieważ silnik zwraca jeden SOURCE zamiast potwierdzonego składu części. Nie wyprowadzamy ilości z listy dostępnych artykułów.
- Wynik to DIGITAL_INSTANCES_ONLY, approval UNCONFIRMED i manufacturingReady=false. Nie obejmuje śrub, kotwienia, fundamentów, obciążeń, zatwierdzenia połączeń ani ceny.
- Ilości nie są dopisywane do technicalBill aktywnego Studio; ten pozostaje nieznany. Nawet ta sama rodzina lub nazwa nie wiąże odrębnych konfiguracji. Kolor i parametry OS są zachowane w config eksportu, ale nie zmieniają modelu Studio.

Błąd nowego pliku usuwa wcześniejszy wynik i blokuje jego eksport; błąd jest ogłaszany jako alert. Pole pozwala ponownie wybrać ten sam plik. Import projektu Studio i import konfiguracji OS mają odrębne etykiety.

## Weryfikacja

PASS:594 kombinacje konstrukcji (567Grid,9Octa,18Cage),25 pojedynczych części,4 odmowy całości SOURCE, fałszywy bom, ścisłe walidacje, niezmienność wejścia, hashe dowodów i25 źródeł runtime. TypeScript i build PASS.

Ręcznie na zbudowanym Workerze: aktywna Octa i oddzielna konfiguracja Grid; wczytany fałszywy bom999999 dał28 instancji z config. Pobranie wyniku potwierdziło ilości i manufacturingReady=false. Po poprawnym sprawdzeniu, pobraniu, czyszczeniu i odrzuceniu SOURCE eksport aktywnego Project był dokładnie niezmieniony. Na375px dokument375px, tabela325px, tekst16px, przycisk46px. Nie testowano fizycznego telefonu ani czytnika ekranu.

Niezależni eksperci zweryfikowali kontrakt/mapowanie oraz granice prezentacji i niezmienności projektu. Test domenowy powstał osobno od adaptera. Pierwsza regresja ujawniła niejednoznaczny selektor dwóch inputów JSON; nazwano pola osobno i poprawiono testy do jawnego wskazania importu Studio.

Końcowe bramki: pełne test:mobile PASS (96aren,48Street,16materiałów,JSON/Radar na375/390/430/1440) i Surface7viewport PASS po doprecyzowaniu nazw inputów. Stawki i źródła geometrii pozostały bez zmian.
