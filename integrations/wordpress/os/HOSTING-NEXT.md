# Dokończenie usług Gamefields OS

Publiczny panel: https://www.gamefields.eu/os/ . Wdrożenie modeli i teł: commit c3a05e98753d7717bbeedbb86b66b90714216bf4, GitHub Pages run 39216665869.

1. Połączyć środowisko Codex z kontem hostującym aplikację i bazą D1, korzystając z konfiguracji środowiska; nie przesyłać tokenów w rozmowie. Obecna sesja nie ma autoryzacji Cloudflare ani narzędzia publikacji istniejącego hosta Studio.
2. Odczytać konfigurację domen, usług, sekretów i stan migracji D1. Wykonać kopię bazy przed migracją. Nie wyłączać logowania.
3. Opublikować aplikację z main wraz z wymaganymi migracjami, po weryfikacji zgodności istniejącej bazy.
4. Sprawdzić logowanie i autoryzację kont, zapis i odczyt projektu, PLAY oraz serwerowe zapytanie Panna Kids na koncie testowym. Sprawdzić API health oraz brak dostępu do cudzych danych.
5. Zaktualizować adresy usług w panelu i komunikat dostępności dopiero po przejściu tych kontroli.

Osobno: WordPress emituje fragment nm-wishlist przed JSON REST. Do naprawy potrzebny dostęp do kodu motywu/wtyczki; nie zmieniano wtyczki podczas publikacji treści.
