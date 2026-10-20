import bpy,os,json,hashlib
from mathutils import Matrix,Vector
ROOT=os.path.abspath(os.path.join(os.path.dirname(__file__),'../..'));OUT=os.path.dirname(os.path.abspath(__file__));report=[]
def export(key,objects,source,center_post=False,upper=False):
 bpy.ops.object.select_all(action='DESELECT');copies=[]
 for src in objects:
  o=src.copy();o.data=src.data.copy();bpy.context.scene.collection.objects.link(o);o.matrix_world=Matrix.Identity(4)
  if center_post:
   vs=[v.co for v in o.data.vertices];cx=(min(v.x for v in vs)+max(v.x for v in vs))/2;cy=(min(v.y for v in vs)+max(v.y for v in vs))/2
   for v in o.data.vertices:v.co.x-=cx;v.co.y-=cy
  if upper:
   for v in o.data.vertices:v.co.z-=.9
  o.select_set(True);copies.append(o)
 assert copies,key
 path=OUT+'/'+key+'.glb';bpy.ops.export_scene.gltf(filepath=path,export_format='GLB',use_selection=True)
 report.append({'id':key,'file':key+'.glb','source':source,'sourceObjects':[o.name for o in objects],'scale':[1,1,1],'sha256':hashlib.sha256(open(path,'rb').read()).hexdigest()})
 for o in copies:bpy.data.objects.remove(o,do_unlink=True)
for family,path,groups in [
 ('street-field','models/street-field/street-field.blend',{'sf-long':['Bok 1 panel 1'],'sf-entry':['Bok -1 panel 2'],'sf-short':['Czolo 1 panel 1'],'sf-goal':['Czolo 1 panel 2']}),
 ('octagon','models/octagon/octagon.blend',{'oct-standard':['Panel 2 '],'oct-entry':['Panel 1 '],'oct-goal':['Panel 3 ']}),
 ('circle-cage','models/panna-circle-cage-2/panna-circle-cage-2.blend',{'cc-standard':['Panel 01 L1 S3 '],'cc-entry':['Panel 03 L1 S2 '],'cc-goal':['Panel 02 L1 S1 '],'cc-upper-entry':['Panel 03 L2 S2 ']})]:
 bpy.ops.wm.open_mainfile(filepath=ROOT+'/'+path)
 for key,prefixes in groups.items():export(key,[o for o in bpy.context.scene.objects if o.type=='MESH' and any(o.name.startswith(p) for p in prefixes)],path,upper=key=='cc-upper-entry')
 if family!='circle-cage':export('sf-post' if family=='street-field' else 'oct-post',[next(o for o in bpy.context.scene.objects if o.name=='Slup 01')],path,center_post=True)
json.dump({'schema':'GF-OWNED-MODULES-1','components':report},open(OUT+'/provenance.json','w'),indent=2)
print('EXPORTED',len(report))
