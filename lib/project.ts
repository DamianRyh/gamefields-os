import {z} from "zod";
export type Scene="day"|"night"|"event";
export type Target="court"|"band-top"|"band-bottom"|"band-left"|"band-right";
export type ObjectKind="image"|"text"|"sponsor"|"equipment";
export type EditorObject={id:string;kind:ObjectKind;name:string;x:number;y:number;scale:number;rotation:number;opacity:number;color:string;text?:string;src?:string;target:Target};
export type Project={id:string;name:string;type:string;sport:string;length:number;width:number;surface:string;base:string;zone:string;outside:string;lineColor:string;lines:boolean;pattern:string;graphicOpacity:number;graphicScale:number;graphicRotation:number;scene:Scene;objects:EditorObject[];status:string;date:string};

export const projectSchema=z.object({
 id:z.string().min(1).max(100),name:z.string().min(1).max(200),
 length:z.number().min(6).max(60),width:z.number().min(6).max(40),
 sport:z.enum(["Piłka nożna 3×3","Koszykówka","Siatkówka","Wielofunkcyjne"]),
 surface:z.enum(["Akryl sportowy","EPDM","Sztuczna trawa 60 mm","Moduły sportowe"]),
 base:z.string().regex(/^#[0-9a-f]{6}$/i),zone:z.string().regex(/^#[0-9a-f]{6}$/i),outside:z.string().regex(/^#[0-9a-f]{6}$/i),lineColor:z.string().regex(/^#[0-9a-f]{6}$/i),
 lines:z.boolean(),pattern:z.string().max(40),graphicOpacity:z.number().min(0).max(100),graphicScale:z.number().min(20).max(220),graphicRotation:z.number().min(-360).max(360),scene:z.enum(["day","night","event"]),
 objects:z.array(z.object({id:z.string().max(100),kind:z.enum(["image","text","sponsor","equipment"]),name:z.string().max(200),x:z.number().finite(),y:z.number().finite(),scale:z.number().min(20).max(220),rotation:z.number().finite(),opacity:z.number().min(0).max(100),color:z.string().regex(/^#[0-9a-f]{6}$/i),text:z.string().max(500).optional(),src:z.string().max(3000000).regex(/^data:image\/(png|svg\+xml);base64,[A-Za-z0-9+/=]+$/).optional(),target:z.enum(["court","band-top","band-bottom","band-left","band-right"])})).max(200),
 type:z.string().max(100).default("Nowe boisko"),status:z.string().max(50).default("Szkic"),date:z.string().max(30).default("")
});

