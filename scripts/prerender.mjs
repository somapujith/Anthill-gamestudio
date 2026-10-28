import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = new URL('../dist/index.html', import.meta.url);
const server = await createServer({ root, mode: 'production', appType: 'custom', server: { middlewareMode: true }, logLevel: 'error' });

try {
  const { render } = await server.ssrLoadModule('/src/entry-server.jsx');
  const template = await readFile(output, 'utf8');
  const marker = '<div id="root"></div>';
  if (!template.includes(marker)) throw new Error('Cannot prerender: root placeholder is missing.');
  const content = render();
  if (!content.includes('id="hero-heading"')) throw new Error('Cannot prerender: hero content is missing.');
  await writeFile(output, template.replace(marker, `<div id="root">${content}</div>`));
  console.log(`Prerendered /: ${Buffer.byteLength(content).toLocaleString('en-US')} bytes of page HTML.`);
} finally {
  await server.close();
}
