import { defineConfig } from 'vite';
import { execFileSync } from 'node:child_process';
import { buildPages } from './scripts/build-pages.mjs';

// Relative base: the same build works at https://user.github.io/<repo>/ and on a custom domain root.
// Every route is a real index.html, so refreshes and deep links work on GitHub Pages without rewrites.
const inputs = await buildPages();

// Dev: regenerate pages in a fresh process when data, templates or generator change, then reload.
const pagesPlugin = {
  name: 'tifferend-pages',
  handleHotUpdate({ file, server }) {
    if (/[\\/](src[\\/]data|scripts)[\\/]/.test(file)) {
      execFileSync(process.execPath, ['scripts/build-pages.mjs'], { stdio: 'inherit' });
      server.ws.send({ type: 'full-reload' });
      return [];
    }
  },
};

export default defineConfig({
  base: './',
  plugins: [pagesPlugin],
  build: {
    target: 'es2020',
    assetsInlineLimit: 0,
    rollupOptions: { input: inputs },
  },
  server: { host: true, port: 5173 },
  preview: { host: true, port: 4173 },
});
