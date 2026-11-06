"""Concept equipment only: dimensioned preview proxies, not manufacturer or construction models."""
import bpy,math,json,pathlib,hashlib
root=pathlib.Path(__file__).resolve().parents[1];out=root/'public/sport-equipment'
records={}
def mesh(id,group,v,f):return dict(id=id,label=id,group=group,v=v,f=f,uv=[[0,0] for _ in v],artwork=False)
def box(id,group,c,s):
 x,y,z=c;a,b,d=[v/2 for v in s];v=[[x+sx*a,y+sy*b,z+sz*d] for sx,sy,sz in [(-1,-1,-1),(1,-1,-1),(1,1,-1),(-1,1,-1),(-1,-1,1),(1,-1,1),(1,1,1),(-1,1,1)]]
 return mesh(id,group,v,[[0,2,1],[0,3,2],[4,5,6],[4,6,7],[0,1,5],[0,5,4],[3,7,6],[3,6,2],[0,4,7],[0,7,3],[1,2,6],[1,6,5]])
def torus(id,y,r,t):
 v=[];f=[]
 for i in range(48):
  a=i*2*math.pi/48
  for j in range(8):
   b=j*2*math.pi/8;v.append([(r+t*math.cos(b))*math.cos(a),y+t*math.sin(b),(r+t*math.cos(b))*math.sin(a)])
 for i in range(48):
  for j in range(8):
   a=i*8+j;b=((i+1)%48)*8+j;c=((i+1)%48)*8+(j+1)%8;d=i*8+(j+1)%8;f.extend([[a,b,c],[a,c,d]])
 return mesh(id,'equipment-rim',v,f)
def save(id,data):
 (out/(id+'.json')).write_text(json.dumps(data,separators=(',',':'))+'\n');bpy.ops.wm.read_factory_settings(use_empty=True)
 for item in data:
  m=bpy.data.meshes.new(item['id']);m.from_pydata([(x,-z,y) for x,y,z in item['v']],[],item['f']);m.update();obj=bpy.data.objects.new(item['id'],m);bpy.context.collection.objects.link(obj)
  mat=bpy.data.materials.new(item['group']);mat.diffuse_color=({'equipment-table':(.39,.21,.96,1),'equipment-rim':(.94,.3,.1,1),'equipment-board':(.94,.94,.92,1),'equipment-net':(.8,.82,.8,1)}.get(item['group'],(.12,.14,.15,1)));m.materials.append(mat)
 bpy.ops.export_scene.gltf(filepath=str(out/(id+'.glb')),export_format='GLB',export_yup=True)
 bpy.ops.wm.save_as_mainfile(filepath=str(out/(id+'.blend')))
 records[id]={'sha256':hashlib.sha256((out/(id+'.json')).read_bytes()).hexdigest(),'meshes':len(data),'triangles':sum(len(m['f']) for m in data)}
# Table curvature is an approximation through the published highest/lowest heights.
v=[];f=[];n=48
for i in range(n+1):
 x=-1.5+3*i/n;y=.76-.195*(x/1.5)**2;v.extend([[x,y,-.75],[x,y,.75],[x,y-.035,-.75],[x,y-.035,.75]])
for i in range(n):
 a=i*4;b=(i+1)*4
 f.extend([[a,b,b+1],[a,b+1,a+1],[a+2,a+3,b+3],[a+2,b+3,b+2],[a,a+2,b+2],[a,b+2,b],[a+1,b+1,b+3],[a+1,b+3,a+3]])
f.extend([[0,1,3],[0,3,2],[n*4,n*4+2,n*4+3],[n*4,n*4+3,n*4+1]])
table=[mesh('teq-table-top','equipment-table',v,f),box('teq-net','equipment-net',(0,.83,0),(.02,.14,1.7))]
for x in [-.8,.8]:
 table.extend([box('teq-support-'+str(x),'equipment-frame',(x,.32,0),(.15,.64,1.05)),box('teq-foot-'+str(x),'equipment-frame',(x,.04,0),(.55,.08,1.25))])
save('teq-table',table)
hoop=[torus('basketball-rim',3.032,.225,.018),box('basketball-board','equipment-board',(-.4,3.425,0),(.05,1.05,1.8)),box('basketball-pole','equipment-frame',(-2.7,1.7,0),(.18,3.4,.18)),box('basketball-arm','equipment-frame',(-1.55,3.45,0),(2.3,.15,.15)),box('basketball-base','equipment-frame',(-2.7,.1,0),(1,.2,.9))]
# Short visible net strands, a concept proxy rather than a textile simulation.
for i in range(16):
 a=i*2*math.pi/16;hoop.append(box('basketball-net-'+str(i),'equipment-net',(.19*math.cos(a),2.83,.19*math.sin(a)),(.012,.4,.012)))
save('basketball-hoop',hoop)
(root/'lib/sport-equipment-manifest.json').write_text(json.dumps({'schema':'GF-SPORT-EQUIPMENT-1','conceptOnly':True,'assets':records},indent=2)+'\n')
print('SPORT_EQUIPMENT_EXPORTED',records)
