import {spawnSync} from 'node:child_process';
import {rmSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
const result=spawnSync(process.execPath,[fileURLToPath(new URL('./run-framework.mjs',import.meta.url)),'build'],{stdio:'inherit'});
if(result.error)throw result.error;
if(result.status!==0)process.exit(result.status??1);
// Editable Blender sources remain in the repository; the browser uses their GLB exports.
// Omit only the two duplicate authoring files from the production asset archive.
for(const name of ['panna-cage-90-v2.blend','panna-cage-180-v2.blend']){
 rmSync(new URL('../dist/client/arenas/'+name,import.meta.url),{force:true});
}
