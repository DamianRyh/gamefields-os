// Keep persisted/API values stable; customer-facing names are independent.
export const surfaceMaterials = [
 {value:"Akryl sportowy",label:"Malowana",description:"Gładkie wykończenie. Wzór i kolory grają pierwszą rolę.",detail:"Jednolita powierzchnia z subtelną fakturą wykończenia.",finish:"Gładka",design:"Pełny design"},
 {value:"EPDM",label:"Granulat",description:"Drobnoziarnista, matowa struktura z wyraźnym detalem.",detail:"Nieregularne drobiny tworzą wizualizację struktury granulatu EPDM.",finish:"Ziarnista",design:"Pełny design"},
 {value:"Moduły sportowe",label:"Płytki modułowe",description:"Regularne łączenia i ażurowa struktura elementów.",detail:"Podgląd przyjmuje moduł 30 × 30 cm. Dokładny format zależy od wybranego systemu.",finish:"Modułowa",design:"Design koncepcyjny"},
 {value:"Sztuczna trawa 60 mm",label:"Sztuczna murawa",description:"Zielona, włóknista powierzchnia i sportowe oznaczenia.",detail:"Murawa ma własny zielony wygląd. Twój kolorowy design pozostaje zapisany i wróci po zmianie materiału.",finish:"Włóknista",design:"Zieleń i linie"},
 {value:"Akryl Hard Court",label:"Akryl Hard Court",description:"Twarda nawierzchnia akrylowa jak na kortach. Wzór i kolory jak przy malowanej.",detail:"Warstwowy system akrylowy na betonie: od klasycznego hard courtu po wersję z amortyzacją.",finish:"Gładka, warstwowa",design:"Pełny design"},
] as const;

export function isTurf(surface:string){return surface==="Sztuczna trawa 60 mm";}
export function surfaceLabel(surface:string){return surfaceMaterials.find(item=>item.value===surface)?.label||surface;}
