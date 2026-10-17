"""Extract an auditable scene inventory, never a manufacturing BOM or quotation."""
import collections,hashlib,json,re,struct
from pathlib import Path
root=Path(__file__).resolve().parents[2]
source=root/'assets/private/gamefields/source/panna-kids-o1.glb'
raw=source.read_bytes();length=struct.unpack_from('<I',raw,12)[0];g=json.loads(raw[20:20+length])
report=json.loads((root/'assets/private/gamefields/library.json').read_text())
asset=next(s for s in report['sources'] if s['id']=='panna-kids-o1')
node_names=[n.get('name','') for n in g['nodes'] if 'mesh' in n]
rows=[]
for prefix,label in [('PO1','Panele niskie'),('PO2','Zespoły przejść'),('PO3','Nadproża')]:
 pattern=r'^('+prefix+r' -?\d+(?:\.\d+)?'+(r' -?\d+' if prefix!='PO3' else '')+r') '
 groups=sorted(set(m.group(1) for name in node_names if (m:=re.match(pattern,name))))
 rows.append({'family':prefix,'label':label,'quantity':len(groups),'sourceGroups':groups})
for key,label,pattern in [('BR1','Zespoły bramek',r'^(BR1 -?\d+) -?\d+(?:\.\d+)?$'),('S1','Słupki S1',r'^(S1(?:\.\d+)?)$'),('PO2-post','Słupki wysokie PO2',r'^(PO2 slup wysoki(?:\.\d+)?)$')]:
 groups=sorted(set(m.group(1) for name in node_names if (m:=re.match(pattern,name))))
 rows.append({'family':key,'label':label,'quantity':len(groups),'sourceGroups':groups})
data={'status':'OBSERVED_SCENE_INVENTORY_NOT_MANUFACTURING_BOM','sourceFile':'panna-kids-o1.glb','sha256':hashlib.sha256(raw).hexdigest(),'meshCount':len(node_names),'measuredBoundsM':asset['measuredBoundsM'],'inventory':rows,'sourceMaterialNames':sorted(set(m.get('name','') for m in g['materials'])),'authoredSheetThicknessMm':sorted(set(n['extras']['sheet_thickness_mm'] for n in g['nodes'] if 'sheet_thickness_mm' in n.get('extras',{}))),'confirmedManufacturingDimensions':None,'confirmedWeightKg':None,'connectionPoints':None,'confirmedSurface':None,'confirmedPriceNetPln':None}
(root/'lib/products/panna-kids-evidence.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
print([(r['family'],r['quantity']) for r in rows])
