// Owner-authorised budget inspiration, not a measured production-cost model.
export const fx={eurPln:4.3641,date:'2026-10-21',table:'205/A/NBP/2026',url:'https://nbp.pl/statystyka-i-sprawozdawczosc/kursy/tabela-a/'};
export const anchors=[
 {name:'The Cage',page:1,length:15,width:10,height:2.5,eur:25000},
 {name:'The Pitch',page:2,length:15,width:10,height:1,eur:6000},
 {name:'Kids Pitch',page:3,length:15,width:10,height:.5,eur:4000},
 {name:'Panna Cage',page:4,length:6,width:6,height:1.8,eur:5200},
 {name:'Panna Pitch',page:5,length:6,width:6,height:.6,eur:2500}
];
export function heightReference(family,height){
 if(!Number.isFinite(height)||height<=0)throw Error('Invalid height');
 const points=(family==='rectangular'?anchors.slice(0,3):family==='panna'?anchors.slice(3):[]).toSorted((a,b)=>a.height-b.height);
 if(points.length<2)throw Error('Unknown reference family');
 let a=points[0],b=points[1];
 if(height>=points.at(-1).height){a=points.at(-2);b=points.at(-1);}
 else for(let i=1;i<points.length;i++)if(height<=points[i].height){a=points[i-1];b=points[i];break;}
 return a.eur+(height-a.height)/(b.height-a.height)*(b.eur-a.eur);
}
export function scaleConstruction({family,perimeter,height}){
 if(!Number.isFinite(perimeter)||perimeter<=0)throw Error('Invalid perimeter');
 const fixed=family==='rectangular'?1200:625,referencePerimeter=family==='rectangular'?50:6*Math.PI;
 const rawEur=fixed+(heightReference(family,height)-fixed)*perimeter/referencePerimeter;
 return {rawEur,eur:Math.round(rawEur/100)*100,pln:Math.round(Math.round(rawEur/100)*100*fx.eurPln/100)*100};
}
export const models=[
 {id:'w1',family:'panna',perimeter:Math.PI*5.09,height:1,basis:'Obwód zewnętrzny Ø5,09m; wysokość1m.'},
 {id:'o1',family:'panna',perimeter:Math.PI*6,height:.55,basis:'Niska banda0,55m; wyższe ramy bramek objęte częścią stałą. Niewielka ekstrapolacja poniżej0,6m.'},
 {id:'p1',family:'rectangular',perimeter:2*(7.139+5.573),height:1.22,basis:'Wymiary katalogowe7,139×5,573m i konserwatywnie maksymalna wysokość1,22m.'},
 {id:'street15',family:'rectangular',perimeter:50,height:1,basis:'Bezpośredni odpowiednik wymiarów The Pitch15×10×1m.'},
 {id:'circle-cage-1',family:'panna',perimeter:6*Math.PI,height:.9,basis:'Ø6m, wysokość0,9m; interpolacja Panna Pitch/Panna Cage.'},
 {id:'circle-cage-2',family:'panna',perimeter:6*Math.PI,height:1.8,basis:'Bezpośrednia wysokość i nominalny wymiar referencyjnego Panna Cage.'},
 {id:'street-field',family:'rectangular',perimeter:2*(6.214+4.648),height:1.091,basis:'Wymiary pola6,214×4,648m i wysokość1,091m; nominalny obwód, bez wypustów bramek.'},
 {id:'octagon',family:'panna',perimeter:8*4.962*Math.tan(Math.PI/8),height:1.218,basis:'Regularny ośmiobok4,962m między równoległymi bokami; wysokość1,218m.'}
];
