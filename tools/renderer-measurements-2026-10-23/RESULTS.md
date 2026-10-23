# Wyniki porównania Studio85–87 — 23.10.2026

**Zakończono lokalny etap pomiarowy, nie całe S2-04.** Cztery sekwencyjne serie ABBA:85,87,87,85. Każda480próbek; razem1920próbek/96komórek. Wszystkie48końcowych obrazów (8modeli×2szerokości×3kamery) identyczne RGBA we wszystkich czterech seriach. Analyzer i osobne przeliczenie w Pythonie potwierdziły mediany/maksima i obrazy.

## Obserwacje

35komórek: obie obserwowane mediany87 niższe od obu median85;4komórki: obie wyższe;57: zakresy median nakładają się. To opis dwóch serii po5próbek, bez istotności statystycznej i bez oceny SLA. Liczba komórek nie jest ważonym wynikiem wydajności całego produktu. Nie pomijano wolnych próbek. Najbardziej spójny wzorzec dotyczy complex-scene-cached-redraw: obie mediany87 niższe we wszystkich16komórkach, przy czym nie wszystkie maksima są niższe.

| Model / px / operacja | Mediany85 [ms] | Mediany87 [ms] | Maksimum85 /87 [ms] | Obserwacja |
|---|---:|---:|---:|---|
| p1 / 375 / complex-project-import | 40.7–44.6 | 46.1–46.3 | 49.4 / 49.9 | BOTH_87_MEDIANS_HIGHER |
| p1 / 1440 / complex-project-import | 46.3–47.7 | 50.8–52.4 | 55.6 / 57.7 | BOTH_87_MEDIANS_HIGHER |
| circle-cage-2 / 1440 / startup-same-context-navigation | 1065.0–1084.5 | 1098.8–1191.3 | 1475.4 / 1212.5 | BOTH_87_MEDIANS_HIGHER |
| street-field / 1440 / panel-text | 474.9–480.0 | 502.2–764.8 | 721.1 / 1775.3 | BOTH_87_MEDIANS_HIGHER |
| circle-cage-1 / 1440 / panel-text | 494.4–502.9 | 435.4–457.6 | 710.9 / 610.9 | BOTH_87_MEDIANS_LOWER |
| circle-cage-2 / 1440 / panel-text | 897.4–965.9 | 791.8–922.3 | 1150.8 / 1087.5 | MEDIAN_RANGES_OVERLAP |
| octagon / 375 / complex-scene-cached-redraw | 105.5–105.6 | 91.0–104.3 | 120.0 / 285.1 | BOTH_87_MEDIANS_LOWER |

Wiersze obejmują wszystkie cztery komórki z wyższymi medianami87 oraz przykłady korzyści i niejednoznaczności. Pełne96komórek: [CSV](results/cells.csv), [analiza z surowymi próbkami i czterema parami porównań](results/analysis.json).

**Priorytet: Street Field, tekst paneli,1440px.** Mediany87 wynoszą502,2 i764,8ms, wobec474,9 i480,0ms w85; maksimum1775,3ms wobec721,1ms. Różnica między seriami87 to262,6ms. Nie ustalono, czy to efekt aplikacji, kolejki SwiftShader lub warunków hosta; najpierw osobny profil i odtworzenie, bez deklaracji przyczyny. Circle2 warm navigation także ma wyższe mediany, choć niższe maksimum. Import P1 ma niewielkie, ale jawnie podane wzrosty.

Nawet niższa mediana nie gwarantuje niższych maksimów: Octagon375cached-redraw ma maksimum285,1ms wobec120,0ms. Circle1text1440 ma niższe obie mediany; Circle2text1440 ma zakresy nakładające się, więc nie deklarujemy powtarzalnej poprawy w tym scenariuszu. Mniejsza liczba zgłoszeń draw/upload z poprzednich testów nie dowodzi sama w sobie niższej latencji.

## Stabilność i przerwany eksperyment

Pierwsze ABBA przerwano: pełne A85-1, następnie timeout45s w O1/375/powtórzenie2 przy ponownej nawigacji B87-1. Cały eksperyment zachowano w [attempt-1](attempt-1/README.md) i wyłączono z kompletnego porównania; nie zastępowano pojedynczej próbki. Następny osobny O1×10powtórzeń przeszedł60operacji ([diagnostyka](preparation/diagnostic87.json)). Dodano wyłącznie zapis DOM przy błędzie, bez zmian aplikacji, timeoutu i automatycznych retry. Potem ponowiono całe ABBA na jednym nowym hashu harnessu. Timeout pozostaje nierozpoznanym sygnałem stabilności; cztery późniejsze PASS nie dowodzą jego naprawienia.

## Środowisko i granice

Apple M1 / macOS Darwin23.4.0 arm64, Node24.19.0, Chromium149.0.7827.55, ANGLE SwiftShader, DPR1, wysokość1000px. Nowy kontekst ma pusty cache/storage przeglądarki; proces, system i GPU nie są zimne. Pomiar kończy się na zgłoszeniu draw aktualnej generacji. Nie mierzy prezentacji GPU, FPS, sieci produkcyjnej ani telefonu. Obejmuje domyślne obie strony paneli; nie jest pomiarem jednostronnych podzbiorów Circle.

Wersja85 zawiera cache PNG/Image; wersja87 dodaje wspólny końcowy draw i ogranicza białe resety. Porównanie nie izoluje wpływu86 od87. Archiwa i84hashe pakietów każdej wersji przypięte w [receipts.json](receipts.json). Wspólne źródła geometrii, metadane, runtime i metoda sprawdzone. Odczyty pikseli i stabilizacja kontrolek poza czasem edycji. Nie łączymy tych wyników z historycznymi81/82, nie wyznaczamy p95 lub SLA z5próbek.

[Protokół i odtworzenie](README.md) · [kolejność dalszych prac](NEXT_STEPS.md). Publiczne Studio pozostaje87; etap dodaje narzędzia i dowody, bez nowego wdrożenia runtime. Geometry correspondence pozostaje UNCONFIRMED, technicalBill.rows=null.

## Integralność

SHA256 analizy: `189998e25f82f428a385f80ddd15545c5423b96123aed82b437be4f8420a3398`.
- `A85-1.json`: `28262e097db268390c09d837a21bcd355db114618e97b1cba828d05ae7fcd5d8`
- `B87-1.json`: `82e63eef7a1c43172ad7d52d0aa1ee6034f9e89f16fcf1e4d076df088575e7ed`
- `B87-2.json`: `92ad1ee78cd59b33b417d964467db36c24a77d43d8cbaa1db49d7b405e17431d`
- `A85-2.json`: `f7e1c07919e695160e96281cfd64a72da35f33cba5eb64d3094490e0a2ab4da9`
