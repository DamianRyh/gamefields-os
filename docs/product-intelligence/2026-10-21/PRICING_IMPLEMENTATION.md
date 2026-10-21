# Wdrożenie przebudowanej kalkulacji — 21.10.2026

Polecenie właściciela: ponownie włączyć przeliczanie ceny i właściwie je przebudować.

Studio wersja72, źródło `bcd6f4a559925fe2f95f07785a3b507f996d15ff`, deployment `appgdep_6ad8dc9436cc819181e29fe36c448d9e`, status succeeded. URL: https://gamefields-studio.ryhfs90.chatgpt.site. Dotychczasowa publiczna dostępność zachowana. W razie regresji można ponownie wdrożyć zapisaną wersję71; bez zmiany migracji/danych.

Włączono wywołania API po zmianach konfiguracji, z anulowaniem starszych żądań. Kalkulacja obejmuje pozycje: nawierzchnia i jej ułożenie, grafika, linie, konstrukcja, montaż, dodatki, branding, przygotowanie projektu i transport. Pełna suma powstaje tylko gdy wszystkie wybrane pozycje mają stawki. W przeciwnym razie jawna suma wycenionych pozycji albo wycena indywidualna. Kwoty netto i brutto oddzielone; brak założonego VAT. Powierzchnie pochodzą z podłóg ośmiu modeli Blender zamiast prostokątnych gabarytów. Uwzględniono wbudowane bramki bez podwójnego liczenia.

**Otwarte: rzeczywiste stawki.** W aktualnym środowisku nie było dawnych QUOTE_* ani nowego cennika. Właściciel otrzymał pytanie o cennik. Do czasu odpowiedzi produkcja przelicza ilości i pokazuje brakujące ceny do ustalenia, a nie zmyślone kwoty. Testowy cennik był tylko lokalny i nie został opublikowany. Format konfiguracji: `integrations/studio/canvas-editor/docs/PRICING.md`.

Walidacja: TypeScript, studio-scope300/19/12, nazwy8produktów, studio-ux, quote-engine, końcowe Worker API — PASS. Build — PASS z istniejącymi ostrzeżeniami dużych chunków/Leaflet. Regresja mobilna — PASS144kombinacje modeli/scenerii,16zmian materiału,JSON/szkic,Radar na375/390/430/1440. Drobna końcowa zmiana tekstu i zaokrągleń potwierdzona przez TypeScript, test domenowy i końcowy Worker API; nie zmienia renderera. Manualnie sprawdzono zmianę kosztu linii i Cofnij na lokalnych fiksturach. Po publikacji otwarto produkcyjne podsumowanie i potwierdzono stan bez cennika.

Lokalny dowód: outputs/pricing-rebuild/03-production-summary.png. Zachowano modele,wzory,palety,JSON i migracje. Nie wysłano kolejnego formularza/emaila. Limit18000znaków istniejącego przekazania zapytania pozostaje ograniczeniem bardzo dużych projektów; nie twierdzimy, że rozwiązano trwały zapis całego długiego zapytania.
