"""Deterministic web export of validated P1; preserve IDs, faces, normals and UVs."""
import json,struct,pathlib,hashlib
root=pathlib.Path(__file__).resolve().parent.parent
source=root/'public/arenas/p1.json';meshes=json.loads(source.read_text());binary=bytearray();views=[];accessors=[];primitives=[];nodes=[]
def attribute(rows,width,component=5126):
 while len(binary)%4:binary.append(0)
 offset=len(binary);flat=[x for row in rows for x in row];fmt={5126:'f',5123:'H',5125:'I'}[component];binary.extend(struct.pack('<'+fmt*len(flat),*flat));v=len(views);views.append({'buffer':0,'byteOffset':offset,'byteLength':len(binary)-offset});a={'bufferView':v,'componentType':component,'count':len(rows),'type':{1:'SCALAR',2:'VEC2',3:'VEC3'}[width]}
 if width==3 and component==5126:a.update(min=[min(r[i]for r in rows)for i in range(3)],max=[max(r[i]for r in rows)for i in range(3)])
 accessors.append(a);return len(accessors)-1
for m in meshes:
 attrs={'POSITION':attribute(m['v'],3),'TEXCOORD_0':attribute(m['uv'],2)}
 if m.get('normals'):attrs['NORMAL']=attribute(m['normals'],3)
 indices=attribute([[i]for f in m['f']for i in f],1,5123 if len(m['v'])<65536 else 5125)
 primitives.append({'primitives':[{'attributes':attrs,'indices':indices,'mode':4}]})
 extras={k:m[k]for k in ['group','artwork','perforationDirection'] if k in m};extras['sourceId']=m['id'];nodes.append({'mesh':len(primitives)-1,'name':m['label'],'extras':extras})
while len(binary)%4:binary.append(0)
doc={'asset':{'version':'2.0','generator':'Gamefields P1 web export v1'},'scene':0,'scenes':[{'nodes':list(range(len(nodes)))}],'nodes':nodes,'meshes':primitives,'buffers':[{'byteLength':len(binary)}],'bufferViews':views,'accessors':accessors}
j=json.dumps(doc,separators=(',',':'),ensure_ascii=True).encode();j+=b' '*((-len(j))%4);out=struct.pack('<III',0x46546c67,2,28+len(j)+len(binary))+struct.pack('<II',len(j),0x4e4f534a)+j+struct.pack('<II',len(binary),0x004e4942)+binary
path=root/'public/arenas/panna-court-web.glb';path.write_bytes(out)
receipt={'source':'public/arenas/p1.json','sourceSha256':hashlib.sha256(source.read_bytes()).hexdigest(),'output':'public/arenas/panna-court-web.glb','sha256':hashlib.sha256(out).hexdigest(),'sourceBytes':source.stat().st_size,'outputBytes':len(out),'parts':len(meshes),'triangles':sum(len(m['f'])for m in meshes),'sourceGeometryUnchanged':True,'positionPrecision':'float32'}
(root/'public/arenas/panna-court-web-manifest.json').write_text(json.dumps(receipt,indent=2)+'\n');print(json.dumps(receipt))
