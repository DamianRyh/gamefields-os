import {useId,type ReactNode} from "react";
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


function geometry(v:number,h:number,[a,b,c,d,e]:C):ReactNode{
 const mid=h/2;
 switch(v){
  case 1:return <><path d={`M-30 0H210L405 ${h}H150Z`} fill={a}/><path d={`M245 0H450L610 ${h*.62}L440 ${h}Z`} fill={b}/><circle cx="470" cy={h*.23} r="72" fill={c}/><rect x="42" y={h*.62} width="145" height={h*.28} fill={d}/></>;
  case 2:return <><rect width="600" height={h} fill={a}/><path d={`M0 0H300L190 ${h}H0Z`} fill={b}/><path d={`M600 0H420L300 ${h}H600Z`} fill={c}/><circle cx="300" cy={mid} r="78" fill={d}/><rect x="275" width="50" height={h} fill={e}/></>;
  case 3:return <><path d={`M0 0H600V${h*.34}L0 ${h*.72}Z`} fill={a}/><path d={`M0 ${h*.72}L600 ${h*.34}V${h}H0Z`} fill={b}/><rect x="225" y={h*.22} width="150" height={h*.56} fill={c}/><circle cx="300" cy={mid} r="44" fill={d}/></>;
  case 4:return <><rect width="600" height={h} fill={a}/><path d={`M0 0L270 ${mid}L0 ${h}Z`} fill={b}/><path d={`M600 0L330 ${mid}L600 ${h}Z`} fill={c}/><rect x="270" width="60" height={h} fill={d}/><circle cx="300" cy={mid} r="64" fill={e}/></>;
  case 5:return <><path d={`M0 0H240V${h*.42}H0Z`} fill={a}/><path d={`M240 0H600V${h*.24}H420V${h*.55}H240Z`} fill={b}/><path d={`M0 ${h*.42}H420V${h}H0Z`} fill={c}/><rect x="420" y={h*.24} width="180" height={h*.76} fill={d}/><circle cx="420" cy={h*.55} r="52" fill={e}/></>;
  case 6:return <><rect width="600" height={h} fill={a}/><path d={`M-30 ${h*.78}L180 0H310L90 ${h}H-30Z`} fill={b}/><path d={`M290 0H470L620 ${h*.72}V${h}H520Z`} fill={c}/><circle cx="390" cy={h*.48} r="82" fill={d}/></>;
  case 7:return <><path d={`M0 0H600L300 ${mid}Z`} fill={a}/><path d={`M0 ${h}H600L300 ${mid}Z`} fill={b}/><path d={`M0 0V${h}L300 ${mid}Z`} fill={c}/><path d={`M600 0V${h}L300 ${mid}Z`} fill={d}/><circle cx="300" cy={mid} r="38" fill={e}/></>;
  case 8:return <><rect width="600" height={h} fill={a}/><path d={`M0 0H185L300 ${mid}L185 ${h}H0Z`} fill={b}/><path d={`M600 0H415L300 ${mid}L415 ${h}H600Z`} fill={c}/><rect x="235" y={mid-48} width="130" height="96" fill={d}/></>;
  case 9:return <><path d={`M0 0H600V${h*.28}H0Z`} fill={a}/><path d={`M0 ${h*.28}H220V${h}H0Z`} fill={b}/><path d={`M220 ${h*.28}H600V${h*.68}H220Z`} fill={c}/><path d={`M220 ${h*.68}H600V${h}H220Z`} fill={d}/><circle cx="220" cy={h*.68} r="56" fill={e}/></>;
  case 10:return <><rect width="600" height={h} fill={a}/><path d={`M0 ${mid}L145 0H300L155 ${mid}L300 ${h}H145Z`} fill={b}/><path d={`M300 0H455L600 ${mid}L455 ${h}H300L445 ${mid}Z`} fill={c}/><circle cx="300" cy={mid} r="55" fill={d}/></>;
  case 11:return <><path d={`M0 0H160L320 ${h}H160Z`} fill={a}/><path d={`M160 0H330L490 ${h}H320Z`} fill={b}/><path d={`M330 0H500L660 ${h}H490Z`} fill={c}/><circle cx="115" cy={h*.72} r="48" fill={d}/><circle cx="500" cy={h*.23} r="36" fill={e}/></>;
  default:return <><rect width="600" height={h} fill={a}/><path d={`M0 0H300V${mid}H0Z`} fill={b}/><path d={`M300 ${mid}H600V${h}H300Z`} fill={c}/><path d={`M300 0L420 ${mid}L300 ${h}L180 ${mid}Z`} fill={d}/><circle cx="300" cy={mid} r="38" fill={e}/></>;
 }
}

function waves(v:number,h:number,[a,b,c,d,e]:C):ReactNode{
 const sets=[
  [`M-60 ${h*.18}Q110 ${h*.02} 300 ${h*.22}T660 ${h*.18}`,`M-60 ${h*.52}Q130 ${h*.34} 310 ${h*.56}T660 ${h*.50}`,`M-60 ${h*.80}Q150 ${h*.64} 320 ${h*.82}T660 ${h*.78}`],
  [`M-60 ${h*.20}C120 ${h*.70} 220 ${h*.00} 360 ${h*.48}S540 ${h*.78} 660 ${h*.24}`,`M-60 ${h*.46}C110 ${h*.92} 245 ${h*.20} 390 ${h*.63}S545 ${h*.90} 660 ${h*.52}`,`M-60 ${h*.72}C130 ${h*.98} 260 ${h*.42} 430 ${h*.78}S560 ${h*.92} 660 ${h*.72}`],
  [`M80 -40C160 ${h*.10} 120 ${h*.52} 250 ${h*.65}S430 ${h*.42} 520 ${h+40}`,`M210 -40C290 ${h*.18} 240 ${h*.55} 360 ${h*.70}S510 ${h*.50} 610 ${h+40}`,`M-30 ${h*.40}Q180 ${h*.22} 300 ${h*.50}T630 ${h*.46}`],
  [`M-50 ${h*.14}Q120 ${h*.48} 300 ${h*.14}T650 ${h*.14}`,`M-50 ${h*.46}Q120 ${h*.80} 300 ${h*.46}T650 ${h*.46}`,`M-50 ${h*.78}Q120 ${h*.44} 300 ${h*.78}T650 ${h*.78}`],
  [`M-40 ${h*.12}C95 ${h*.32} 165 ${h*.32} 300 ${h*.12}S505 ${h*.00} 640 ${h*.22}`,`M-40 ${h*.46}C95 ${h*.66} 165 ${h*.66} 300 ${h*.46}S505 ${h*.34} 640 ${h*.56}`,`M-40 ${h*.80}C95 ${h*.60} 165 ${h*.60} 300 ${h*.80}S505 ${h*.92} 640 ${h*.70}`],
  [`M-60 ${h*.28}Q120 ${h*.05} 270 ${h*.34}T660 ${h*.20}`,`M-60 ${h*.56}Q150 ${h*.85} 310 ${h*.52}T660 ${h*.68}`,`M90 -30Q260 ${h*.22} 390 -20T620 ${h*.24}`],
  [`M-60 ${h*.22}C150 ${h*.22} 150 ${h*.66} 300 ${h*.66}S450 ${h*.22} 660 ${h*.22}`,`M-60 ${h*.52}C150 ${h*.52} 150 ${h*.90} 300 ${h*.90}S450 ${h*.52} 660 ${h*.52}`,`M70 -30C190 ${h*.16} 120 ${h*.66} 300 ${h*.52}S490 ${h*.28} 560 ${h+30}`],
  [`M-50 ${h*.16}L140 ${h*.16}C250 ${h*.16} 240 ${h*.48} 340 ${h*.48}H650`,`M-50 ${h*.76}H220C320 ${h*.76} 310 ${h*.42} 420 ${h*.42}H650`,`M-50 ${h*.48}Q170 ${h*.24} 300 ${h*.48}T650 ${h*.48}`],
  [`M-50 ${h*.12}Q150 ${h*.70} 300 ${h*.12}T650 ${h*.12}`,`M-50 ${h*.50}Q150 ${h*.92} 300 ${h*.50}T650 ${h*.50}`,`M-50 ${h*.86}Q150 ${h*.28} 300 ${h*.86}T650 ${h*.86}`],
  [`M-60 ${h*.30}Q120 ${h*.06} 300 ${h*.30}Q480 ${h*.54} 660 ${h*.30}`,`M-60 ${h*.58}Q120 ${h*.82} 300 ${h*.58}Q480 ${h*.34} 660 ${h*.58}`,`M300 -30V${h+30}`],
  [`M-40 ${h*.20}C130 ${h*.72} 240 ${h*.08} 360 ${h*.54}S520 ${h*.86} 640 ${h*.26}`,`M-40 ${h*.74}C120 ${h*.26} 230 ${h*.94} 380 ${h*.46}S530 ${h*.12} 640 ${h*.70}`,`M-40 ${h*.48}H640`],
  [`M-60 ${h*.25}C120 ${h*.10} 210 ${h*.42} 300 ${h*.25}S500 ${h*.08} 660 ${h*.25}`,`M-60 ${h*.50}C120 ${h*.35} 210 ${h*.67} 300 ${h*.50}S500 ${h*.33} 660 ${h*.50}`,`M-60 ${h*.75}C120 ${h*.60} 210 ${h*.92} 300 ${h*.75}S500 ${h*.58} 660 ${h*.75}`]
 ][v-1]||[];
 return <>{sets.map((dPath,i)=><S key={i} d={dPath} stroke={[a,b,c,d,e][i%5]} width={48-i*9}/>)}</>;
}

function contour(v:number,h:number,[a,b,c,d,e]:C):ReactNode{
 const cfg=[
  [300,.50,0,1],[165,.43,18,1],[445,.55,-12,1],[300,.50,0,1.35],[115,.66,25,.9],[490,.32,-20,.95],
  [300,.50,35,1],[300,.50,-35,1],[210,.38,8,1.15],[390,.62,-8,1.15],[300,.50,0,.78],[300,.50,18,1.6]
 ][v-1]||[300,.5,0,1];
 const [cx,cy,rot,scale]=cfg as number[];
 return <><rect width="600" height={h} fill={e} opacity=".16"/><g transform={`rotate(${rot} ${cx} ${h*cy})`} fill="none">
  {Array.from({length:10}).map((_,i)=><ellipse key={i} cx={cx} cy={h*cy} rx={(42+i*31)*scale} ry={(24+i*20)*scale} stroke={[a,b,c,d][i%4]} strokeWidth={i%3===0?8:5} opacity={.92-i*.035}/>)}
  {v%3===0?<S d={`M-40 ${h*.22}C130 ${h*.62} 245 ${h*.04} 365 ${h*.52}S530 ${h*.86} 650 ${h*.28}`} stroke={d} width={8}/>:null}
  {v%4===0?<circle cx={cx} cy={h*cy} r="18" fill={a} stroke="none"/>:null}
 </g></>;
}

function streetGrid(v:number,h:number,[a,b,c,d,e]:C):ReactNode{
 const cellW=v%2===0?92:108,cellH=h/(v%3===0?6:5),cols=Math.ceil(600/cellW)+1,rows=Math.ceil(h/cellH)+1;
 return <>{Array.from({length:cols*rows}).map((_,i)=>{
   const col=i%cols,row=Math.floor(i/cols),x=col*cellW-18,y=row*cellH-12;
   const mode=v%6;
   if(mode===0)return <rect key={i} x={x+(row%2)*24} y={y} width={cellW*.64} height={cellH*.66} fill={[a,b,c,d,e][(i+row)%5]}/>;
   if(mode===1)return <rect key={i} x={x} y={y} width={col%2?cellW*.35:cellW*.78} height={cellH*.72} rx={col%2?0:12} fill={[a,b,c,d,e][(i+v)%5]}/>;
   if(mode===2)return <path key={i} d={`M${x} ${y}H${x+cellW*.72}L${x+cellW*.48} ${y+cellH*.74}H${x-cellW*.12}Z`} fill={[a,b,c,d,e][(i+row*2)%5]}/>;
   if(mode===3)return <rect key={i} x={x+(col%2)*cellW*.28} y={y+(row%2)*cellH*.18} width={cellW*.52} height={cellH*.52} transform={`rotate(45 ${x+cellW*.26} ${y+cellH*.26})`} fill={[a,b,c,d,e][(i+2)%5]}/>;
   if(mode===4)return <><rect x={x} y={y} width={cellW*.80} height={cellH*.18} fill={[a,b,c,d,e][i%5]}/><rect x={x} y={y+cellH*.32} width={cellW*.46} height={cellH*.46} fill={[a,b,c,d,e][(i+2)%5]}/></>;
   return <path key={i} d={`M${x} ${y}H${x+cellW*.68}V${y+cellH*.22}H${x+cellW*.26}V${y+cellH*.68}H${x}Z`} fill={[a,b,c,d,e][(i+v)%5]}/>;
 })}</>;
}

function radial(v:number,h:number,[a,b,c,d,e]:C):ReactNode{
 const configs=[
  [300,.5,8,0],[205,.5,7,.25],[395,.5,7,.12],[300,.32,10,0],[300,.68,10,.1],[145,.32,8,.2],
  [455,.68,8,.05],[300,.5,12,.13],[300,.5,6,.5],[300,.5,16,.0],[230,.58,9,.28],[370,.42,9,.12]
 ][v-1]||[300,.5,8,0];
 const [cx,cy,count,start]=configs as number[];
 const radius=720;
 return <>{Array.from({length:count}).map((_,i)=>{
   const a0=(Math.PI*2*(i/count+start)),a1=(Math.PI*2*((i+1)/count+start));
   return <path key={i} d={`M${cx} ${h*cy}L${cx+radius*Math.cos(a0)} ${h*cy+radius*Math.sin(a0)}L${cx+radius*Math.cos(a1)} ${h*cy+radius*Math.sin(a1)}Z`} fill={[a,b,c,d,e][i%5]}/>;
 })}
 {v===9?<circle cx={cx} cy={h*cy} r="92" fill={e}/>:null}
 {v===10?<circle cx={cx} cy={h*cy} r="58" fill={a}/>:null}
 </>;
}

function architectural(v:number,h:number,[a,b,c,d,e]:C):ReactNode{
 const mid=h/2;
 switch(v){
  case 1:return <><rect width="600" height={h} fill={a}/><path d={`M0 ${h*.76}L220 0H390L160 ${h}H0Z`} fill={b}/><circle cx="490" cy={h*.27} r="92" fill={c}/><rect x="410" y={h*.63} width="190" height={h*.37} fill={d}/></>;
  case 2:return <><rect width="600" height={h} fill={a}/><rect x="0" y="0" width="175" height={h} fill={b}/><rect x="175" y={h*.18} width="250" height={h*.64} fill={c}/><rect x="425" width="175" height={h} fill={d}/><circle cx="300" cy={mid} r="48" fill={e}/></>;
  case 3:return <><rect width="600" height={h} fill={a}/><path d={`M0 0H600V${h*.30}L0 ${h*.72}Z`} fill={b}/><path d={`M0 ${h*.72}L600 ${h*.30}V${h}H0Z`} fill={c}/><rect x="265" y={h*.18} width="70" height={h*.64} fill={d}/></>;
  case 4:return <><rect width="600" height={h} fill={a}/><circle cx="0" cy={mid} r="230" fill={b}/><circle cx="600" cy={mid} r="230" fill={c}/><rect x="250" width="100" height={h} fill={d}/></>;
  case 5:return <><rect width="600" height={h} fill={a}/><path d={`M0 0H240L360 ${h}H120Z`} fill={b}/><path d={`M360 0H600V${h}H480Z`} fill={c}/><circle cx="420" cy={h*.32} r="58" fill={d}/></>;
  case 6:return <><rect width="600" height={h} fill={a}/><rect x="0" y="0" width="600" height={h*.24} fill={b}/><rect x="0" y={h*.76} width="600" height={h*.24} fill={c}/><rect x="220" y={h*.24} width="160" height={h*.52} fill={d}/></>;
  case 7:return <><rect width="600" height={h} fill={a}/><path d={`M0 ${h}V${h*.45}L170 0H320L130 ${h}Z`} fill={b}/><path d={`M320 0H470L600 ${h*.55}V${h}H510Z`} fill={c}/><circle cx="390" cy={mid} r="72" fill={d}/></>;
  case 8:return <><rect width="600" height={h} fill={a}/><rect x="0" y="0" width="210" height={h*.62} fill={b}/><rect x="210" y={h*.38} width="190" height={h*.62} fill={c}/><rect x="400" y="0" width="200" height={h*.68} fill={d}/></>;
  case 9:return <><rect width="600" height={h} fill={a}/><path d={`M0 0H600L430 ${mid}L600 ${h}H0L170 ${mid}Z`} fill={b}/><rect x="250" y={mid-80} width="100" height="160" fill={c}/><circle cx="300" cy={mid} r="34" fill={d}/></>;
  case 10:return <><rect width="600" height={h} fill={a}/><path d={`M0 0H190V${h}H0Z`} fill={b}/><path d={`M190 0H410L330 ${h}H110Z`} fill={c}/><rect x="410" width="190" height={h} fill={d}/></>;
  case 11:return <><rect width="600" height={h} fill={a}/><circle cx="300" cy={mid} r="170" fill={b}/><circle cx="300" cy={mid} r="105" fill={c}/><circle cx="300" cy={mid} r="48" fill={d}/><rect x="290" width="20" height={h} fill={e}/></>;
  default:return <><rect width="600" height={h} fill={a}/><path d={`M0 0H600V${h*.20}H0Z`} fill={b}/><path d={`M0 ${h*.80}H600V${h}H0Z`} fill={c}/><rect x="0" y={h*.20} width="135" height={h*.60} fill={d}/><rect x="465" y={h*.20} width="135" height={h*.60} fill={e}/></>;
 }
}


function softBlobs(v:number,h:number,[a,b,c,d,e]:C):ReactNode{
 const sets=[
  [[90,.23,105,70,a],[250,.68,120,82,b],[445,.28,112,76,c],[525,.72,88,58,d]],
  [[35,.55,145,92,a],[205,.26,92,62,b],[355,.62,145,84,c],[555,.30,110,74,e]],
  [[110,.18,84,56,a],[210,.50,132,82,b],[390,.24,105,70,c],[485,.69,132,78,d],[585,.48,72,48,e]],
  [[70,.75,120,75,a],[190,.22,128,85,b],[350,.58,118,72,c],[520,.20,108,70,d]],
  [[20,.30,140,82,a],[180,.72,95,64,b],[320,.22,130,78,c],[500,.60,145,86,e]],
  [[100,.52,150,88,a],[300,.18,112,68,b],[465,.52,146,90,c],[300,.82,90,54,d]],
  [[45,.18,105,66,a],[160,.48,142,86,b],[335,.72,150,90,c],[535,.28,118,76,d]],
  [[125,.70,138,85,a],[265,.28,112,70,b],[430,.68,115,72,c],[560,.18,90,58,e]],
  [[80,.30,125,76,a],[240,.30,125,76,b],[400,.30,125,76,c],[560,.30,125,76,d],[320,.76,145,84,e]],
  [[80,.72,120,74,a],[220,.18,115,70,b],[360,.72,120,74,c],[500,.18,115,70,d]],
  [[30,.50,155,90,a],[225,.50,155,90,b],[420,.50,155,90,c],[585,.50,100,64,d]],
  [[95,.22,130,82,a],[300,.22,130,82,b],[505,.22,130,82,c],[200,.72,130,82,d],[410,.72,130,82,e]]
 ][v-1]||[];
 return <>{sets.map((q,i)=><ellipse key={i} cx={q[0] as number} cy={h*(q[1] as number)} rx={q[2] as number} ry={q[3] as number} fill={q[4] as string}/>)}</>;
}

function colorBlocks(v:number,h:number,[a,b,c,d,e]:C):ReactNode{
 const mid=h/2;
 switch(v){
  case 1:return <><rect width="210" height={h} fill={a}/><rect x="210" width="180" height={mid} fill={b}/><rect x="210" y={mid} width="180" height={mid} fill={c}/><rect x="390" width="210" height={h*.65} fill={d}/><rect x="390" y={h*.65} width="210" height={h*.35} fill={e}/></>;
  case 2:return <><rect width="600" height={h*.30} fill={a}/><rect y={h*.30} width="600" height={h*.38} fill={b}/><rect y={h*.68} width="600" height={h*.32} fill={c}/><rect x="420" y={h*.30} width="180" height={h*.38} fill={d}/></>;
  case 3:return <><rect width="180" height={h} fill={a}/><rect x="180" width="240" height={h} fill={b}/><rect x="420" width="180" height={h} fill={c}/><rect x="230" y={h*.25} width="140" height={h*.50} fill={d}/></>;
  case 4:return <><rect width="300" height={mid} fill={a}/><rect x="300" width="300" height={mid} fill={b}/><rect y={mid} width="300" height={mid} fill={c}/><rect x="300" y={mid} width="300" height={mid} fill={d}/><rect x="250" y={mid-40} width="100" height="80" fill={e}/></>;
  case 5:return <><rect width="600" height={h} fill={a}/><path d={`M0 0H380L245 ${h}H0Z`} fill={b}/><path d={`M380 0H600V${h}H245Z`} fill={c}/><rect x="240" y={h*.15} width="120" height={h*.70} fill={d}/></>;
  case 6:return <><rect width="600" height={h} fill={a}/><rect x="0" y="0" width="600" height={h*.22} fill={b}/><rect x="0" y={h*.78} width="600" height={h*.22} fill={c}/><rect x="0" y={h*.22} width="165" height={h*.56} fill={d}/><rect x="435" y={h*.22} width="165" height={h*.56} fill={e}/></>;
  case 7:return <><rect width="600" height={h} fill={a}/><rect width="250" height={h*.44} fill={b}/><rect x="350" width="250" height={h*.44} fill={c}/><rect y={h*.56} width="250" height={h*.44} fill={d}/><rect x="350" y={h*.56} width="250" height={h*.44} fill={e}/></>;
  case 8:return <><rect width="600" height={h} fill={a}/><path d={`M0 0H300V${mid}H0Z`} fill={b}/><path d={`M300 ${mid}H600V${h}H300Z`} fill={c}/><path d={`M300 0H600L300 ${mid}Z`} fill={d}/><path d={`M0 ${mid}L300 ${h}H0Z`} fill={e}/></>;
  case 9:return <><rect width="600" height={h} fill={a}/><rect x="0" width="130" height={h} fill={b}/><rect x="130" width="340" height={h} fill={c}/><rect x="470" width="130" height={h} fill={d}/><rect x="210" y={h*.32} width="180" height={h*.36} fill={e}/></>;
  case 10:return <><rect width="600" height={h} fill={a}/><rect width="600" height={h*.18} fill={b}/><rect y={h*.82} width="600" height={h*.18} fill={c}/><rect x="0" y={h*.18} width="180" height={h*.64} fill={d}/><rect x="420" y={h*.18} width="180" height={h*.64} fill={e}/></>;
  case 11:return <><rect width="600" height={h} fill={a}/><path d={`M0 0H600V${h*.38}L0 ${h*.62}Z`} fill={b}/><path d={`M0 ${h*.62}L600 ${h*.38}V${h}H0Z`} fill={c}/><rect x="255" width="90" height={h} fill={d}/></>;
  default:return <><rect width="600" height={h} fill={a}/><rect x="0" y="0" width="200" height={h*.50} fill={b}/><rect x="200" y="0" width="200" height={h*.50} fill={c}/><rect x="400" y="0" width="200" height={h*.50} fill={d}/><rect x="0" y={h*.50} width="600" height={h*.50} fill={e}/></>;
 }
}

function pixelArt(v:number,h:number,colors:C):ReactNode{
 const cols=v%3===0?12:v%3===1?8:10,rows=v%4===0?8:6;
 const cw=600/cols,ch=h/rows;
 return <>{Array.from({length:cols*rows}).map((_,i)=>{
  const x=(i%cols)*cw,y=Math.floor(i/cols)*ch,col=i%cols,row=Math.floor(i/cols);
  const mode=v%6;
  if(mode===1&&((col+row)%3!==0))return null;
  if(mode===2&&Math.abs(col-cols/2)+Math.abs(row-rows/2)>Math.max(cols,rows)*.58)return null;
  if(mode===3&&((col*2+row+v)%4===0))return <rect key={i} x={x} y={y} width={cw*1.9} height={ch*.78} fill={colors[(i+v)%5]}/>;
  if(mode===4&&((row%2===0&&col%2===1)||(row%2===1&&col%3===0)))return null;
  if(mode===5&&col<row%cols)return null;
  const inset=(v%2===0?3:1);
  return <rect key={i} x={x+inset} y={y+inset} width={Math.max(2,cw-inset*2)} height={Math.max(2,ch-inset*2)} fill={colors[(col+row*2+v)%5]} opacity={.62+((i+v)%4)*.11}/>;
 })}</>;
}

function diagonalArt(v:number,h:number,[a,b,c,d,e]:C):ReactNode{
 const mid=h/2;
 switch(v){
  case 1:return <>{[0,1,2,3,4].map(i=><path key={i} d={`M${i*150-210} -40H${i*150-70}L${i*150+150} ${h+40}H${i*150+10}Z`} fill={[a,b,c,d,e][i]}/>)}</>;
  case 2:return <>{[0,1,2,3,4].map(i=><path key={i} d={`M${i*150-40} -40H${i*150+90}L${i*150-130} ${h+40}H${i*150-260}Z`} fill={[a,b,c,d,e][i]}/>)}</>;
  case 3:return <><rect width="600" height={h} fill={a}/><path d={`M0 0H220L420 ${h}H200Z`} fill={b}/><path d={`M250 0H390L590 ${h}H450Z`} fill={c}/><path d={`M420 0H500L600 ${h*.50}V${h}Z`} fill={d}/></>;
  case 4:return <><rect width="600" height={h} fill={a}/><path d={`M0 0H600L410 ${mid}L600 ${h}H0L190 ${mid}Z`} fill={b}/><path d={`M190 ${mid}L300 0L410 ${mid}L300 ${h}Z`} fill={c}/></>;
  case 5:return <><rect width="600" height={h} fill={a}/><path d={`M-30 ${h*.25}L250 0H410L70 ${h*.45}Z`} fill={b}/><path d={`M170 ${h}L520 ${h*.42}H650L330 ${h}Z`} fill={c}/><path d={`M-20 ${h*.76}L175 ${h*.45}L250 ${h*.58}L60 ${h*.90}Z`} fill={d}/></>;
  case 6:return <><rect width="600" height={h} fill={a}/><path d={`M0 0H150L350 ${h}H200Z`} fill={b}/><path d={`M150 0H300L500 ${h}H350Z`} fill={c}/><path d={`M300 0H450L650 ${h}H500Z`} fill={d}/></>;
  case 7:return <><rect width="600" height={h} fill={a}/><path d={`M0 ${h*.18}L180 0H330L80 ${h*.46}Z`} fill={b}/><path d={`M270 ${h}L520 ${h*.54}H650L430 ${h}Z`} fill={c}/><circle cx="300" cy={mid} r="54" fill={d}/></>;
  case 8:return <><rect width="600" height={h} fill={a}/><path d={`M0 0H260L360 ${mid}L260 ${h}H0L100 ${mid}Z`} fill={b}/><path d={`M600 0H420L320 ${mid}L420 ${h}H600L500 ${mid}Z`} fill={c}/></>;
  case 9:return <><rect width="600" height={h} fill={a}/><path d={`M0 0H120L330 ${h}H210Z`} fill={b}/><path d={`M200 0H320L530 ${h}H410Z`} fill={c}/><path d={`M400 0H520L650 ${h*.62}V${h}H610Z`} fill={d}/></>;
  case 10:return <><rect width="600" height={h} fill={a}/><path d={`M0 0H600L300 ${mid}Z`} fill={b}/><path d={`M0 ${h}H600L300 ${mid}Z`} fill={c}/><rect x="275" width="50" height={h} fill={d}/></>;
  case 11:return <><rect width="600" height={h} fill={a}/><path d={`M0 ${h*.18}L150 0H260L60 ${h*.42}Z`} fill={b}/><path d={`M180 ${h*.58}L410 0H550L300 ${h*.70}Z`} fill={c}/><path d={`M420 ${h}L600 ${h*.54}V${h}Z`} fill={d}/></>;
  default:return <><rect width="600" height={h} fill={a}/><path d={`M0 0H300L600 ${h}H300Z`} fill={b}/><path d={`M300 0H600V${h}Z`} fill={c}/><circle cx="300" cy={mid} r="48" fill={d}/></>;
 }
}

function sunsetBands(v:number,h:number,[a,b,c,d,e]:C):ReactNode{
 const palettes=[e,d,c,b,a];
 const configs=[
  [.10,.16,.23,.31,.40],[.08,.13,.22,.34,.48],[.18,.24,.30,.38,.48],[.05,.15,.29,.46,.62],
  [.12,.20,.28,.37,.49],[.04,.11,.22,.38,.57],[.15,.21,.29,.39,.52],[.10,.18,.27,.41,.58],
  [.06,.16,.31,.49,.67],[.12,.23,.37,.53,.69],[.08,.19,.33,.50,.64],[.15,.28,.41,.56,.72]
 ][v-1]||[.1,.2,.3,.4,.5];
 return <>{configs.map((yy,i)=>{
  const sway=((v+i)%3-1)*.08;
  return <path key={i} d={`M-60 ${h*yy}Q130 ${h*(yy-.10+sway)} 300 ${h*(yy+.04-sway)}T660 ${h*(yy-.02+sway)}V${h+60}H-60Z`} fill={palettes[i]}/>;
 })}</>;
}

function neonCourt(v:number,h:number,[a,b,c,d,e]:C):ReactNode{
 const paths=[
  [`M-40 ${h*.18}C130 ${h*.75} 240 ${h*.02} 390 ${h*.55}S550 ${h*.82} 650 ${h*.24}`,`M-40 ${h*.72}C120 ${h*.28} 250 ${h*.92} 420 ${h*.38}S560 ${h*.18} 650 ${h*.64}`],
  [`M80 -30C180 ${h*.20} 120 ${h*.62} 300 ${h*.54}S500 ${h*.28} 560 ${h+30}`,`M210 -30C320 ${h*.24} 250 ${h*.70} 430 ${h*.72}`],
  [`M-30 ${h*.25}H180Q300 ${h*.25} 300 ${h*.50}T420 ${h*.75}H630`,`M-30 ${h*.75}H170Q300 ${h*.75} 300 ${h*.50}T430 ${h*.25}H630`],
  [`M-40 ${h*.20}L180 ${h*.80}L300 ${h*.20}L430 ${h*.80}L640 ${h*.20}`,`M-40 ${h*.56}H640`],
  [`M-40 ${h*.50}Q150 ${h*.08} 300 ${h*.50}T640 ${h*.50}`,`M-40 ${h*.78}Q150 ${h*.36} 300 ${h*.78}T640 ${h*.78}`],
  [`M60 ${h*.12}C180 ${h*.34} 180 ${h*.70} 60 ${h*.90}`,`M220 ${h*.88}C340 ${h*.64} 350 ${h*.30} 540 ${h*.16}`],
  [`M-40 ${h*.22}Q150 ${h*.78} 300 ${h*.22}T640 ${h*.22}`,`M-40 ${h*.72}Q150 ${h*.16} 300 ${h*.72}T640 ${h*.72}`],
  [`M0 ${h*.12}L600 ${h*.88}`,`M0 ${h*.88}L600 ${h*.12}`],
  [`M-40 ${h*.30}C110 ${h*.30} 110 ${h*.70} 300 ${h*.70}S490 ${h*.30} 640 ${h*.30}`,`M-40 ${h*.52}H640`],
  [`M40 ${h*.18}H560V${h*.82}H40Z`,`M120 ${h*.34}H480V${h*.66}H120Z`],
  [`M-40 ${h*.18}C120 ${h*.82} 240 ${h*.10} 360 ${h*.62}S530 ${h*.86} 640 ${h*.26}`,`M-40 ${h*.82}C120 ${h*.18} 240 ${h*.90} 360 ${h*.38}S530 ${h*.14} 640 ${h*.74}`],
  [`M-40 ${h*.22}H640`,`M-40 ${h*.50}H640`,`M-40 ${h*.78}H640`]
 ][v-1]||[];
 return <><rect width="600" height={h} fill={a} opacity=".22"/>{paths.map((path,i)=><g key={i}><S d={path} stroke={[b,c,d,e][i%4]} width={18-i*2} opacity={.22}/><S d={path} stroke={[b,c,d,e][i%4]} width={7+i*2}/></g>)}{v%3===0?<circle cx="300" cy={h*.5} r="58" fill="none" stroke={e} strokeWidth="8" opacity=".9"/>:null}</>;
}


function monoLayers(v:number,h:number,[a,b,c,d,e]:C):ReactNode{
 const mid=h/2;
 switch(v){
  case 1:return <>{[0,1,2,3,4].map(i=><path key={i} d={`M${-100+i*115} -30C${35+i*92} ${h*.18} ${20+i*118} ${h*.82} ${180+i*102} ${h+30}H${330+i*72}V-30Z`} fill={[a,b,c,d,e][i]}/>)}</>;
  case 2:return <><rect width="600" height={h} fill={a}/><path d={`M0 0H205L360 ${h}H155Z`} fill={b}/><path d={`M245 0H390L545 ${h}H400Z`} fill={c}/><path d={`M455 0H600V${h}Z`} fill={d}/></>;
  case 3:return <><rect width="600" height={h} fill={a}/><circle cx="300" cy={mid} r="170" fill={b}/><circle cx="300" cy={mid} r="112" fill={c}/><circle cx="300" cy={mid} r="58" fill={d}/></>;
  case 4:return <><rect width="600" height={h} fill={a}/><rect y={h*.18} width="600" height={h*.17} fill={b}/><rect y={h*.42} width="600" height={h*.17} fill={c}/><rect y={h*.66} width="600" height={h*.17} fill={d}/></>;
  case 5:return <><rect width="600" height={h} fill={a}/><path d={`M0 0H600V${h*.28}L0 ${h*.62}Z`} fill={b}/><path d={`M0 ${h*.62}L600 ${h*.28}V${h*.58}L0 ${h*.92}Z`} fill={c}/><path d={`M0 ${h*.92}L600 ${h*.58}V${h}H0Z`} fill={d}/></>;
  case 6:return <><rect width="600" height={h} fill={a}/><path d={`M0 0H160L300 ${mid}L160 ${h}H0Z`} fill={b}/><path d={`M600 0H440L300 ${mid}L440 ${h}H600Z`} fill={c}/><rect x="270" width="60" height={h} fill={d}/></>;
  case 7:return <><rect width="600" height={h} fill={a}/><path d={`M0 ${h*.72}C110 ${h*.20} 215 ${h*.18} 300 ${h*.56}S500 ${h*.86} 600 ${h*.38}V${h}H0Z`} fill={b}/><path d={`M0 ${h*.38}C130 ${h*.72} 225 ${h*.74} 320 ${h*.42}S510 ${h*.10} 600 ${h*.54}V0H0Z`} fill={c}/></>;
  case 8:return <><rect width="600" height={h} fill={a}/><rect x="0" width="165" height={h} fill={b}/><rect x="220" width="160" height={h} fill={c}/><rect x="435" width="165" height={h} fill={d}/></>;
  case 9:return <><rect width="600" height={h} fill={a}/><path d={`M0 0H600L420 ${mid}L600 ${h}H0L180 ${mid}Z`} fill={b}/><path d={`M180 ${mid}L300 0L420 ${mid}L300 ${h}Z`} fill={c}/></>;
  case 10:return <><rect width="600" height={h} fill={a}/><ellipse cx="120" cy={h*.30} rx="155" ry="90" fill={b}/><ellipse cx="330" cy={h*.62} rx="190" ry="100" fill={c}/><ellipse cx="560" cy={h*.26} rx="130" ry="80" fill={d}/></>;
  case 11:return <><rect width="600" height={h} fill={a}/><path d={`M0 0H250V${h*.55}H0Z`} fill={b}/><path d={`M250 0H600V${h*.35}H420V${h}H250Z`} fill={c}/><rect x="0" y={h*.55} width="250" height={h*.45} fill={d}/></>;
  default:return <><rect width="600" height={h} fill={a}/><path d={`M0 ${h*.18}Q150 ${h*.02} 300 ${h*.18}T600 ${h*.18}V${h*.36}Q450 ${h*.54} 300 ${h*.36}T0 ${h*.36}Z`} fill={b}/><path d={`M0 ${h*.58}Q150 ${h*.42} 300 ${h*.58}T600 ${h*.58}V${h*.76}Q450 ${h*.94} 300 ${h*.76}T0 ${h*.76}Z`} fill={c}/></>;
 }
}

function rawConcrete(v:number,h:number,[a,b,c,d,e]:C):ReactNode{
 const mid=h/2;
 switch(v){
  case 1:return <><rect width="600" height={h} fill={e}/><rect width="600" height={h*.24} fill={a}/><rect x="355" y={h*.24} width="245" height={h*.76} fill={b}/><circle cx="145" cy={h*.73} r="88" fill={c}/></>;
  case 2:return <><rect width="600" height={h} fill={e}/><rect x="0" width="145" height={h} fill={a}/><rect x="455" width="145" height={h} fill={b}/><rect x="215" y={h*.22} width="170" height={h*.56} fill={c}/></>;
  case 3:return <><rect width="600" height={h} fill={e}/><path d={`M0 0H335L215 ${h}H0Z`} fill={a}/><path d={`M335 0H600V${h}H430Z`} fill={b}/><rect x="275" y={h*.20} width="50" height={h*.60} fill={c}/></>;
  case 4:return <><rect width="600" height={h} fill={e}/><rect y={h*.14} width="600" height={h*.18} fill={a}/><rect y={h*.68} width="600" height={h*.18} fill={b}/><rect x="250" width="100" height={h} fill={c}/></>;
  case 5:return <><rect width="600" height={h} fill={e}/><circle cx="0" cy={mid} r="220" fill={a}/><circle cx="600" cy={mid} r="220" fill={b}/><rect x="270" width="60" height={h} fill={c}/></>;
  case 6:return <><rect width="600" height={h} fill={e}/><path d={`M0 ${h*.72}L220 0H370L135 ${h}H0Z`} fill={a}/><rect x="430" y={h*.15} width="170" height={h*.30} fill={b}/><rect x="430" y={h*.58} width="170" height={h*.27} fill={c}/></>;
  case 7:return <><rect width="600" height={h} fill={e}/><rect x="0" width="260" height={h*.44} fill={a}/><rect x="340" y={h*.56} width="260" height={h*.44} fill={b}/><circle cx="300" cy={mid} r="70" fill={c}/></>;
  case 8:return <><rect width="600" height={h} fill={e}/><path d={`M0 0H600V${h*.26}L0 ${h*.66}Z`} fill={a}/><path d={`M0 ${h*.66}L600 ${h*.26}V${h}H0Z`} fill={b}/></>;
  case 9:return <><rect width="600" height={h} fill={e}/><rect x="0" width="190" height={h} fill={a}/><rect x="205" width="190" height={h} fill={b}/><rect x="410" width="190" height={h} fill={c}/></>;
  case 10:return <><rect width="600" height={h} fill={e}/><path d={`M0 0H600L430 ${mid}L600 ${h}H0L170 ${mid}Z`} fill={a}/><circle cx="300" cy={mid} r="62" fill={b}/></>;
  case 11:return <><rect width="600" height={h} fill={e}/><rect x="0" y={h*.18} width="220" height={h*.64} fill={a}/><rect x="380" y={h*.18} width="220" height={h*.64} fill={b}/><rect x="260" width="80" height={h} fill={c}/></>;
  default:return <><rect width="600" height={h} fill={e}/><path d={`M0 0H260V${mid}H0Z`} fill={a}/><path d={`M340 ${mid}H600V${h}H340Z`} fill={b}/><rect x="260" width="80" height={h} fill={c}/><circle cx="300" cy={mid} r="30" fill={d}/></>;
 }
}

function typographyArt(v:number,h:number,[a,b,c,d,e]:C):ReactNode{
 const words=["PLAY","MOVE","GAME","CITY","COURT","STREET","LOCAL","TOGETHER","SPORT","URBAN","GO","HERE"];
 const word=words[v-1]||"PLAY";
 const small=["THE CITY","MOVE DAILY","PLAY HERE","YOUR COURT","OPEN GAME","STREET CLUB","LOCAL RULES","COME PLAY","MAKE SPACE","CITY GAME","LET’S GO","THIS PLACE"][v-1]||"THE CITY";
 switch(v){
  case 1:return <><text x="300" y={h*.48} textAnchor="middle" fill={a} fontSize="118" fontWeight="900" letterSpacing="-8">{word}</text><text x="300" y={h*.70} textAnchor="middle" fill={b} fontSize="38" fontWeight="900" letterSpacing="9">{small}</text></>;
  case 2:return <><text x="35" y={h*.42} fill={a} fontSize="126" fontWeight="900" letterSpacing="-9">{word}</text><text x="40" y={h*.66} fill={b} fontSize="44" fontWeight="900" letterSpacing="5">{small}</text></>;
  case 3:return <><g transform={`rotate(-18 300 ${h/2})`}><text x="300" y={h*.48} textAnchor="middle" fill={a} fontSize="120" fontWeight="900" letterSpacing="-8">{word}</text><rect x="95" y={h*.56} width="410" height="46" fill={b}/><text x="300" y={h*.65} textAnchor="middle" fill={c} fontSize="26" fontWeight="900" letterSpacing="8">{small}</text></g></>;
  case 4:return <><text x="300" y={h*.35} textAnchor="middle" fill={a} fontSize="84" fontWeight="900" letterSpacing="10">{word}</text><text x="300" y={h*.65} textAnchor="middle" fill={b} fontSize="84" fontWeight="900" letterSpacing="-5">{small}</text></>;
  case 5:return <><text x="55" y={h*.32} fill={a} fontSize="72" fontWeight="900">{word}</text><text x="545" y={h*.74} textAnchor="end" fill={b} fontSize="72" fontWeight="900">{word}</text><text x="300" y={h*.54} textAnchor="middle" fill={c} fontSize="28" fontWeight="900" letterSpacing="7">{small}</text></>;
  case 6:return <><g transform={`rotate(90 300 ${h/2})`}><text x="300" y={h*.44} textAnchor="middle" fill={a} fontSize="105" fontWeight="900" letterSpacing="-5">{word}</text><text x="300" y={h*.64} textAnchor="middle" fill={b} fontSize="30" fontWeight="900" letterSpacing="8">{small}</text></g></>;
  case 7:return <><text x="300" y={h*.56} textAnchor="middle" fill="none" stroke={a} strokeWidth="5" fontSize="126" fontWeight="900" letterSpacing="-8">{word}</text><text x="300" y={h*.72} textAnchor="middle" fill={b} fontSize="26" fontWeight="900" letterSpacing="7">{small}</text></>;
  case 8:return <><rect x="50" y={h*.24} width="500" height={h*.50} fill={a}/><text x="300" y={h*.52} textAnchor="middle" fill={c} fontSize="90" fontWeight="900" letterSpacing="-5">{word}</text><text x="300" y={h*.65} textAnchor="middle" fill={d} fontSize="24" fontWeight="900" letterSpacing="6">{small}</text></>;
  case 9:return <><text x="300" y={h*.42} textAnchor="middle" fill={a} fontSize="105" fontWeight="900" letterSpacing="18">{word}</text><S d={`M90 ${h*.53}H510`} stroke={b} width={12}/><text x="300" y={h*.69} textAnchor="middle" fill={c} fontSize="30" fontWeight="900" letterSpacing="5">{small}</text></>;
  case 10:return <><g transform={`translate(300 ${h/2}) rotate(-90) translate(-300 -${h/2})`}><text x="300" y={h*.48} textAnchor="middle" fill={a} fontSize="98" fontWeight="900" letterSpacing="-4">{word}</text><text x="300" y={h*.66} textAnchor="middle" fill={b} fontSize="28" fontWeight="900" letterSpacing="7">{small}</text></g></>;
  case 11:return <><text x="45" y={h*.58} fill={a} fontSize="170" fontWeight="900" letterSpacing="-14">{word}</text><rect x="430" y={h*.20} width="125" height={h*.60} fill={b}/><text x="492" y={h*.51} textAnchor="middle" fill={c} fontSize="18" fontWeight="900" letterSpacing="3">{small}</text></>;
  default:return <><text x="300" y={h*.34} textAnchor="middle" fill={a} fontSize="76" fontWeight="900" letterSpacing="12">{word}</text><text x="300" y={h*.58} textAnchor="middle" fill={b} fontSize="126" fontWeight="900" letterSpacing="-10">{small.split(" ")[0]}</text><text x="300" y={h*.76} textAnchor="middle" fill={c} fontSize="24" fontWeight="900" letterSpacing="8">{small}</text></>;
 }
}

function localIdArt(v:number,h:number,[a,b,c,d,e]:C):ReactNode{
 const label=["CITY","DISTRICT","HOME","LOCAL","PLACE","BLOCK","NEIGHBOR","GROUND","AREA","HERE","COMMUNITY","CITY 01"][v-1]||"CITY";
 const mid=h/2;
 switch(v){
  case 1:return <><rect width="600" height={h} fill={a}/><path d={`M0 ${h*.62}L600 ${h*.18}V${h}H0Z`} fill={b}/><text x="300" y={h*.57} textAnchor="middle" fill={c} fontSize="86" fontWeight="900" letterSpacing="4">{label}</text></>;
  case 2:return <><rect width="600" height={h} fill={a}/><rect x="0" y={h*.18} width="600" height={h*.64} fill={b}/><text x="300" y={h*.54} textAnchor="middle" fill={c} fontSize="74" fontWeight="900" letterSpacing="10">{label}</text><circle cx="85" cy={mid} r="38" fill={d}/></>;
  case 3:return <><rect width="600" height={h} fill={a}/><circle cx="300" cy={mid} r="150" fill={b}/><text x="300" y={h*.55} textAnchor="middle" fill={c} fontSize="74" fontWeight="900" letterSpacing="6">{label}</text></>;
  case 4:return <><rect width="600" height={h} fill={a}/><path d={`M0 0H600L410 ${mid}L600 ${h}H0L190 ${mid}Z`} fill={b}/><text x="300" y={h*.54} textAnchor="middle" fill={c} fontSize="68" fontWeight="900" letterSpacing="5">{label}</text></>;
  case 5:return <><rect width="600" height={h} fill={a}/><rect x="0" width="190" height={h} fill={b}/><text x="225" y={h*.55} fill={c} fontSize="76" fontWeight="900" letterSpacing="4">{label}</text></>;
  case 6:return <><rect width="600" height={h} fill={a}/><path d={`M0 ${h*.28}H600V${h*.72}H0Z`} fill={b}/><text x="300" y={h*.55} textAnchor="middle" fill={c} fontSize="78" fontWeight="900" letterSpacing="8">{label}</text><circle cx="520" cy={mid} r="28" fill={d}/></>;
  case 7:return <><rect width="600" height={h} fill={a}/><path d={`M0 0H300V${h}H0Z`} fill={b}/><text x="300" y={h*.55} textAnchor="middle" fill={c} fontSize="68" fontWeight="900" letterSpacing="4">{label}</text></>;
  case 8:return <><rect width="600" height={h} fill={a}/><path d={`M0 0H180L360 ${h}H180Z`} fill={b}/><path d={`M360 0H600V${h}H540Z`} fill={c}/><text x="300" y={h*.55} textAnchor="middle" fill={d} fontSize="64" fontWeight="900" letterSpacing="5">{label}</text></>;
  case 9:return <><rect width="600" height={h} fill={a}/><circle cx="90" cy={h*.22} r="110" fill={b}/><circle cx="520" cy={h*.78} r="125" fill={c}/><text x="300" y={h*.55} textAnchor="middle" fill={d} fontSize="72" fontWeight="900" letterSpacing="5">{label}</text></>;
  case 10:return <><rect width="600" height={h} fill={a}/><rect y={h*.15} width="600" height={h*.18} fill={b}/><rect y={h*.67} width="600" height={h*.18} fill={c}/><text x="300" y={h*.55} textAnchor="middle" fill={d} fontSize="78" fontWeight="900" letterSpacing="6">{label}</text></>;
  case 11:return <><rect width="600" height={h} fill={a}/><path d={`M0 ${h*.72}Q140 ${h*.28} 300 ${h*.58}T600 ${h*.30}V${h}H0Z`} fill={b}/><text x="300" y={h*.50} textAnchor="middle" fill={c} fontSize="72" fontWeight="900" letterSpacing="5">{label}</text></>;
  default:return <><rect width="600" height={h} fill={a}/><rect x="55" y={h*.18} width="490" height={h*.64} fill={b}/><rect x="80" y={h*.24} width="440" height={h*.52} fill="none" stroke={c} strokeWidth="8"/><text x="300" y={h*.55} textAnchor="middle" fill={d} fontSize="72" fontWeight="900" letterSpacing="5">{label}</text></>;
 }
}

function natureArt(v:number,h:number,[a,b,c,d,e]:C):ReactNode{
 switch(v){
  case 1:return <>{[0,1,2,3,4].map(i=><path key={i} d={`M${-30+i*135} ${h+35}Q${70+i*115} ${h*.38} ${125+i*115} ${h*.08}Q${185+i*90} ${h*.48} ${205+i*110} ${h+35}Z`} fill={[a,b,c,d,e][i]}/>)}</>;
  case 2:return <><path d={`M0 ${h}Q120 ${h*.28} 250 ${h*.62}T500 ${h*.20}T650 ${h*.48}V${h}Z`} fill={a}/><path d={`M0 ${h*.64}Q130 ${h*.12} 280 ${h*.46}T600 ${h*.18}V0H0Z`} fill={b}/><circle cx="470" cy={h*.72} r="58" fill={c}/></>;
  case 3:return <><rect width="600" height={h} fill={e}/>{[75,190,315,445,555].map((x,i)=><g key={x} transform={`translate(${x} ${h*(.25+(i%2)*.42)}) rotate(${-35+i*17})`}><ellipse rx="72" ry="30" fill={[a,b,c,d,e][i]}/><path d="M-55 0H55" stroke={[b,c,d,e,a][i]} strokeWidth="5"/></g>)}</>;
  case 4:return <><rect width="600" height={h} fill={e}/>{[0,1,2,3].map(i=><path key={i} d={`M-40 ${h*(.22+i*.20)}C120 ${h*(.05+i*.18)} 230 ${h*(.35+i*.12)} 360 ${h*(.18+i*.18)}S520 ${h*(.04+i*.22)} 650 ${h*(.20+i*.20)}`} fill="none" stroke={[a,b,c,d][i]} strokeWidth={22-i*3} strokeLinecap="round"/>)}</>;
  case 5:return <><rect width="600" height={h} fill={e}/>{[0,1,2,3,4,5,6].map(i=><circle key={i} cx={55+(i*83)%560} cy={h*(.18+((i*19)%62)/100)} r={28+(i%3)*16} fill={[a,b,c,d,e][i%5]}/>)}</>;
  case 6:return <><rect width="600" height={h} fill={e}/><path d={`M0 ${h*.78}Q120 ${h*.18} 250 ${h*.52}T500 ${h*.20}T650 ${h*.44}V${h}Z`} fill={a}/><path d={`M0 ${h*.48}Q120 ${h*.08} 260 ${h*.38}T590 ${h*.10}V0H0Z`} fill={b}/></>;
  case 7:return <><rect width="600" height={h} fill={e}/>{[0,1,2,3,4].map(i=><path key={i} d={`M${40+i*125} ${h*.86}Q${90+i*110} ${h*.18} ${150+i*105} ${h*.14}Q${205+i*90} ${h*.48} ${190+i*110} ${h*.86}Z`} fill={[a,b,c,d,e][i]}/>)}</>;
  case 8:return <><rect width="600" height={h} fill={e}/><circle cx="300" cy={h*.5} r="170" fill={a}/><circle cx="300" cy={h*.5} r="118" fill={b}/><path d={`M300 ${h*.23}C360 ${h*.38} 410 ${h*.48} 300 ${h*.77}C190 ${h*.48} 240 ${h*.38} 300 ${h*.23}Z`} fill={c}/></>;
  case 9:return <><rect width="600" height={h} fill={e}/>{[0,1,2,3,4].map(i=><ellipse key={i} cx={85+i*110} cy={h*(.25+(i%2)*.48)} rx={70} ry={42} fill={[a,b,c,d,e][i]}/>)}</>;
  case 10:return <><rect width="600" height={h} fill={e}/><path d={`M0 0H600V${h*.30}Q450 ${h*.14} 300 ${h*.30}T0 ${h*.30}Z`} fill={a}/><path d={`M0 ${h}H600V${h*.70}Q450 ${h*.86} 300 ${h*.70}T0 ${h*.70}Z`} fill={b}/><ellipse cx="300" cy={h*.5} rx="105" ry="60" fill={c}/></>;
  case 11:return <><rect width="600" height={h} fill={e}/>{[0,1,2,3].map(i=><path key={i} d={`M-40 ${h*(.18+i*.22)}Q130 ${h*(.08+i*.17)} 300 ${h*(.22+i*.18)}T650 ${h*(.16+i*.21)}`} fill="none" stroke={[a,b,c,d][i]} strokeWidth={36-i*5} strokeLinecap="round"/>)}</>;
  default:return <><rect width="600" height={h} fill={e}/><path d={`M0 ${h*.72}C130 ${h*.22} 225 ${h*.86} 340 ${h*.42}S520 ${h*.10} 600 ${h*.54}V${h}H0Z`} fill={a}/><path d={`M0 ${h*.32}C120 ${h*.74} 240 ${h*.10} 370 ${h*.56}S520 ${h*.86} 600 ${h*.28}V0H0Z`} fill={b}/><circle cx="300" cy={h*.5} r="46" fill={c}/></>;
 }
}

function playgroundArt(v:number,h:number,colors:C):ReactNode{
 const [a,b,c,d,e]=colors;
 const count=18+(v%4)*4;
 return <>{Array.from({length:count}).map((_,i)=>{
  const x=(i*83+v*41)%620-10,y=(i*47+v*29)%Math.max(80,h),col=colors[(i+v)%5],mode=(i+v)%5;
  if(v===1&&i%2)return null;
  if(v===2&&x>300&&i%3===0)return null;
  if(v===3&&y>h*.55&&i%2===0)return null;
  if(v===4&&Math.abs(x-300)>190&&i%3!==0)return null;
  if(mode===0)return <circle key={i} cx={x} cy={y} r={18+(i%4)*7} fill={col}/>;
  if(mode===1)return <rect key={i} x={x-24} y={y-24} width={48+(i%2)*20} height={48} rx="16" fill={col}/>;
  if(mode===2)return <path key={i} d={`M${x} ${y-28}L${x+28} ${y+24}H${x-28}Z`} fill={col}/>;
  if(mode===3)return <g key={i}><circle cx={x} cy={y} r="28" fill={col}/><circle cx={x} cy={y} r="12" fill={[a,b,c,d,e][(i+2)%5]}/></g>;
  return <path key={i} d={`M${x-28} ${y-10}Q${x} ${y-36} ${x+28} ${y-10}Q${x} ${y+30} ${x-28} ${y-10}Z`} fill={col}/>;
 })}</>;
}

function terrazzoArt(v:number,h:number,colors:C):ReactNode{
 const count=30+(v%4)*8;
 const scale=v%3===0?1.5:v%3===1?.85:1.1;
 return <>{Array.from({length:count}).map((_,i)=>{
  const x=(i*97+v*53)%650-25,y=(i*61+v*37)%Math.max(90,h),r=(7+(i%5)*4)*scale,col=colors[(i*2+v)%5],rot=(i*37+v*19)%180;
  const mode=(v+i)%4;
  if(v===2&&i%3===0)return null;
  if(v===5&&x<260&&i%2===0)return null;
  if(v===8&&y<h*.45&&i%2===1)return null;
  if(v===11&&Math.abs(x-300)<115&&i%3!==0)return null;
  if(mode===0)return <circle key={i} cx={x} cy={y} r={r*.72} fill={col}/>;
  if(mode===1)return <rect key={i} x={x-r} y={y-r*.55} width={r*2} height={r*1.1} rx={r*.30} transform={`rotate(${rot} ${x} ${y})`} fill={col}/>;
  if(mode===2)return <path key={i} d={`M${x-r} ${y}Q${x-r*.15} ${y-r*1.35} ${x+r} ${y-r*.15}Q${x+r*.25} ${y+r} ${x-r} ${y}Z`} fill={col}/>;
  return <path key={i} d={`M${x} ${y-r}L${x+r} ${y+r*.65}L${x-r} ${y+r*.65}Z`} transform={`rotate(${rot} ${x} ${y})`} fill={col}/>;
 })}</>;
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
 const uid=useId().replace(/:/g,"");
 const raw=palette.colors;
 const gradIds=raw.map((_,i)=>`gf-grad-${uid}-${i}`);
 const colors=gradIds.map(id=>`url(#${id})`) as C;
 const lightId=`gf-light-${uid}`,shadeId=`gf-shade-${uid}`,textureId=`gf-texture-${uid}`,depthId=`gf-depth-${uid}`;
 const transform=`translate(300 ${h/2}) rotate(${p.graphicRotation}) scale(${scale}) translate(-300 -${h/2})`;
 let art:ReactNode;
 switch(family.renderer){
  case "organic":art=organic(v,h,colors);break;
  case "bauhaus":art=bauhaus(v,h,colors);break;
  case "camo":art=camo(v,h,colors);break;
  case "graffiti":art=graffiti(v,h,colors);break;
  case "brand":art=brand(v,h,colors);break;
  case "ribbons":art=ribbons(v,h,colors);break;
  case "geometry":art=geometry(v,h,colors);break;
  case "waves":art=waves(v,h,colors);break;
  case "contour":art=contour(v,h,colors);break;
  case "grid":art=streetGrid(v,h,colors);break;
  case "radial":art=radial(v,h,colors);break;
  case "premium":art=architectural(v,h,colors);break;
  case "blobs":art=softBlobs(v,h,colors);break;
  case "blocks":art=colorBlocks(v,h,colors);break;
  case "pixel":art=pixelArt(v,h,colors);break;
  case "diagonal":art=diagonalArt(v,h,colors);break;
  case "sunset":art=sunsetBands(v,h,colors);break;
  case "neon":art=neonCourt(v,h,colors);break;
  case "mono":art=monoLayers(v,h,colors);break;
  case "concrete":art=rawConcrete(v,h,colors);break;
  case "type":art=typographyArt(v,h,colors);break;
  case "local":art=localIdArt(v,h,colors);break;
  case "nature":art=natureArt(v,h,colors);break;
  case "kids":art=playgroundArt(v,h,colors);break;
  case "terrazzo":art=terrazzoArt(v,h,colors);break;
  default:art=generic(family.renderer,v,h,colors);
 }
 const angle=(v*31+family.id.length*17)%360;
 const x1=50-45*Math.cos(angle*Math.PI/180),y1=50-45*Math.sin(angle*Math.PI/180),x2=50+45*Math.cos(angle*Math.PI/180),y2=50+45*Math.sin(angle*Math.PI/180);
 return <>
  <defs>
   {raw.map((col,i)=>{
    const next=raw[(i+1)%raw.length],accent=raw[(i+2)%raw.length];
    const radial=(i+v)%3===0;
    return radial
     ? <radialGradient key={gradIds[i]} id={gradIds[i]} cx={i%2?"68%":"32%"} cy={(i+v)%2?"30%":"70%"} r="82%">
        <stop offset="0%" stopColor={accent} stopOpacity=".96"/>
        <stop offset="46%" stopColor={col} stopOpacity=".98"/>
        <stop offset="100%" stopColor={next} stopOpacity=".92"/>
       </radialGradient>
     : <linearGradient key={gradIds[i]} id={gradIds[i]} x1={`${x1}%`} y1={`${y1}%`} x2={`${x2}%`} y2={`${y2}%`}>
        <stop offset="0%" stopColor={col}/>
        <stop offset="52%" stopColor={col}/>
        <stop offset="100%" stopColor={next}/>
       </linearGradient>;
   })}
   <linearGradient id={lightId} x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stopColor="#ffffff" stopOpacity=".18"/>
    <stop offset="38%" stopColor="#ffffff" stopOpacity=".03"/>
    <stop offset="72%" stopColor="#000000" stopOpacity=".03"/>
    <stop offset="100%" stopColor="#000000" stopOpacity=".18"/>
   </linearGradient>
   <radialGradient id={shadeId} cx="50%" cy="46%" r="72%">
    <stop offset="58%" stopColor="#000000" stopOpacity="0"/>
    <stop offset="100%" stopColor="#000000" stopOpacity=".16"/>
   </radialGradient>
   <filter id={depthId} x="-12%" y="-12%" width="124%" height="124%" colorInterpolationFilters="sRGB">
    <feDropShadow dx="0" dy="3" stdDeviation="3.5" floodColor="#0b1712" floodOpacity=".16"/>
   </filter>
   <filter id={textureId} x="-5%" y="-5%" width="110%" height="110%">
    <feTurbulence type="fractalNoise" baseFrequency=".75" numOctaves="2" seed={v*17} result="noise"/>
    <feColorMatrix in="noise" type="saturate" values="0" result="mono"/>
    <feComponentTransfer in="mono" result="softnoise"><feFuncA type="table" tableValues="0 .11"/></feComponentTransfer>
    <feBlend in="SourceGraphic" in2="softnoise" mode="multiply"/>
   </filter>
  </defs>
  <g opacity={opacity} transform={transform}>
   <g filter={`url(#${depthId})`}>{art}</g>
   <rect x="-30" y="-30" width="660" height={h+60} fill={`url(#${lightId})`} opacity=".78" pointerEvents="none"/>
   <rect x="-30" y="-30" width="660" height={h+60} fill={`url(#${shadeId})`} pointerEvents="none"/>
   <rect x="-30" y="-30" width="660" height={h+60} fill="transparent" filter={`url(#${textureId})`} opacity=".55" pointerEvents="none"/>
  </g>
 </>;
}
