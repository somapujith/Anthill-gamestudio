import { readFile, access, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
const publicRoot = new URL('../public/', import.meta.url);
const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
if (new Set(ids).size !== ids.length) throw new Error('Duplicate HTML IDs.');
const local = ref => !/^[a-z]+:|^\/\/|^#|^%23/i.test(ref);
const check = async ref => {
  if (ref.startsWith('#')) {
    if (!ids.includes(ref.slice(1))) throw new Error(`Missing anchor ${ref}`);
  } else if (local(ref)) await access(new URL(ref.replace(/^\//, '').split('?')[0], publicRoot));
};
for (const match of html.matchAll(/\b(?:src|href)="([^"]+)"/g)) await check(match[1]);
for (const file of (await readdir(publicRoot)).filter(f => f.endsWith('.css'))) {
  const css = await readFile(new URL(file, publicRoot), 'utf8');
  for (const match of css.matchAll(/url\(['"]?([^\)'"\s]+)/g)) await check(match[1]);
}
for (const match of html.matchAll(/<script\s+src="([^"]+)"/g)) {
  const file = fileURLToPath(new URL(match[1].replace(/^\//, ''), publicRoot));
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr);
}
console.log('PASS: local assets, anchors, unique IDs and loaded JavaScript.');
