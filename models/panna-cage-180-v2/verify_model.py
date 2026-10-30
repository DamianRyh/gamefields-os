"""Independent numeric validation. --stage copies only this product's generated assets."""
import json,struct,math,hashlib,shutil,sys
from pathlib import Path
OUT=Path(__file__).resolve().parent;PUBLIC=OUT.parents[1]/'public/arenas'
meshes=json.loads((OUT/'studio-mesh.json').read_text());floor=next(m for m in meshes if m['group']=='floor');source=OUT/'source-surface.json'
if source.exists():assert floor==json.loads(source.read_text())
else:
 old=json.loads((PUBLIC/'circle-cage-2.json').read_text());assert floor==next(m for m in old if m['group']=='floor');source.write_text(json.dumps(floor,separators=(',',':'))+'\n')
for m in meshes:
 for kind in ['v','normals','uv']:assert all(all(math.isfinite(v)for v in p)for p in m.get(kind,[])),(m['id'],kind)
 assert all(len(f)==3 and all(0<=i<len(m['v'])for i in f)for f in m['f'])
structure=[m for m in meshes if m['group']!='floor'];lo=[min(v[i]for m in structure for v in m['v'])for i in range(3)];hi=[max(v[i]for m in structure for v in m['v'])for i in range(3)]
assert abs(hi[0]-lo[0]-6.72251)<.0002 and hi[1]==1.8 and lo[1]==0 and abs(hi[2]-lo[2]-6.12)<.0001
b=(OUT/'panna-cage-180-v2.glb').read_bytes();n=struct.unpack_from('<I',b,12)[0];d=json.loads(b[20:20+n]);binary=b[28+n:];triangles=0
for node in d['nodes']:
 if 'mesh'not in node:continue
 assert node['extras']['group']in ['frame','panels','goals'] and node['extras']['revision']=='C180-CAD-2'
 for p in d['meshes'][node['mesh']]['primitives']:
  for key in ['POSITION','NORMAL','TEXCOORD_0']:
   a=d['accessors'][p['attributes'][key]];v=d['bufferViews'][a['bufferView']];width={'VEC3':3,'VEC2':2}[a['type']];start=v.get('byteOffset',0)+a.get('byteOffset',0)
   for i in range(a['count']):assert all(math.isfinite(x)for x in struct.unpack_from('<'+'f'*width,binary,start+i*v.get('byteStride',width*4))),(node['name'],key)
  triangles+=d['accessors'][p['indices']]['count']//3
assert triangles==sum(len(m['f'])for m in structure)
r={'product':'Panna Cage 180','revision':'C180-CAD-2','bounds':{'min':lo,'max':hi},'triangles':triangles,'parts':len(structure),'groups':{g:sum(m['group']==g for m in structure)for g in ['frame','panels','goals']},'GLBAttributesFinite':True,'surfaceUnchanged':True,'CAD':json.loads((OUT/'cad-validation.json').read_text()),'files':{}}
for name in ['studio-mesh.json','panna-cage-180-v2.glb','panna-cage-180-v2.blend','panna-cage-180-surface-20cm.glb']:
 p=OUT/name;r['files'][name]={'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest()};assert p.stat().st_size<25*1024*1024
(OUT/'web-validation.json').write_text(json.dumps(r,indent=2)+'\n')
if '--stage'in sys.argv:
 shutil.copyfile(OUT/'studio-mesh.json',PUBLIC/'circle-cage-2.json')
 for name in ['panna-cage-180-v2.glb','panna-cage-180-v2.blend','panna-cage-180-surface-20cm.glb']:shutil.copyfile(OUT/name,PUBLIC/name)
 (PUBLIC/'panna-cage-180-surface.json').write_text(json.dumps([floor],separators=(',',':'))+'\n');(PUBLIC/'panna-cage-180-v2-manifest.json').write_text(json.dumps(r,indent=2)+'\n')
print('CAGE180 VERIFIED',triangles,'triangles',hi[0]-lo[0],hi[1]-lo[1],hi[2]-lo[2])
