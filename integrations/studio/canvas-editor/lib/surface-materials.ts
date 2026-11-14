// Keep persisted/API values stable; customer-facing names are independent.
export const surfaceMaterials = [
 {value:"Akryl sportowy",label:"Malowanie farbą sportową",description:"Gładkie wykończenie. Wzór i kolory grają pierwszą rolę.",detail:"Jednolita powierzchnia z subtelną fakturą wykończenia.",finish:"Gładka",design:"Pełny design"},
 {value:"EPDM",label:"Nawierzchnia EPDM wylewana",description:"Drobnoziarnista, matowa struktura z wyraźnym detalem.",detail:"Nieregularne drobiny tworzą wizualizację struktury granulatu EPDM.",finish:"Ziarnista",design:"Pełny design"},
 {value:"Moduły sportowe",label:"Płytki sportowe PP",description:"Regularne łączenia i ażurowa struktura elementów.",detail:"Podgląd przyjmuje moduł 30 × 30 cm. Dokładny format zależy od wybranego systemu.",finish:"Modułowa",design:"Design koncepcyjny"},
 {value:"Sztuczna trawa 60 mm",label:"Sztuczna trawa",description:"Zielona, włóknista powierzchnia i sportowe oznaczenia.",detail:"Murawa ma własny zielony wygląd. Twój kolorowy design pozostaje zapisany i wróci po zmianie materiału.",finish:"Włóknista",design:"Zieleń i linie"},
 {value:"Akryl Hard Court",label:"Akryl Hard Court",description:"Warstwowy system akrylowy 1–8 mm, jak na kortach. Grubszy i równiejszy niż malowanie, w Premium z amortyzacją.",detail:"Warstwowy system akrylowy na betonie: od klasycznego hard courtu po wersję z amortyzacją.",finish:"Gładka, warstwowa",design:"Pełny design"},
 {value:"Płyty gumowe",label:"Płyty gumowe",description:"Stabilizowane płyty gumowe SBR / EPDM 50 × 50 cm. Miękkie i amortyzujące.",detail:"Płyty 40–50 mm klejone na betonie. Podgląd pokazuje fakturę granulatu; format płyt zależy od systemu.",finish:"Gumowa, amortyzująca",design:"Kolory systemu"},
 {value:"Maty gumowe",label:"Maty gumowe",description:"Prefabrykowane maty i role gumowe SBR / EPDM. Ciągła nawierzchnia, mało spoin.",detail:"Role 10–20 mm klejone na betonie. Podgląd pokazuje fakturę granulatu.",finish:"Gumowa, ciągła",design:"Kolory systemu"},
] as const;

export function isTurf(surface:string){return surface==="Sztuczna trawa 60 mm";}
export function surfaceLabel(surface:string){return surfaceMaterials.find(item=>item.value===surface)?.label||surface;}
