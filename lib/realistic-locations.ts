export type RealisticLocation="park"|"school"|"courtyard"|"warsaw-pkin"|"krakow-rynek";
export const REALISTIC_LOCATIONS:{id:RealisticLocation;name:string;label:string;concept:boolean;enabled:boolean}[]=[
 {id:"park",name:"Park",label:"Park",concept:false,enabled:true},
 {id:"school",name:"Szkoła",label:"Szkoła",concept:false,enabled:true},
 {id:"courtyard",name:"Podwórko",label:"Podwórko",concept:false,enabled:true},
 {id:"warsaw-pkin",name:"Warszawa",label:"Warszawa · Pałac Kultury i Nauki",concept:true,enabled:true},
 // Prepared and tested, but intentionally hidden until the owner requests release.
 {id:"krakow-rynek",name:"Kraków",label:"Kraków · Rynek Główny",concept:true,enabled:false}
];
