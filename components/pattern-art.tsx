import type {ReactNode} from "react";
import type {Project} from "@/lib/project";
import {getPatternFamily,getPatternPalette} from "@/lib/pattern-library";

type C=[string,string,string,string,string];

const P=({d,fill,opacity=1}:{d:string;fill:string;opacity?:number})=><path d={d} fill={fill} opacity={opacity}/>;
const S=({d,stroke,width=20,opacity=1,dash}:{d:string;stroke:string;width?:number;opacity?:number;dash?:string})=><path d={d} fill="none" stroke={stroke} strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" opacity={opacity} strokeDasharray={dash}/>;

function organic(v:number,h:number,[a,b,c,d,e]:C):ReactNode{
 switch(v){
  case 1:return <><P fill={a} d={`M-40 0H215C278 44 273 109 233 150C185 199 128 183 95 239C70 282 83 337 128 380H-40Z`}/><P fill={b} d={`M170 -40C232 45 348 29 381 116C409 188 326 223 348 292C370 358 465 350 493 ${h+40}H250C233 338 263 293 224 254C174 204 117 184 153 118C182 65 185 20 170 -40Z`}/><P fill={c} d={`M405 -30H650V${h+40}H470C505 324 454 277 477 222C500 168 571 141 544 84C522 37 449 25 405 -30Z`}/><circle cx="102" cy={h*.25} r="48" fill={d}/><ellipse cx="430" cy={h*.72} rx="64" ry="42" fill={e}/></>;
  case 2:return <><P fill={a} d={`M-40 -20H670V74C563 55 511 121 425 111C333 101 298 29 204 52C128 70 89 127 -40 92Z`}/><P fill={b} d={`M-50 ${h*.54}C72 ${h*.36} 156 ${h*.68} 265 ${h*.51}C366 ${h*.35} 449 ${h*.56} 660 ${h*.30}V${h+40}H-50Z`}/><P fill={c} d={`M190 -30C245 80 174 144 240 205C303 263 397 189 438 263C473 327 423 359 476 ${h+30}H306C278 361 319 322 264 282C197 235 116 236 139 146C154 89 129 34 190 -30Z`}/><circle cx="535" cy={h*.23} r="58" fill={d}/><circle cx="90" cy={h*.77} r="36" fill={e}/></>;
  case 3:return <><P fill={a} d={`M-40 0H185C239 38 246 91 215 138C177 197 89 205 64 272C43 329 67 358 101 ${h+30}H-40Z`}/><P fill={b} d={`M145 ${h+30}C124 323 165 270 217 256C287 238 320 301 386 273C453 244 439 171 503 143C552 121 608 144 650 174V${h+30}Z`}/><P fill={c} d={`M284 -40H650V116C593 145 527 123 487 83C448 43 413 22 351 56C322 72 302 38 284 -40Z`}/><ellipse cx="335" cy={h*.47} rx="84" ry="56" fill={d}/><circle cx="553" cy={h*.72} r="46" fill={e}/></>;
  case 4:return <><P fill={a} d={`M-40 -30H264C218 37 232 96 285 136C347 183 333 239 276 273C216 309 218 348 254 ${h+30}H-40Z`}/><P fill={b} d={`M230 -30H650V${h*.38}C572 ${h*.43} 531 ${h*.32} 461 ${h*.39}C393 ${h*.46} 382 ${h*.58} 306 ${h*.57}C247 ${h*.56} 216 ${h*.46} 230 -30Z`}/><P fill={c} d={`M650 ${h*.38}V${h+40}H221C251 ${h*.85} 327 ${h*.84} 376 ${h*.71}C428 ${h*.57} 483 ${h*.55} 535 ${h*.62}C579 ${h*.67} 617 ${h*.61} 650 ${h*.38}Z`}/><circle cx="105" cy={h*.27} r="54" fill={d}/><circle cx="516" cy={h*.80} r="40" fill={e}/></>;
  case 5:return <><P fill={a} d={`M-40 65C55 21 115 86 195 51C269 18 313 -29 394 -5C467 17 509 88 650 49V-40H-40Z`}/><P fill={b} d={`M-40 ${h*.72}C57 ${h*.57} 111 ${h*.76} 193 ${h*.66}C289 ${h*.55} 330 ${h*.32} 431 ${h*.39}C511 ${h*.45} 551 ${h*.66} 650 ${h*.56}V${h+40}H-40Z`}/><P fill={c} d={`M80 -20C143 86 105 174 166 227C232 284 302 227 358 276C410 321 396 366 431 ${h+20}H248C210 357 232 319 173 285C111 249 31 246 58 166C77 109 34 42 80 -20Z`}/><ellipse cx="493" cy={h*.21} rx="68" ry="44" fill={d}/><ellipse cx="96" cy={h*.82} rx="48" ry="31" fill={e}/></>;
  case 6:return <><P fill={a} d={`M-60 0H126C217 53 200 141 260 199C317 254 398 214 454 267C503 313 488 360 522 ${h+30}H-60Z`}/><P fill={b} d={`M95 -40H650V124C579 154 519 109 460 125C383 145 371 218 294 207C227 197 191 137 131 111C104 98 85 38 95 -40Z`}/><P fill={c} d={`M650 108V${h+40}H444C401 333 436 283 487 251C549 211 546 150 650 108Z`}/><circle cx="103" cy={h*.61} r="60" fill={d}/><circle cx="421" cy={h*.18} r="34" fill={e}/></>;
  case 7:return <><P fill={a} d={`M-50 -30H222C298 21 272 95 208 127C144 159 136 204 188 240C238 276 234 334 178 ${h+30}H-50Z`}/><P fill={b} d={`M174 ${h+30}C228 321 280 283 318 238C358 191 388 153 451 168C526 185 574 254 650 216V${h+30}Z`}/><P fill={c} d={`M221 -30H650V131C582 161 541 121 474 97C418 77 365 94 324 69C278 41 260 4 221 -30Z`}/><ellipse cx="329" cy={h*.58} rx="72" ry="46" fill={d}/><circle cx="552" cy={h*.62} r="39" fill={e}/></>;
  case 8:return <><P fill={a} d={`M-50 ${h*.20}C52 87 126 92 198 139C265 182 286 241 356 258C426 275 489 231 548 256C592 275 622 309 650 342V-30H-50Z`}/><P fill={b} d={`M-40 ${h*.66}C82 ${h*.49} 168 ${h*.78} 286 ${h*.58}C368 ${h*.44} 451 ${h*.48} 650 ${h*.74}V${h+40}H-40Z`}/><P fill={c} d={`M361 -40C389 48 354 94 389 142C430 197 516 170 559 218C594 257 584 302 650 337V-40Z`}/><circle cx="126" cy={h*.31} r="44" fill={d}/><ellipse cx="302" cy={h*.80} rx="63" ry="36" fill={e}/></>;
  case 9:return <><P fill={a} d={`M-50 -30H650V82C550 111 504 54 405 78C322 98 296 180 213 169C145 160 93 105 -50 132Z`}/><P fill={b} d={`M-40 ${h*.44}C75 ${h*.39} 116 ${h*.54} 202 ${h*.49}C300 ${h*.43} 365 ${h*.25} 453 ${h*.33}C534 ${h*.41} 572 ${h*.58} 650 ${h*.49}V${h+30}H-40Z`}/><P fill={c} d={`M-40 ${h*.78}C69 ${h*.68} 143 ${h*.90} 244 ${h*.72}C332 ${h*.57} 406 ${h*.64} 650 ${h*.82}V${h+30}H-40Z`}/><circle cx="516" cy={h*.17} r="48" fill={d}/><circle cx="120" cy={h*.66} r="42" fill={e}/></>;
  case 10:return <><P fill={a} d={`M-50 -30H198C261 40 235 101 182 142C127 184 125 235 183 275C235 311 239 357 205 ${h+30}H-50Z`}/><P fill={b} d={`M171 -30H424C384 43 409 97 464 133C524 171 535 218 488 269C445 315 448 354 474 ${h+30}H221C248 349 220 309 179 274C128 231 133 184 190 143C247 102 241 42 171 -30Z`}/><P fill={c} d={`M402 -30H650V${h+30}H464C429 360 426 319 481 269C535 220 522 171 461 134C405 99 379 44 402 -30Z`}/><circle cx="300" cy={h*.52} r="48" fill={d}/><circle cx="557" cy={h*.22} r="34" fill={e}/></>;
  case 11:return <><P fill={a} d={`M-40 ${h*.16}C80 52 157 58 226 117C284 167 310 222 372 227C443 233 509 178 650 202V-30H-40Z`}/><P fill={b} d={`M-40 ${h*.58}C82 ${h*.43} 161 ${h*.61} 250 ${h*.54}C343 ${h*.47} 389 ${h*.29} 469 ${h*.40}C530 ${h*.49} 577 ${h*.69} 650 ${h*.62}V${h+40}H-40Z`}/><P fill={c} d={`M168 -40C232 43 185 96 234 153C280 207 363 173 401 230C442 292 391 331 430 ${h+30}H271C243 350 278 314 228 276C174 235 103 219 127 149C147 91 115 24 168 -40Z`}/><ellipse cx="522" cy={h*.22} rx="58" ry="39" fill={d}/><circle cx="95" cy={h*.75} r="46" fill={e}/></>;
  default:return <><P fill={a} d={`M-40 -30H650V${h*.30}C550 ${h*.26} 505 ${h*.42} 415 ${h*.37}C324 ${h*.32} 291 ${h*.11} 198 ${h*.16}C113 ${h*.20} 62 ${h*.37} -40 ${h*.30}Z`}/><P fill={b} d={`M-40 ${h*.57}C66 ${h*.48} 139 ${h*.68} 225 ${h*.59}C319 ${h*.49} 365 ${h*.39} 460 ${h*.50}C529 ${h*.58} 577 ${h*.74} 650 ${h*.65}V${h+30}H-40Z`}/><P fill={c} d={`M276 -40C326 59 269 121 325 181C381 240 468 190 511 254C550 313 514 360 548 ${h+30}H373C345 357 381 317 327 273C267 224 190 228 214 148C234 84 205 22 276 -40Z`}/><circle cx="112" cy={h*.22} r="47" fill={d}/><ellipse cx="466" cy={h*.77} rx="70" ry="40" fill={e}/></>;
 }
}

function bauhaus(v:number,h:number,[a,b,c,d,e]:C):ReactNode{
 const mid=h/2;
 switch(v){
  case 1:return <><rect x="-10" y="-10" width="210" height={h*.55} fill={a}/><circle cx="205" cy={h*.70} r="115" fill={b}/><rect x="315" width="105" height={h} fill={c}/><path d={`M420 0H610V${mid}A95 95 0 0 1 515 ${mid+95}H420Z`} fill={d}/><circle cx="510" cy={h*.18} r="46" fill={e}/></>;
  case 2:return <><circle cx="90" cy={mid} r="150" fill={a}/><rect x="180" y="-10" width="135" height={h+20} fill={b}/><path d={`M315 0H610V${h*.40}H455A140 140 0 0 1 315 ${h*.14}Z`} fill={c}/><rect x="420" y={h*.55} width="190" height={h*.45} fill={d}/><circle cx="497" cy={h*.72} r="42" fill={e}/></>;
  case 3:return <><rect width="600" height={h} fill={a}/><circle cx="300" cy={mid} r="145" fill={b}/><circle cx="300" cy={mid} r="75" fill={c}/><rect x="0" y={mid-32} width="600" height="64" fill={d}/><rect x="270" y="0" width="60" height={h} fill={e}/></>;
  case 4:return <><rect x="-10" width="190" height={h} fill={a}/><path d={`M180 0H420L300 ${mid}L420 ${h}H180L300 ${mid}Z`} fill={b}/><circle cx="500" cy={h*.25} r="90" fill={c}/><circle cx="500" cy={h*.75} r="62" fill={d}/><rect x="465" y={mid-18} width="70" height="36" fill={e}/></>;
  case 5:return <><path d={`M0 0H300V${mid}H0Z`} fill={a}/><path d={`M300 0H600V${mid}H300Z`} fill={b}/><path d={`M0 ${mid}H300V${h}H0Z`} fill={c}/><path d={`M300 ${mid}H600V${h}H300Z`} fill={d}/><circle cx="300" cy={mid} r="112" fill={e}/></>;
  case 6:return <><rect width="600" height={h} fill={a}/><path d={`M-20 ${h}V${h*.42}A185 185 0 0 1 165 ${h*.23}A185 185 0 0 1 350 ${h*.42}V${h}Z`} fill={b}/><circle cx="470" cy={h*.33} r="100" fill={c}/><rect x="420" y={h*.62} width="180" height={h*.38} fill={d}/><circle cx="470" cy={h*.33} r="38" fill={e}/></>;
  case 7:return <><rect width="600" height={h} fill={a}/><path d={`M0 0H225L80 ${h}H0Z`} fill={b}/><path d={`M225 0H430L575 ${h}H370Z`} fill={c}/><circle cx="305" cy={mid} r="80" fill={d}/><rect x="250" y={mid-22} width="110" height="44" fill={e}/></>;
  case 8:return <><circle cx="0" cy="0" r="210" fill={a}/><circle cx="600" cy={h} r="220" fill={b}/><rect x="210" y="0" width="180" height={h} fill={c}/><circle cx="300" cy={mid} r="92" fill={d}/><circle cx="300" cy={mid} r="34" fill={e}/></>;
  case 9:return <><rect width="600" height={h} fill={a}/><circle cx="150" cy={mid} r="125" fill={b}/><circle cx="450" cy={mid} r="125" fill={c}/><rect x="150" y={mid-45} width="300" height="90" fill={d}/><rect x="285" width="30" height={h} fill={e}/></>;
  case 10:return <><path d={`M0 0H600L450 ${mid}L600 ${h}H0L150 ${mid}Z`} fill={a}/><path d={`M150 ${mid}L300 0L450 ${mid}L300 ${h}Z`} fill={b}/><circle cx="150" cy={mid} r="55" fill={c}/><circle cx="450" cy={mid} r="55" fill={d}/><rect x="275" y={mid-25} width="50" height="50" fill={e}/></>;
  case 11:return <><rect width="600" height={h} fill={a}/><path d={`M0 ${h*.68}Q150 ${h*.18} 300 ${h*.68}T600 ${h*.68}V${h}H0Z`} fill={b}/><circle cx="130" cy={h*.25} r="72" fill={c}/><rect x="245" width="110" height={h*.48} fill={d}/><circle cx="480" cy={h*.28} r="46" fill={e}/></>;
  default:return <><rect width="600" height={h} fill={a}/><path d={`M0 0H600V${h*.26}H0Z`} fill={b}/><path d={`M0 ${h*.74}H600V${h}H0Z`} fill={c}/><circle cx="300" cy={mid} r="128" fill={d}/><rect x="260" y={mid-128} width="80" height="256" fill={e}/></>;
 }
}

const camoPath=(x:number,y:number,w:number,h:number,flip=false)=>`M${x} ${y}C${x+w*.25} ${y-h*.35} ${x+w*.72} ${y-h*.18} ${x+w} ${y+h*.12}C${x+w*.78} ${y+h*.44} ${x+w*.58} ${y+h*.48} ${x+w*.34} ${y+h*.34}C${x+w*.12} ${y+h*.22} ${x-w*.05} ${y+h*.08} ${x} ${y}${flip?"Z":"Z"}`;
function camo(v:number,h:number,colors:C):ReactNode{
 const [a,b,c,d,e]=colors;
 const layouts=[
  [[-40,70,250,160],[130,210,220,135],[350,85,260,150],[390,300,230,145],[30,350,210,115]],
  [[-60,150,220,120],[70,45,210,150],[250,210,265,155],[430,65,220,130],[455,330,190,110]],
  [[-30,40,250,145],[175,95,195,110],[330,30,300,170],[55,285,245,140],[310,315,250,130]],
  [[-60,240,260,155],[40,60,240,130],[250,135,220,140],[410,250,250,155],[370,20,230,105]],
  [[-30,110,190,120],[125,20,260,150],[285,210,255,150],[475,70,180,120],[50,330,300,140]],
  [[-50,30,245,145],[140,160,260,160],[365,40,245,135],[410,260,240,160],[-10,325,220,110]],
  [[-50,200,230,135],[50,20,200,125],[220,90,270,160],[430,190,220,135],[300,335,280,120]],
  [[-70,70,270,155],[120,260,210,125],[270,30,235,145],[410,245,250,145],[30,355,230,115]],
  [[-40,20,215,120],[70,180,270,155],[280,55,210,125],[405,190,250,150],[330,350,245,110]],
  [[-60,300,220,120],[20,80,280,160],[235,250,250,150],[385,40,260,155],[430,340,210,105]],
  [[-35,100,245,140],[145,300,260,135],[240,20,250,145],[410,155,235,145],[20,365,210,100]],
  [[-65,30,250,150],[90,220,230,145],[275,120,260,160],[440,300,210,125],[385,0,220,115]]
 ][v-1]||[];
 return <>{layouts.map((q,i)=><P key={i} d={camoPath(q[0],Math.min(h-10,q[1]),q[2],q[3],i%2===0)} fill={colors[i%5]}/>)}
 <circle cx={(v*83)%560+20} cy={Math.min(h-30,45+(v*41)%Math.max(80,h-60))} r={22+(v%3)*8} fill={[d,e,a][v%3]} opacity=".9"/></>;
}

function graffiti(v:number,h:number,[a,b,c,d,e]:C):ReactNode{
 switch(v){
  case 1:return <><S d={`M-40 ${h*.70}C120 ${h*.10} 200 ${h*.95} 340 ${h*.34}S520 ${h*.15} 650 ${h*.72}`} stroke={a} width={36}/><S d={`M-30 ${h*.34}C140 ${h*.82} 280 ${h*.04} 470 ${h*.58}S570 ${h*.80} 650 ${h*.20}`} stroke={b} width={24}/><circle cx="190" cy={h*.28} r="38" fill={c}/><circle cx="455" cy={h*.72} r="24" fill={d}/></>;
  case 2:return <><S d={`M40 ${h*.80}L180 ${h*.15}L280 ${h*.75}L410 ${h*.20}L570 ${h*.80}`} stroke={a} width={42}/><S d={`M20 ${h*.56}L580 ${h*.42}`} stroke={b} width={16}/>{[0,1,2,3,4].map(i=><circle key={i} cx={80+i*105} cy={h*(.18+(i%2)*.64)} r={11+i*2} fill={[c,d,e,c,d][i]}/>)}</>;
  case 3:return <><S d={`M-30 ${h*.52}C120 ${h*.02} 180 ${h*.98} 330 ${h*.48}S520 ${h*.04} 650 ${h*.52}`} stroke={a} width={48}/><S d={`M20 ${h*.20}Q300 ${h*.88} 580 ${h*.20}`} stroke={b} width={18} dash="34 18"/><ellipse cx="300" cy={h*.52} rx="66" ry="40" fill={c}/></>;
  case 4:return <><S d={`M60 ${h*.18}Q190 ${h*.02} 270 ${h*.42}T540 ${h*.34}`} stroke={a} width={28}/><S d={`M40 ${h*.82}Q180 ${h*.46} 310 ${h*.76}T590 ${h*.62}`} stroke={b} width={38}/><S d={`M115 ${h*.12}L480 ${h*.90}`} stroke={c} width={12}/>{[0,1,2,3,4,5].map(i=><circle key={i} cx={60+i*96} cy={h*(.25+(i%3)*.18)} r={8+(i%2)*7} fill={[d,e,a][i%3]}/>)}</>;
  case 5:return <><S d={`M-20 ${h*.72}C80 ${h*.36} 160 ${h*.32} 250 ${h*.62}C335 ${h*.90} 410 ${h*.12} 620 ${h*.46}`} stroke={a} width={44}/><S d={`M30 ${h*.28}C160 ${h*.72} 260 ${h*.00} 410 ${h*.42}S550 ${h*.72} 630 ${h*.20}`} stroke={b} width={22}/><S d={`M80 ${h*.52}H540`} stroke={c} width={9} dash="12 20"/><circle cx="505" cy={h*.74} r="31" fill={d}/></>;
  case 6:return <><S d={`M50 ${h*.10}C160 ${h*.35} 190 ${h*.70} 110 ${h*.88}`} stroke={a} width={32}/><S d={`M200 ${h*.86}C280 ${h*.44} 330 ${h*.08} 410 ${h*.26}S520 ${h*.70} 590 ${h*.15}`} stroke={b} width={46}/><S d={`M40 ${h*.48}L570 ${h*.52}`} stroke={c} width={14}/><circle cx="312" cy={h*.49} r="42" fill={d}/></>;
  case 7:return <><S d={`M-30 ${h*.25}Q145 ${h*.78} 310 ${h*.22}T640 ${h*.30}`} stroke={a} width={38}/><S d={`M-30 ${h*.78}Q145 ${h*.22} 310 ${h*.80}T640 ${h*.72}`} stroke={b} width={30}/><circle cx="300" cy={h*.5} r="72" fill="none" stroke={c} strokeWidth="18"/><circle cx="300" cy={h*.5} r="17" fill={d}/></>;
  case 8:return <><S d={`M20 ${h*.14}L580 ${h*.86}`} stroke={a} width={50}/><S d={`M20 ${h*.86}L580 ${h*.14}`} stroke={b} width={34}/><S d={`M80 ${h*.50}Q300 ${h*.18} 520 ${h*.50}Q300 ${h*.82} 80 ${h*.50}`} stroke={c} width={16}/><circle cx="300" cy={h*.50} r="32" fill={d}/></>;
  case 9:return <><S d={`M-40 ${h*.60}C110 ${h*.42} 170 ${h*.02} 300 ${h*.22}S470 ${h*.92} 650 ${h*.38}`} stroke={a} width={42}/><S d={`M0 ${h*.32}C160 ${h*.70} 260 ${h*.36} 360 ${h*.62}S530 ${h*.72} 620 ${h*.20}`} stroke={b} width={26}/>{Array.from({length:10}).map((_,i)=><circle key={i} cx={45+i*55} cy={h*(.18+((i*17)%65)/100)} r={6+(i%3)*4} fill={[c,d,e][i%3]}/>)}</>;
  case 10:return <><S d={`M30 ${h*.25}H570`} stroke={a} width={24} dash="60 16"/><S d={`M30 ${h*.75}H570`} stroke={b} width={42} dash="28 22"/><S d={`M160 ${h*.06}V${h*.94}M440 ${h*.06}V${h*.94}`} stroke={c} width={12}/><circle cx="300" cy={h*.50} r="63" fill={d}/></>;
  case 11:return <><S d={`M-30 ${h*.82}C120 ${h*.12} 250 ${h*.12} 320 ${h*.54}S510 ${h*.96} 640 ${h*.20}`} stroke={a} width={52}/><S d={`M20 ${h*.22}C170 ${h*.92} 310 ${h*.12} 580 ${h*.70}`} stroke={b} width={16}/><S d={`M80 ${h*.52}L520 ${h*.52}`} stroke={c} width={8} dash="10 14"/><circle cx="160" cy={h*.25} r="26" fill={d}/><circle cx="500" cy={h*.78} r="33" fill={e}/></>;
  default:return <><S d={`M-20 ${h*.18}L180 ${h*.82}L300 ${h*.24}L420 ${h*.78}L620 ${h*.16}`} stroke={a} width={44}/><S d={`M20 ${h*.52}C160 ${h*.20} 260 ${h*.82} 390 ${h*.48}S520 ${h*.18} 600 ${h*.54}`} stroke={b} width={24}/>{[0,1,2,3,4,5].map(i=><circle key={i} cx={55+i*100} cy={h*(.18+(i%2)*.63)} r={10+(i%3)*4} fill={[c,d,e][i%3]}/>)}</>;
 }
}

function brand(v:number,h:number,[a,b,c,d,e]:C):ReactNode{
 const mid=h/2;
 switch(v){
  case 1:return <><rect width="600" height={h} fill={a}/><path d={`M0 0H220L405 ${h}H185Z`} fill={b}/><rect x="405" y={h*.15} width="155" height={h*.70} rx="12" fill={c}/><rect x="435" y={h*.37} width="95" height={h*.26} rx="8" fill={d}/></>;
  case 2:return <><rect width="600" height={h} fill={a}/><circle cx="0" cy={mid} r="210" fill={b}/><circle cx="600" cy={mid} r="210" fill={c}/><rect x="220" y={h*.20} width="160" height={h*.60} rx="14" fill={d}/><rect x="245" y={h*.40} width="110" height={h*.20} rx="8" fill={e}/></>;
  case 3:return <><rect width="600" height={h} fill={a}/><path d={`M0 ${h*.67}L210 0H390L600 ${h*.67}V${h}H0Z`} fill={b}/><rect x="205" y={h*.25} width="190" height={h*.50} rx="12" fill={c}/><rect x="240" y={h*.41} width="120" height={h*.18} rx="7" fill={d}/></>;
  case 4:return <><rect width="600" height={h} fill={a}/><rect x="0" y="0" width="600" height={h*.26} fill={b}/><rect x="0" y={h*.74} width="600" height={h*.26} fill={c}/><circle cx="300" cy={mid} r="118" fill={d}/><rect x="230" y={mid-36} width="140" height="72" rx="10" fill={e}/></>;
  case 5:return <><rect width="600" height={h} fill={a}/><path d={`M0 0H310L180 ${h}H0Z`} fill={b}/><path d={`M600 0H460L330 ${h}H600Z`} fill={c}/><rect x="225" y={h*.22} width="150" height={h*.56} rx="14" fill={d}/><rect x="250" y={h*.43} width="100" height={h*.14} rx="7" fill={e}/></>;
  case 6:return <><rect width="600" height={h} fill={a}/><path d={`M0 0H600V${h*.52}C460 ${h*.36} 390 ${h*.74} 265 ${h*.56}C160 ${h*.41} 100 ${h*.68} 0 ${h*.57}Z`} fill={b}/><rect x="390" y={h*.58} width="165" height={h*.27} rx="12" fill={c}/><rect x="420" y={h*.66} width="105" height={h*.11} rx="6" fill={d}/></>;
  case 7:return <><rect width="600" height={h} fill={a}/><rect x="0" y="0" width="205" height={h} fill={b}/><rect x="395" y="0" width="205" height={h} fill={c}/><circle cx="300" cy={mid} r="115" fill={d}/><rect x="245" y={mid-30} width="110" height="60" rx="8" fill={e}/></>;
  case 8:return <><rect width="600" height={h} fill={a}/><path d={`M0 0H600L470 ${h*.36}L600 ${h*.72}V${h}H0L130 ${h*.64}L0 ${h*.28}Z`} fill={b}/><rect x="215" y={h*.26} width="170" height={h*.48} rx="14" fill={c}/><rect x="245" y={h*.43} width="110" height={h*.14} rx="7" fill={d}/></>;
  case 9:return <><rect width="600" height={h} fill={a}/><circle cx="130" cy={h*.24} r="120" fill={b}/><circle cx="470" cy={h*.76} r="135" fill={c}/><rect x="205" y={h*.27} width="190" height={h*.46} rx="12" fill={d}/><rect x="240" y={h*.44} width="120" height={h*.12} rx="7" fill={e}/></>;
  case 10:return <><rect width="600" height={h} fill={a}/><path d={`M0 0H600V${h*.30}H0Z`} fill={b}/><path d={`M0 ${h*.70}H600V${h}H0Z`} fill={c}/><rect x="180" y={h*.34} width="240" height={h*.32} rx="16" fill={d}/><rect x="230" y={h*.44} width="140" height={h*.12} rx="7" fill={e}/></>;
  case 11:return <><rect width="600" height={h} fill={a}/><path d={`M0 0L300 ${mid}L0 ${h}Z`} fill={b}/><path d={`M600 0L300 ${mid}L600 ${h}Z`} fill={c}/><circle cx="300" cy={mid} r="106" fill={d}/><rect x="245" y={mid-28} width="110" height="56" rx="8" fill={e}/></>;
  default:return <><rect width="600" height={h} fill={a}/><path d={`M0 ${h*.15}L600 ${h*.42}V${h*.75}L0 ${h*.48}Z`} fill={b}/><rect x="375" y={h*.14} width="175" height={h*.22} rx="11" fill={c}/><rect x="55" y={h*.64} width="175" height={h*.22} rx="11" fill={d}/><circle cx="300" cy={mid} r="48" fill={e}/></>;
 }
}

function ribbons(v:number,h:number,[a,b,c,d,e]:C):ReactNode{
 const paths=[
  [`M-60 ${h*.18}C110 ${h*.82} 210 ${h*.02} 360 ${h*.54}S540 ${h*.78} 660 ${h*.22}`,`M-60 ${h*.52}C110 ${h*.10} 250 ${h*.94} 420 ${h*.38}S560 ${h*.14} 660 ${h*.64}`],
  [`M40 -40C160 ${h*.18} 75 ${h*.54} 205 ${h*.76}S420 ${h*.42} 560 ${h+30}`,`M160 -30C300 ${h*.22} 240 ${h*.58} 370 ${h*.72}S520 ${h*.56} 650 ${h*.84}`],
  [`M-40 ${h*.72}Q120 ${h*.12} 300 ${h*.50}T640 ${h*.24}`,`M-40 ${h*.38}Q170 ${h*.92} 330 ${h*.46}T640 ${h*.76}`],
  [`M-30 ${h*.20}C120 ${h*.30} 130 ${h*.82} 300 ${h*.72}S475 ${h*.12} 640 ${h*.28}`,`M-30 ${h*.62}C150 ${h*.48} 195 ${h*.08} 350 ${h*.22}S505 ${h*.86} 640 ${h*.66}`],
  [`M-40 ${h*.50}C80 ${h*.10} 190 ${h*.10} 300 ${h*.50}S520 ${h*.90} 640 ${h*.50}`,`M-40 ${h*.76}C120 ${h*.52} 215 ${h*.52} 300 ${h*.76}S515 ${h*.98} 640 ${h*.72}`],
  [`M-40 ${h*.22}Q150 ${h*.78} 300 ${h*.22}T640 ${h*.22}`,`M-40 ${h*.52}Q150 ${h*.96} 300 ${h*.52}T640 ${h*.52}`],
  [`M-20 -30C65 ${h*.16} 100 ${h*.74} 220 ${h*.52}S390 ${h*.20} 470 ${h*.54}S555 ${h*.92} 650 ${h*.62}`,`M120 -20C205 ${h*.22} 165 ${h*.62} 300 ${h*.74}S475 ${h*.34} 610 ${h*.40}`],
  [`M-40 ${h*.82}C130 ${h*.26} 235 ${h*.96} 370 ${h*.38}S510 ${h*.04} 640 ${h*.32}`,`M-40 ${h*.34}C130 ${h*.82} 240 ${h*.12} 390 ${h*.62}S550 ${h*.92} 640 ${h*.72}`],
  [`M-30 ${h*.16}H150C250 ${h*.16} 240 ${h*.48} 340 ${h*.48}H630`,`M-30 ${h*.78}H220C315 ${h*.78} 305 ${h*.42} 410 ${h*.42}H630`],
  [`M-40 ${h*.50}C110 ${h*.12} 165 ${h*.88} 300 ${h*.50}S490 ${h*.12} 640 ${h*.50}`,`M70 -20C180 ${h*.20} 120 ${h*.72} 300 ${h*.50}S455 ${h*.24} 540 ${h+20}`],
  [`M-40 ${h*.24}C100 ${h*.64} 230 ${h*.64} 320 ${h*.34}S500 ${h*.08} 640 ${h*.46}`,`M-40 ${h*.72}C120 ${h*.40} 230 ${h*.42} 340 ${h*.74}S520 ${h*.92} 640 ${h*.54}`],
  [`M-40 ${h*.18}C110 ${h*.18} 110 ${h*.82} 260 ${h*.82}S410 ${h*.18} 640 ${h*.18}`,`M-40 ${h*.52}C135 ${h*.52} 135 ${h*.94} 300 ${h*.94}S465 ${h*.52} 640 ${h*.52}`]
 ];
 const [p1,p2]=paths[v-1]||paths[0];
 return <><S d={p1} stroke={a} width={58}/><S d={p1} stroke={b} width={31}/><S d={p2} stroke={c} width={48}/><S d={p2} stroke={d} width={20}/><circle cx={300+(v%3-1)*105} cy={h*(.25+(v%4)*.14)} r={16+(v%3)*6} fill={e}/></>;
}

function generic(renderer:string,v:number,h:number,[a,b,c,d,e]:C):ReactNode{
 switch(renderer){
  case "blobs":return <>{[0,1,2,3,4].map(n=><ellipse key={n} cx={70+n*130+(v%3)*15} cy={h*(.18+((n*23+v*11)%62)/100)} rx={66+(n%2)*28} ry={44+((n+v)%3)*16} fill={[a,b,c,d,e][n]}/>)}</>;
  case "geometry":return <><path d={`M-40 0H210L410 ${h}H140Z`} fill={a}/><path d={`M260 0H540L650 ${h*.62} 430 ${h}Z`} fill={b}/><circle cx="455" cy={h*.24} r={72} fill={c}/><rect x="40" y={h*.58} width="155" height={h*.34} fill={d}/></>;
  case "blocks":return <><rect width="210" height={h} fill={a}/><rect x="210" width="180" height={h*.5} fill={b}/><rect x="210" y={h*.5} width="180" height={h*.5} fill={c}/><rect x="390" width="210" height={h*.65} fill={d}/><rect x="390" y={h*.65} width="210" height={h*.35} fill={e}/></>;
  case "waves":return <>{[a,b,c,d,e].map((col,i)=><S key={col} d={`M-60 ${h*(.12+i*.18)}Q120 ${h*(.02+i*.14)} 300 ${h*(.18+i*.14)}T660 ${h*(.12+i*.16)}`} stroke={col} width={40-(i%2)*9}/>)}</>;
  case "contour":return <g fill="none" stroke={b} strokeWidth="7">{Array.from({length:9}).map((_,i)=><ellipse key={i} cx={300+(i%2)*18} cy={h/2} rx={55+i*38} ry={30+i*24}/>)}</g>;
  case "grid":return <>{Array.from({length:30}).map((_,i)=>{const x=(i%6)*105-10,y=Math.floor(i/6)*(h/5);return <rect key={i} x={x} y={y} width={75+(i%3)*18} height={h/7} fill={[a,b,c,d,e][(i+v)%5]}/>})}</>;
  case "pixel":return <>{Array.from({length:48}).map((_,i)=>{const x=(i%8)*78-10,y=Math.floor(i/8)*(h/6);return <rect key={i} x={x} y={y} width="58" height={h/8} fill={[a,b,c,d,e][(i*3+v)%5]} opacity={.45+((i+v)%4)*.16}/>})}</>;
  case "diagonal":return <>{[0,1,2,3,4].map(i=><path key={i} d={`M${i*150-210} -40H${i*150-80}L${i*150+140} ${h+40}H${i*150+10}Z`} fill={[a,b,c,d,e][i]}/>)}</>;
  case "radial":return <>{[a,b,c,d,e,a,b,c].map((col,i)=><path key={i} d={`M300 ${h/2}L${300+520*Math.cos(i*Math.PI/4)} ${h/2+520*Math.sin(i*Math.PI/4)}L${300+520*Math.cos((i+1)*Math.PI/4)} ${h/2+520*Math.sin((i+1)*Math.PI/4)}Z`} fill={col}/>)}</>;
  case "sunset":return <>{[e,d,c,b,a].map((col,i)=><path key={col} d={`M-60 ${h*(.15+i*.16)}Q150 ${h*(.02+i*.14)} 320 ${h*(.18+i*.14)}T660 ${h*(.12+i*.16)}V${h+70}H-60Z`} fill={col}/>)}</>;
  case "neon":return <>{[b,c,d,e].map((col,i)=><S key={col} d={`M${-80+i*25} ${h*(.2+i*.17)}C140 ${h*(.05+i*.08)} 380 ${h*(.85-i*.12)} 680 ${h*(.2+i*.16)}`} stroke={col} width={12+i*5}/>)}</>;
  case "mono":return <>{[0,1,2,3,4].map(i=><path key={i} d={`M${-120+i*110} -40C${40+i*95} ${h*.2} ${20+i*120} ${h*.8} ${180+i*105} ${h+40}H${330+i*80}V-40Z`} fill={[a,b,c,d,e][i]}/>)}</>;
  case "concrete":return <><rect x="-40" y="-40" width="680" height={h*.3} fill={a}/><rect x="350" y={h*.3} width="290" height={h*.7} fill={b}/><circle cx="160" cy={h*.7} r="92" fill={c}/></>;
  case "type":return <><text x="300" y={h*.48} textAnchor="middle" fill={a} fontSize="112" fontWeight="900" letterSpacing="-7">PLAY</text><text x="300" y={h*.72} textAnchor="middle" fill={b} fontSize="55" fontWeight="900" letterSpacing="8">THE CITY</text></>;
  case "local":return <><rect width="600" height={h} fill={a}/><path d={`M0 ${h*.62}L600 ${h*.18}V${h}H0Z`} fill={b}/><text x="300" y={h*.57} textAnchor="middle" fill={c} fontSize="88" fontWeight="900" letterSpacing="4">CITY</text></>;
  case "nature":return <>{[0,1,2,3,4,5].map(i=><path key={i} d={`M${30+i*95} ${h+45}Q${80+i*75} ${h*.35} ${125+i*80} ${h*.08}Q${190+i*60} ${h*.48} ${210+i*75} ${h+45}Z`} fill={[a,b,c,d,e][i%5]}/>)}</>;
  case "kids":return <>{Array.from({length:18}).map((_,i)=>i%3===0?<circle key={i} cx={(i*71)%620} cy={(i*47)%h} r={22+(i%4)*8} fill={[a,b,c,d,e][i%5]}/>:<rect key={i} x={(i*83)%620} y={(i*39)%h} width={35+(i%3)*20} height={35+(i%2)*20} rx={i%2?18:4} fill={[a,b,c,d,e][i%5]}/>)}</>;
  case "premium":return <><rect width="600" height={h} fill={a}/><path d={`M0 ${h*.75}L220 0H390L160 ${h}H0Z`} fill={b}/><circle cx="485" cy={h*.28} r="95" fill={c}/><rect x="410" y={h*.62} width="190" height={h*.38} fill={d}/></>;
  case "terrazzo":return <>{Array.from({length:42}).map((_,i)=>{const x=(i*97)%640-20,y=(i*53)%h,r=8+(i%5)*4;return <path key={i} d={`M${x-r} ${y}q${r} -${r*1.6} ${r*2} 0q-${r*.3} ${r*1.8} -${r*2} 0z`} fill={[a,b,c,d,e][i%5]}/>})}</>;
  default:return organic(v,h,[a,b,c,d,e]);
 }
}

export function PatternArt({p,h}:{p:Project;h:number}){
 const family=getPatternFamily(p.patternFamily),palette=getPatternPalette(p.patternPalette),v=Math.max(1,Math.min(12,p.patternVariant||1));
 const opacity=p.graphicOpacity/100,scale=(p.graphicScale/100)*((p.patternDensity||100)/100);
 const colors=palette.colors;
 const transform=`translate(300 ${h/2}) rotate(${p.graphicRotation}) scale(${scale}) translate(-300 -${h/2})`;
 let art:ReactNode;
 switch(family.renderer){
  case "organic":art=organic(v,h,colors);break;
  case "bauhaus":art=bauhaus(v,h,colors);break;
  case "camo":art=camo(v,h,colors);break;
  case "graffiti":art=graffiti(v,h,colors);break;
  case "brand":art=brand(v,h,colors);break;
  case "ribbons":art=ribbons(v,h,colors);break;
  default:art=generic(family.renderer,v,h,colors);
 }
 return <g opacity={opacity} transform={transform}>{art}</g>;
}
