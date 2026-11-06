// Writes static HTML for each indexable page after `vite build` (see "build" in package.json).
// Uses the server bundle built from src/entry-server.tsx into dist-ssr/.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const { PRERENDER_PATHS, renderPage } = await import(join(root, 'dist-ssr', 'entry-server.js'));

const template = await readFile(join(dist, 'index.html'), 'utf8');
// The bare app shell, for an SPA fallback rule that shouldn't show the home page's content.
await writeFile(join(dist, '200.html'), template);

for (const path of PRERENDER_PATHS) {
  const file = path === '/' ? join(dist, 'index.html') : join(dist, path, 'index.html');
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, renderPage(template, path));
  console.log(`prerendered ${path} -> ${file.slice(root.length + 1)}`);
}
