import {projectSchema} from "@/lib/project";
const origin="https://www.gamefields.eu";
const category=629;
const maxBytes=12_000_000;
function decode(text:string){return text.replace(/&#(x[0-9a-f]+|\d+);/gi,(_,n)=>{const code=n[0].toLowerCase()==="x"?parseInt(n.slice(1),16):Number(n);return code<=0x10ffff?String.fromCodePoint(code):""}).replace(/&quot;/g,'"').replace(/&#039;|&apos;/g,"'").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&")}
function plain(text:string){return decode(text.replace(/<[^>]*>/g," ")).replace(/\s+/g," ").trim()}
function fileUrl(content:string){const links=[...content.matchAll(/href=["']([^"']+)["']/gi)].map(m=>decode(m[1]));return links.find(link=>{try{const u=new URL(link);return u.origin===origin&&u.pathname.startsWith('/wp-content/uploads/')&&/\.(txt|json)$/i.test(u.pathname)&&!u.username&&!u.password}catch{return false}})}
async function json(url:string,limit=maxBytes){const response=await fetch(url,{redirect:"error",cache:"no-store",signal:AbortSignal.timeout(15000),headers:{Accept:"application/json"}});if(!response.ok)throw new Error("Upstream request failed");if(Number(response.headers.get("content-length"))>limit)throw new Error("File too large");const reader=response.body?.getReader();if(!reader)throw new Error("Empty response");let size=0;const chunks:Uint8Array[]=[];while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>limit){await reader.cancel();throw new Error("File too large")}chunks.push(value)}const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length}return {data:JSON.parse(new TextDecoder().decode(bytes)),response}}
function result(data:unknown,status=200){return Response.json(data,{status,headers:{"Cache-Control":"no-store"}})}
export async function GET(request:Request){
 const query=new URL(request.url).searchParams;
 const id=query.get("id");
 try{
  if(id!==null){
   if(!/^\d{1,10}$/.test(id))return result({error:"Invalid template ID"},400);
   const {data:post}=await json(`${origin}/wp-json/wp/v2/posts/${id}?context=view&_fields=id,status,categories,content`,500000);
   if(post.status!=="publish"||!post.categories?.includes(category))return result({error:"Template not found"},404);
   const file=fileUrl(post.content?.rendered||"");if(!file)return result({error:"Missing project file"},422);
   const {data}=await json(file);const parsed=projectSchema.safeParse(data);
   if(!parsed.success||new Set(parsed.data.objects.map(o=>o.id)).size!==parsed.data.objects.length)return result({error:"Invalid project file"},422);
   return result({project:parsed.data});
  }
  const raw=query.get("page")||"1";if(!/^\d{1,4}$/.test(raw)||Number(raw)<1)return result({error:"Invalid page"},400);
  const {data:posts,response}=await json(`${origin}/wp-json/wp/v2/posts?categories=${category}&status=publish&per_page=12&page=${raw}&_embed=wp:featuredmedia&_fields=id,title,excerpt,link,content,_links,_embedded`,2000000);
  if(!Array.isArray(posts))throw new Error("Invalid catalog");
  const items=posts.filter(post=>fileUrl(post.content?.rendered||"")).map(post=>{const media=post._embedded?.['wp:featuredmedia']?.[0];const image=media?.media_details?.sizes?.medium_large?.source_url||media?.source_url;return {id:post.id,title:plain(post.title?.rendered||"Projekt"),description:plain(post.excerpt?.rendered||"").slice(0,400),link:post.link,image:typeof image==='string'&&image.startsWith('https://')?image:null}});
  return result({items,pages:Math.max(1,Number(response.headers.get("X-WP-TotalPages"))||1)});
 }catch{return result({error:"Catalog unavailable"},503)}
}
