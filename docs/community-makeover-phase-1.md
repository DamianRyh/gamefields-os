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
