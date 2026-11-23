/* Minimal MP4 writer for one H.264 video track (WebCodecs output). moov before mdat, so the file starts playing
   at once (faststart). No dependencies. Boxes per ISO/IEC 14496-12 and 14496-15 (avcC = decoderConfig.description). */
type Sample={data:Uint8Array;key:boolean};
const u32=(n:number)=>[(n>>>24)&255,(n>>>16)&255,(n>>>8)&255,n&255],u16=(n:number)=>[(n>>>8)&255,n&255];
const str=(s:string)=>[...s].map(c=>c.charCodeAt(0));
function box(type:string,...parts:(number[]|Uint8Array)[]){const len=8+parts.reduce((n,p)=>n+p.length,0),out=new Uint8Array(len);out.set([...u32(len),...str(type)]);let o=8;for(const p of parts){out.set(p,o);o+=p.length}return out}
const full=(type:string,version:number,flags:number,...parts:(number[]|Uint8Array)[])=>box(type,[version,(flags>>16)&255,(flags>>8)&255,flags&255],...parts);
const MATRIX=[...u32(0x10000),...u32(0),...u32(0),...u32(0),...u32(0x10000),...u32(0),...u32(0),...u32(0),...u32(0x40000000)];

export class Mp4Writer{
 private samples:Sample[]=[];private avcC:Uint8Array|null=null;
 constructor(private width:number,private height:number,private fps:number){}
 add(chunk:EncodedVideoChunk,meta?:EncodedVideoChunkMetadata){const d=meta?.decoderConfig?.description;
  if(d&&!this.avcC)this.avcC=new Uint8Array(d instanceof ArrayBuffer?d:(d as ArrayBufferView).buffer.slice((d as ArrayBufferView).byteOffset,(d as ArrayBufferView).byteOffset+(d as ArrayBufferView).byteLength));
  const data=new Uint8Array(chunk.byteLength);chunk.copyTo(data);this.samples.push({data,key:chunk.type==='key'})}
 finish():Blob{if(!this.avcC||!this.samples.length)throw Error('Koder nie zwrócił klatek filmu.');
  const N=this.samples.length,scale=90000,delta=Math.round(scale/this.fps),dur=N*delta,ms=Math.round(N*1000/this.fps);
  const moov=(offset:number)=>box('moov',
   full('mvhd',0,0,u32(0),u32(0),u32(1000),u32(ms),u32(0x10000),u16(0x100),[0,0],u32(0),u32(0),MATRIX,new Array(24).fill(0),u32(2)),
   box('trak',
    full('tkhd',0,3,u32(0),u32(0),u32(1),u32(0),u32(ms),u32(0),u32(0),u16(0),u16(0),u16(0),u16(0),MATRIX,u32(this.width<<16),u32(this.height<<16)),
    box('mdia',
     full('mdhd',0,0,u32(0),u32(0),u32(scale),u32(dur),u16(0x55c4),u16(0)),
     full('hdlr',0,0,u32(0),str('vide'),u32(0),u32(0),u32(0),str('VideoHandler'),[0]),
     box('minf',
      full('vmhd',0,1,u16(0),u16(0),u16(0),u16(0)),
      box('dinf',full('dref',0,0,u32(1),full('url ',0,1))),
      box('stbl',
       full('stsd',0,0,u32(1),box('avc1',new Array(6).fill(0),u16(1),new Array(16).fill(0),u16(this.width),u16(this.height),u32(0x480000),u32(0x480000),u32(0),u16(1),new Array(32).fill(0),u16(0x18),u16(0xffff),box('avcC',this.avcC!))),
       full('stts',0,0,u32(1),u32(N),u32(delta)),
       full('stss',0,0,u32(this.samples.filter(s=>s.key).length),...this.samples.flatMap((s,i)=>s.key?[u32(i+1)]:[])),
       full('stsc',0,0,u32(1),u32(1),u32(N),u32(1)),
       full('stsz',0,0,u32(0),u32(N),...this.samples.map(s=>u32(s.data.length))),
       full('stco',0,0,u32(1),u32(offset)))))));
  const ftyp=box('ftyp',str('isom'),u32(512),str('isom'),str('iso2'),str('avc1'),str('mp41'));
  const mdatSize=8+this.samples.reduce((n,s)=>n+s.data.length,0),head=ftyp.length+moov(0).length;
  return new Blob([ftyp,moov(head+8),new Uint8Array([...u32(mdatSize),...str('mdat')]),...this.samples.map(s=>s.data)] as BlobPart[],{type:'video/mp4'});
 }
}
