"""Panna Cage 90 r2: source-based BRep parts, metres converted from drawing millimetres.
Run with FreeCAD's bundled Python; preserves previous Blender and source drawings.
"""
import sys,os,math,json,hashlib
from pathlib import Path
sys.path.append('/Applications/FreeCAD.app/Contents/Resources/lib')
import FreeCAD as A,Part,MeshPart
OUT=Path(__file__).resolve().parent;R=3030.;RM=3013.5;H=900.;HALF=math.pi/8;WALL=3.
doc=A.newDocument('Panna_Cage_90_r2');parts=[];templates={};assumptions=[]
def vec(t,z,r=R):return A.Vector(r*math.cos(t),r*math.sin(t),z)
def sector(t0,t1,z=0,r0=3000,r1=3060):
 def arc(r,start,end):return Part.Arc(vec(start,z,r),vec((start+end)/2,z,r),vec(end,z,r)).toShape()
 a,b=vec(t0,z,r0),vec(t1,z,r0);c,d=vec(t1,z,r1),vec(t0,z,r1)
 return Part.Face(Part.Wire([arc(r0,t0,t1),Part.makeLine(b,c),arc(r1,t1,t0),Part.makeLine(d,a)]))
def arcbeam(t0,t1,z):
 outer=sector(t0,t1,z-20).extrude(A.Vector(0,0,40))
 long_edges=[e for e in outer.Edges if e.Length>100]
 try:outer=outer.makeFillet(1.2,long_edges)
 except Exception:pass
 inner=sector(t0,t1,z-17,3003,3057).extrude(A.Vector(0,0,34))
 return outer.cut(inner)
def beam(a,b,width=40,depth=60):
 a,b=A.Vector(*a),A.Vector(*b);d=b-a;L=d.Length
 outer=Part.makeBox(width,depth,L,A.Vector(-width/2,-depth/2,0))
 try:outer=outer.makeFillet(1.2,[e for e in outer.Edges if abs(e.Length-L)<1e-5])
 except Exception:pass
 inner=Part.makeBox(width-6,depth-6,L+2,A.Vector(-width/2+3,-depth/2+3,-1));shape=outer.cut(inner)
 shape.Placement=A.Placement(a,A.Rotation(A.Vector(0,0,1),d));return shape

def upright(t,z0,z1):
 # Posts lie inside their own module end plane, rather than intersecting adjacent modules.
 shape=beam((0,0,z0),(0,0,z1),40,60);shape.rotate(A.Vector(),A.Vector(0,0,1),math.degrees(t)-90);shape.translate(vec(t,0));return shape

def sleeve(center,axis):
 axis.normalize();p=center-axis*20
 s=Part.makeCylinder(10,40,p,axis).cut(Part.makeCylinder(6,42,p-axis,axis))
 circles=[e for e in s.Edges if abs(e.Length-20*math.pi)<.1]
 try:s=s.makeChamfer(1,circles)
 except Exception:pass
 return s

def wirefield(t0,t1,z0,z1):
 solids=[];n=max(1,round((t1-t0)*RM/50));nz=max(1,round((z1-z0)/50))
 for i in range(n+1):
  t=t0+(t1-t0)*i/n;solids.append(Part.makeCylinder(1.5,z1-z0,vec(t,z0,RM)))
 for j in range(nz+1):
  z=z0+(z1-z0)*j/nz;s=Part.makeTorus(RM,1.5,A.Vector(0,0,z),A.Vector(0,0,1),0,360,math.degrees(t1-t0));s.rotate(A.Vector(),A.Vector(0,0,1),math.degrees(t0));solids.append(s)
 return Part.makeCompound(solids)

def add(collection,name,shapes,group,source):
 if not shapes:return
 shape=shapes[0].multiFuse(shapes[1:]).removeSplitter() if group=='goals' else Part.makeCompound(shapes);assert not shape.isNull()
 ob=doc.addObject('PartDesign::Feature',name.replace(' ','_'));ob.Label=name;ob.Shape=shape;collection.addObject(ob)
 for k,v in [('Group',group),('Drawing',source)]:ob.addProperty('App::PropertyString',k,'Provenance');setattr(ob,k,v)
 ob.addProperty('App::PropertyString','Scope','Provenance');ob.Scope='Visual source-based model, not certified fabrication BOM'
 parts.append((ob,group,source));return ob

for kind in ['Panel 01','Panel 02','Panel 03']:
 collection=doc.addObject('App::Part',kind.replace(' ',''));collection.Label=kind
 frame=[];wires=[];goals=[];sleeves=[];shift=20.05/R
 for t in [-HALF+shift,HALF-shift]:frame.append(upright(t,0,H))
 if kind=='Panel 01':
  for z in [20,880]:
   shape=arcbeam(-HALF,HALF,z)
   for i in range(4):
    t=-HALF+math.radians(.5+14*i);p=vec(t,z);shape=shape.cut(Part.makeCylinder(10,42,p-A.Vector(0,0,21)))
    sleeves.append(sleeve(p,A.Vector(0,0,1)))
   frame.append(shape)
  for side,t in enumerate([-HALF+shift,HALF-shift]):
   post=frame[side];axis=A.Vector(-math.sin(t),math.cos(t),0)
   for z in [100,450,800]:
    p=vec(t,z,3023);post=post.cut(Part.makeCylinder(10,42,p-axis*21,axis));sleeves.append(sleeve(p,axis))
   frame[side]=post
  frame.append(upright(0,40,860))
  for lo,hi in [(-HALF+.014,-.007),(.007,HALF-.014)]:wires.append(wirefield(lo,hi,40,860))
 elif kind=='Panel 02':
  angle=math.asin(524/R);frame.append(arcbeam(-HALF,HALF,880))
  for lo,hi in [(-HALF,-angle),(angle,HALF)]:frame.append(arcbeam(lo,hi,20));wires.append(wirefield(lo+.014,hi-.014,40,860))
  wires.append(wirefield(-angle+.007,angle-.007,660,860))
  front=math.sqrt(R*R-524**2);back=6722.51/2-30
  for y in [-524,524]:
   # Radial 60 / tangent 40 mm: goal external clear layout stays 1088 mm wide.
   goals.extend([beam((front,y,0),(front,y,640),60,40),beam((back,y,0),(back,y,315),60,40),beam((front,y,620),(back,y,295),40,40),beam((front,y,20),(back,y,20),40,40)])
  goals.extend([beam((front,-524,620),(front,524,620),60,40),beam((back,-524,295),(back,524,295),60,40),beam((back,-524,20),(back,524,20),40,40)])
  for y in [-440,-220,0,220,440]:goals.extend([beam((back,y,20),(back,y,295),30,30),beam((front,y,620),(back,y,295),30,30)])
  # The documented 5 mm comb plate, kept separate from structural profiles.
  plate=Part.makeBox(5,900,35,A.Vector(back-2.5,-450,0))
  for j in range(3):plate=plate.cut(Part.makeBox(7,31,25,A.Vector(back-3.5,-450+25.5+189+j*220,10)))
  for y in [-450,424.5]:plate=plate.cut(Part.makeBox(7,25.5,25,A.Vector(back-3.5,y,10)))
  goals.append(plate)
 else:
  a=math.atan2(20,3000)+math.asin(287.5/math.hypot(3000,20));frame.extend([arcbeam(-HALF,HALF,20),arcbeam(-a,a,280)])
  for lo,hi in [(-HALF,-a),(a,HALF)]:frame.append(arcbeam(lo,hi,880));wires.append(wirefield(lo+.014,hi-.014,40,860))
  for t in [-a,a]:frame.append(upright(t,260,900))
  frame.append(upright(0,40,260));wires.append(wirefield(-a+.007,a-.007,40,260))
 objs=[add(collection,kind+' frame',frame,'frame','ST 002/003/004, 40×60×3'),add(collection,kind+' wire',wires,'panels','Siatka 001/002/003, wire Ø3; pitch 50 mm visual assumption'),add(collection,kind+' goal',goals,'goals','Panel 02, ST 005–021'),add(collection,kind+' sleeves',sleeves,'frame','Tuleja 001 Ø20/12×40, 1×45°')]
 templates[kind]=[o for o in objs if o]
 collection.Visibility=False
 print('CAD_TEMPLATE',kind,flush=True)
assembly=doc.addObject('App::Part','Assembly');assembly.Label='Panna Cage 90 — eight source sectors'
counts={'Panel 01':0,'Panel 02':0,'Panel 03':0};links=[]
for i in range(8):
 kind='Panel 03' if i==1 else 'Panel 02' if i in [0,4] else 'Panel 01';counts[kind]+=1
 link=doc.addObject('App::Link','Sector'+str(i+1));link.setLink(doc.getObject(kind.replace(' ','')));link.Label=f'S{i+1} {kind}';link.Placement=A.Placement(A.Vector(),A.Rotation(A.Vector(0,0,1),i*45));assembly.addObject(link);links.append(link)
assert counts=={'Panel 01':5,'Panel 02':2,'Panel 03':1}
doc.recompute();doc.saveAs(str(OUT/'panna-cage-90-v2.FCStd'));step_shapes=[]
for i in range(8):
 kind='Panel 03' if i==1 else 'Panel 02' if i in [0,4] else 'Panel 01'
 for ob in templates[kind]:
  shape=ob.Shape.copy();shape.rotate(A.Vector(),A.Vector(0,0,1),i*45);step_shapes.append(shape)
Part.makeCompound(step_shapes).exportStep(str(OUT/'panna-cage-90-v2.step'))
step_check=Part.read(str(OUT/'panna-cage-90-v2.step'));assert step_check.Volume>1e6 and not step_check.isNull()
assert all(ob.Shape.isValid() for ob,_,_ in parts),'Invalid CAD solid'
assert abs(step_check.BoundBox.ZMax-900)<.01 and abs(step_check.BoundBox.ZMin)<.01,'Unexpected CAD height'
assert abs(step_check.BoundBox.XLength-6722.51)<.1,'Unexpected CAD goal envelope'
# Reusable module tessellation; assembly is instantiated in Blender without changing BRep source.
export=[];web=[]
for ob,group,source in parts:
 mesh=MeshPart.meshFromShape(Shape=ob.Shape,LinearDeflection=.3,AngularDeflection=.24,Relative=False)
 vertices,faces=mesh.Topology
 export.append({'name':ob.Label,'module':ob.getParentGeoFeatureGroup().Label,'group':group,'source':source,'v':[[p.x/1000,p.y/1000,p.z/1000]for p in vertices],'f':[list(f)for f in faces]})
for ob,group,source in parts:
 mesh=MeshPart.meshFromShape(Shape=ob.Shape,LinearDeflection=.65 if group=='panels' else .3,AngularDeflection=.65 if group=='panels' else .24,Relative=False)
 vertices,faces=mesh.Topology;web.append({'name':ob.Label,'module':ob.getParentGeoFeatureGroup().Label,'group':group,'source':source,'v':[[p.x/1000,p.y/1000,p.z/1000]for p in vertices],'f':[list(f)for f in faces]})
(OUT/'web-parts.json').write_text(json.dumps(web,separators=(',',':')))
(OUT/'cad-parts.json').write_text(json.dumps(export,separators=(',',':')))
report={'product':'Panna Cage 90','revision':2,'CAD':'FreeCAD '+'.'.join(A.Version()[:3]),'units':'mm in CAD, m in tessellation','assembly':counts,'documented':{'innerDiameter_m':6,'height_m':.9,'profiles_mm':[40,60,3],'wireDiameter_mm':3,'sleeve_mm':[20,12,40],'sleeveChamfer_mm':1,'goalWidth_mm':1088,'goalRearHeight_mm':315,'goalOverallLength_mm':6722.51,'entryWidth_mm':575},'visualAssumptions':['50 mm wire pitch retained from previous visual interpretation; drawing dimension not confirmed','1.2 mm profile edge fillet is a presentation finish; production corner radius not specified','Sleeve top/bottom arc angular placement interpreted from 0.5°/14° detail; no bolt or anchor specification inferred','Adjacent upright profiles positioned inside each module end plane to eliminate duplicate overlapping posts','No foundations, anchors, threaded bolt details or certified weld geometry inferred'],'parts':len(export),'triangles_per_templates':sum(len(p['f'])for p in export),'web_triangles_per_templates':sum(len(p['f'])for p in web),'stepVolume_mm3':step_check.Volume,'sources':[]}
for path in [Path('/Users/mac/Downloads/Boisko 03 28112023 (1).pdf'),Path('/Users/mac/Downloads/Panel 01/Panel 01.pdf'),Path('/Users/mac/Downloads/Panel 01/Profil ST 002.pdf'),Path('/Users/mac/Downloads/Panel 01/Profil ST 004.pdf'),Path('/Users/mac/Downloads/Panel 01/Tuleja 001.pdf'),Path('/Users/mac/Downloads/Panel 02/Profil ST 021.pdf')]:report['sources'].append({'name':path.name,'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})
(OUT/'cad-validation.json').write_text(json.dumps(report,indent=2));print('CAD_READY',report['triangles_per_templates'],flush=True)
