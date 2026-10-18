import {copyFile,mkdir,mkdtemp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';

const root=fileURLToPath(new URL('../',import.meta.url));
const staging=await mkdtemp(path.join(tmpdir(),'gamefields-gateway-'));
const output=path.join(root,'dist/wordpress');
try {
  const plugin=path.join(staging,'gamefields-studio-play');
  await mkdir(plugin);
  await mkdir(output,{recursive:true});
  await copyFile(path.join(root,'integrations/wordpress/gamefields-play.php'),path.join(plugin,'gamefields-play.php'));
  await copyFile(path.join(root,'integrations/wordpress/README.md'),path.join(plugin,'README.md'));
  const zip=spawnSync('zip',['-q','-r','gateway.zip','gamefields-studio-play'],{cwd:staging,stdio:'inherit'});
  if (zip.error||zip.status!==0) throw zip.error||new Error('WordPress ZIP packaging failed; install zip.');
  await copyFile(path.join(staging,'gateway.zip'),path.join(output,'gamefields-studio-play.zip'));
  console.log('WordPress package: dist/wordpress/gamefields-studio-play.zip');
} finally {
  await rm(staging,{recursive:true,force:true});
}
