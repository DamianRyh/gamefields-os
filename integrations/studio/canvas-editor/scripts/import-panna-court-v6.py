"""Convert approved CAD-derived GLB into the Studio indexed Mesh format (no ground).
Run: python scripts/import-panna-court-v6.py path/to/Panna_Play_P1.glb
The source must contain identity nodes and exactly 16 single 2 mm sheets.
"""
import sys, json, struct, math, hashlib
from pathlib import Path
root=Path(__file__).resolve().parents[1]
b=Path(sys.argv[1]).read_bytes()
assert b[:4]==b'glTF'
n=struct.unpack_from('<I',b,12)[0]; doc=json.loads(b[20:20+n]); binary=b[28+n:]
def accessor(index):
 a=doc['accessors'][index]; bv=doc['bufferViews'][a['bufferView']]
 assert not a.get('sparse')
 count={'SCALAR':1,'VEC2':2,'VEC3':3}[a['type']]; fmt={5126:'f',5125:'I',5123:'H',5121:'B'}[a['componentType']]
 size=struct.calcsize('<'+fmt)*count; start=bv.get('byteOffset',0)+a.get('byteOffset',0)
 return [list(struct.unpack_from('<'+fmt*count,binary,start+i*bv.get('byteStride',size))) for i in range(a['count'])]
def rotate(v): return [round(-v[2],6),round(v[1],6),round(v[0],6)]
meshes=[]; sheet_count=0; triangle_count=0
for node in doc['nodes']:
 assert not any(k in node for k in ['matrix','rotation','translation','scale']), 'Bake transforms first'
 if 'mesh' not in node: continue
 name=node['extras']['cad_source']; sheet=node['extras']['category']=='sheet'
 if sheet: sheet_count+=1
 for primitive in doc['meshes'][node['mesh']]['primitives']:
  assert primitive.get('mode',4)==4
  vertices=list(map(rotate,accessor(primitive['attributes']['POSITION'])))
  normals=list(map(rotate,accessor(primitive['attributes']['NORMAL'])))
  indices=[i[0] for i in accessor(primitive['indices'])]; faces=[indices[i:i+3] for i in range(0,len(indices),3)]; triangle_count+=len(faces)
  groups={'inner':[],'outer':[],'edge':[]} if sheet else {'body':faces}
  if sheet:
   for f in faces:
    a,c,d=[vertices[i] for i in f]; u=[c[k]-a[k] for k in range(3)];v=[d[k]-a[k] for k in range(3)]
    normal=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]]; length=math.hypot(*normal)
    if length<1e-12: groups['edge'].append(f);continue
    normal=[q/length for q in normal]; center=[sum(vertices[i][k] for i in f)/3 for k in range(3)]
    # Broad sheet faces point toward/away from the court centre. End bevels and thickness remain solid.
    radial=normal[0]*center[0]+normal[2]*center[2]
    avg=[sum(normals[i][k] for i in f)/3 for k in range(3)]
    broad=abs(avg[1])<.05 and abs(radial)>1
    groups[('inner' if radial<0 else 'outer') if broad else 'edge'].append(f)
  for side,ff in groups.items():
   if not ff: continue
   used=sorted({i for f in ff for i in f}); remap={v:i for i,v in enumerate(used)}; vv=[vertices[i] for i in used]
   # Planar local UVs keep branding on each panel and independent of perforation pitch.
   xs=[v[0] for v in vv];zs=[v[2] for v in vv]; ys=[v[1] for v in vv]
   axis=0 if max(xs)-min(xs)>=max(zs)-min(zs) else 2
   lo=min(v[axis] for v in vv);span=max(v[axis] for v in vv)-lo;bottom=min(ys);height=max(ys)-bottom
   uv=[[round((v[axis]-lo)/max(span,1e-9),6),round((v[1]-bottom)/max(height,1e-9),6)] for v in vv]
   meshes.append(dict(id=name+'_'+side,label=name+' '+side,group='panels' if sheet and side!='edge' else 'goals' if name.startswith('BR1') else 'frame',v=vv,normals=[normals[i] for i in used],f=[[remap[i] for i in f] for f in ff],uv=uv,artwork=sheet and side in ['inner','outer']))
# A per-panel planar direction avoids cylindrical perforation distortion on Panna Court.
for m in meshes:
 if m['group']=='panels':
  horizontal=next(n for n in m['normals'] if abs(n[1])<.01)
  m['perforationDirection']=[round(horizontal[2],6),round(-horizontal[0],6)]
assert sheet_count==16
assert sum(len(m['f']) for m in meshes)==triangle_count
assert sum(m['id'].endswith('_inner') for m in meshes)==16
assert sum(m['id'].endswith('_outer') for m in meshes)==16
out=root/'public/arenas/p1.json';out.write_text(json.dumps(meshes,separators=(',',':'))+'\n')
report={'sourceSha256':hashlib.sha256(b).hexdigest(),'sheets':sheet_count,'meshCount':len(meshes),'triangles':triangle_count,'ground':False,'orientation':'GLB to Studio: (-z,y,x)','outputSha256':hashlib.sha256(out.read_bytes()).hexdigest()}
(root/'public/arenas/panna-court-v6-manifest.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
