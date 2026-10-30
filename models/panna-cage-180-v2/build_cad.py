"""Panna Cage 180 CAD r2. Reuses validated Cage 90 BRep templates, not a scaled mesh.
Source assembly Boisko 03-H: 12 standard / 2 goals / 2 notched modules.
"""
import sys,math,json,hashlib
from pathlib import Path
sys.path.append('/Applications/FreeCAD.app/Contents/Resources/lib')
import FreeCAD as A,Part,MeshPart
OUT=Path(__file__).resolve().parent;BASE=OUT.parent/'panna-cage-90-v2'
source=A.openDocument(str(BASE/'panna-cage-90-v2.FCStd'));base_report=json.loads((BASE/'cad-validation.json').read_text())
doc=A.newDocument('Panna_Cage_180_r2');templates={};parts=[]
for kind in ['Panel 01','Panel 02','Panel 03']:
 collection=doc.addObject('App::Part',kind.replace(' ',''));collection.Label=kind;templates[kind]=[]
 for old in source.Objects:
  if not hasattr(old,'Group')or not hasattr(old,'Drawing')or not hasattr(old,'Shape'):continue
  if not old.Label.startswith(kind+' '):continue
  ob=doc.addObject('PartDesign::Feature',old.Name);ob.Label=old.Label;ob.Shape=old.Shape.copy();collection.addObject(ob)
  for key in ['Group','Drawing']:ob.addProperty('App::PropertyString',key,'Provenance');setattr(ob,key,getattr(old,key))
  parts.append(ob);templates[kind].append(ob)
 collection.Visibility=False
assert [len(templates[k])for k in templates]==[3,3,2]
assembly=doc.addObject('App::Part','Assembly');assembly.Label='Panna Cage 180 — two source-defined 900 mm levels';count={'Panel 01':0,'Panel 02':0,'Panel 03':0};placed=[]
for level in [0,1]:
 for i in range(8):
  kind='Panel 03'if i==1 else 'Panel 02'if level==0 and i in [0,4]else 'Panel 01';count[kind]+=1
  for template in templates[kind]:
   shape=template.Shape.copy()
   if level and kind=='Panel 03':
    transform=A.Matrix();transform.A33=-1;transform.A34=1800;shape=shape.transformGeometry(transform)
   elif level:shape.translate(A.Vector(0,0,900))
   shape.rotate(A.Vector(),A.Vector(0,0,1),i*45)
   ob=doc.addObject('PartDesign::Feature',f'L{level+1}_S{i+1}_{template.Name}');ob.Label=f'L{level+1} S{i+1} {template.Label}';ob.Shape=shape;assembly.addObject(ob);placed.append(shape)
   assert shape.isValid(),ob.Label
assert count=={'Panel 01':12,'Panel 02':2,'Panel 03':2}
doc.recompute();doc.saveAs(str(OUT/'panna-cage-180-v2.FCStd'));Part.makeCompound(placed).exportStep(str(OUT/'panna-cage-180-v2.step'))
check=Part.read(str(OUT/'panna-cage-180-v2.step'));assert check.Volume>1e6 and check.isValid();assert abs(check.BoundBox.ZMax-1800)<.01 and abs(check.BoundBox.ZMin)<.01;assert abs(check.BoundBox.XLength-6722.51)<.1
master=[];web=[]
for ob in parts:
 for target,linear,angular in [(master,.3,.24),(web,.85 if ob.Group=='panels'else .3,.9 if ob.Group=='panels'else .24)]:
  mesh=MeshPart.meshFromShape(Shape=ob.Shape,LinearDeflection=linear,AngularDeflection=angular,Relative=False);v,f=mesh.Topology
  target.append({'name':ob.Label,'module':ob.getParentGeoFeatureGroup().Label,'group':ob.Group,'source':ob.Drawing,'v':[[p.x/1000,p.y/1000,p.z/1000]for p in v],'f':[list(t)for t in f]})
for name,value in [('cad-parts.json',master),('web-parts.json',web)]: (OUT/name).write_text(json.dumps(value,separators=(',',':')))
pdf=OUT.parents[3]/'models/panna-circle-cage-2/sources/Boisko 03-H.pdf'
if not pdf.exists():pdf=Path('/Users/mac/Documents/Gamefields/models/panna-circle-cage-2/sources/Boisko 03-H.pdf')
report={**base_report,'product':'Panna Cage 180','assembly':count,'CAD':'FreeCAD '+'.'.join(A.Version()[:3]),'parts':len(master),'stepVolume_mm3':check.Volume,'triangles_per_templates':sum(len(p['f'])for p in master),'web_triangles_per_templates':sum(len(p['f'])for p in web),'baseCAD':{'file':'../panna-cage-90-v2/panna-cage-90-v2.FCStd','sha256':hashlib.sha256((BASE/'panna-cage-90-v2.FCStd').read_bytes()).hexdigest()},'sources':base_report['sources']+[{'name':'Boisko 03-H.pdf','sha256':hashlib.sha256(pdf.read_bytes()).hexdigest()}]}
report['documented']={**report['documented'],'height_m':1.8,'levels':2,'levelHeight_m':.9,'upperEntry':'Panel 03 mirrored vertically; opening remains in sector 2','goals':'lower sectors 1 and 5, outward'}
report['visualAssumptions']=base_report['visualAssumptions']+['Newer Panel 02 rear goal height 315 mm retained instead of older assembly 472 mm, consistent with Cage 90 CAD r2']
(OUT/'cad-validation.json').write_text(json.dumps(report,indent=2)+'\n');print('CAGE180_CAD_READY',count,check.BoundBox,flush=True)
