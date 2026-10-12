#!/usr/bin/env node
// Build the uploadable game: copy only runtime files into dist/.
// dist/ is a self-contained static site (index.html at the root, relative
// paths). `butler push dist stevenli-phoenix-work/tree-hole:html5` publishes it.
import { access, cp, mkdir, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { basename, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const RUNTIME = ['index.html', 'src', 'styles'];

async function dirSize(path) {
  const info = await stat(path);
  if (!info.isDirectory()) return { bytes: info.size, files: 1 };
  let bytes = 0;
  let files = 0;
  for (const entry of await readdir(path)) {
    const sub = await dirSize(join(path, entry));
    bytes += sub.bytes;
    files += sub.files;
  }
  return { bytes, files };
}

export async function build({ outDir = join(ROOT, 'dist') } = {}) {
  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });
  for (const item of RUNTIME) {
    await cp(join(ROOT, item), join(outDir, item), {
      recursive: true,
      filter: (src) => !/\.test\.(m?js)$/.test(src) && !basename(src).startsWith('.'),
    });
  }
  // No key (src/llm-key.js, written by CI from a secret) → an empty one: the game plays offline.
  const keyFile = join(outDir, 'src', 'llm-key.js');
  const hasKey = await access(keyFile).then(() => true, () => false);
  if (!hasKey) await writeFile(keyFile, "export default '';\n");
  console.log(`[build] LLM key: ${hasKey ? 'included' : 'none, offline build'}`);
  const { bytes, files } = await dirSize(outDir);
  console.log(`[build] ${files} files, ${(bytes / 1024).toFixed(1)} KiB → ${outDir}`);
  return { outDir, bytes, files };
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href;
if (isMain) {
  build().catch((err) => {
    console.error('[build] failed:', err);
    process.exit(1);
  });
}
