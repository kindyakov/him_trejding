import http from 'node:http';
import { access, readFile } from 'node:fs/promises';
import { constants, existsSync, readdirSync, watch } from 'node:fs';
import { extname, resolve } from 'node:path';

import posthtml from 'posthtml';
import include from 'posthtml-include';

const projectRoot = process.cwd();
const pagesDir = resolve(projectRoot, 'src/pages');
const devDir = resolve(projectRoot, '.dev');
const partialsDir = resolve(projectRoot, 'src/partials');
const srcAssetsDir = resolve(projectRoot, 'src/assets');
const publicAssetsDir = resolve(projectRoot, 'public/assets');
const port = 1234;
const liveReloadClients = new Set();
let reloadTimeoutId = null;
const excludedSourceDirs = new Set(['css', 'js']);
const assetSourceDirs = existsSync(srcAssetsDir)
  ? readdirSync(srcAssetsDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && !excludedSourceDirs.has(entry.name))
      .map((entry) => resolve(srcAssetsDir, entry.name))
  : [];

const processor = posthtml([
  include({
    root: './src/pages',
    cwd: '.',
    encoding: 'utf8'
  })
]);

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'application/javascript; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8'
};

const fileExists = async (filePath) => {
  try {
    await access(filePath, constants.F_OK);
    return true;
  } catch {
    return false;
  }
};

const renderHtml = async (pageName) => {
  const source = await readFile(resolve(pagesDir, pageName), 'utf8');
  const result = await processor.process(source);

  const html = result.html
    .replaceAll('../assets/css/index.css', '/css/index.css')
    .replaceAll('../assets/js/index.js', '/js/index.js')
    .replaceAll('../assets/', '/assets/');

  return injectLiveReload(html);
};

const serveFile = async (response, filePath) => {
  const content = await readFile(filePath);
  const type = mimeTypes[extname(filePath)] || 'application/octet-stream';

  response.writeHead(200, {
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Content-Type': type,
    Pragma: 'no-cache'
  });
  response.end(content);
};

const injectLiveReload = (html) => {
  const snippet = `
<script>
  (() => {
    const source = new EventSource('/__dev_reload');
    source.addEventListener('reload', () => window.location.reload());
  })();
</script>`;

  return html.includes('</body>')
    ? html.replace('</body>', `${snippet}\n</body>`)
    : `${html}\n${snippet}`;
};

const broadcastReload = () => {
  liveReloadClients.forEach((client) => {
    client.write('event: reload\n');
    client.write('data: now\n\n');
  });
};

const scheduleReload = () => {
  if (reloadTimeoutId) {
    clearTimeout(reloadTimeoutId);
  }

  reloadTimeoutId = setTimeout(() => {
    broadcastReload();
    reloadTimeoutId = null;
  }, 120);
};

const registerWatcher = (targetPath) => {
  try {
    const watcher = watch(targetPath, { recursive: true }, () => {
      scheduleReload();
    });

    watcher.on('error', (error) => {
      console.error(`Watch error for ${targetPath}:`, error.message);
    });

    return watcher;
  } catch (error) {
    console.error(`Failed to watch ${targetPath}:`, error instanceof Error ? error.message : error);
    return null;
  }
};

const watchers = [
  registerWatcher(devDir),
  registerWatcher(pagesDir),
  registerWatcher(partialsDir),
  ...assetSourceDirs.map((assetDir) => registerWatcher(assetDir)),
  registerWatcher(publicAssetsDir)
].filter(Boolean);

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url || '/', `http://localhost:${port}`);
    const pathname = url.pathname;

    if (pathname === '/__dev_reload') {
      response.writeHead(200, {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        Connection: 'keep-alive',
        'Content-Type': 'text/event-stream; charset=utf-8',
        Pragma: 'no-cache'
      });
      response.write(':ok\n\n');
      liveReloadClients.add(response);
      request.on('close', () => {
        liveReloadClients.delete(response);
      });
      return;
    }

    if (pathname === '/' || pathname === '/index.html') {
      response.writeHead(200, {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Content-Type': mimeTypes['.html'],
        Pragma: 'no-cache'
      });
      response.end(await renderHtml('index.html'));
      return;
    }

    if (pathname === '/about' || pathname === '/about.html') {
      response.writeHead(200, {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
        'Content-Type': mimeTypes['.html'],
        Pragma: 'no-cache'
      });
      response.end(await renderHtml('about.html'));
      return;
    }

    if (pathname.startsWith('/css/') || pathname.startsWith('/js/')) {
      await serveFile(response, resolve(devDir, `.${pathname}`));
      return;
    }

    if (pathname.startsWith('/assets/')) {
      const relativePath = pathname.replace('/assets/', '');
      const sourceAssetCandidate = resolve(srcAssetsDir, relativePath);
      const publicCandidate = resolve(publicAssetsDir, relativePath);

      if (
        !relativePath.startsWith('css/') &&
        !relativePath.startsWith('js/') &&
        existsSync(sourceAssetCandidate)
      ) {
        await serveFile(response, sourceAssetCandidate);
        return;
      }

      if (await fileExists(publicCandidate)) {
        await serveFile(response, publicCandidate);
        return;
      }
    }

    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  } catch (error) {
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end(error instanceof Error ? error.message : 'Server error');
  }
});

server.listen(port, () => {
  console.log(`Dev server running at http://localhost:${port}`);
});

const shutdown = () => {
  watchers.forEach((watcher) => watcher.close());
  liveReloadClients.forEach((client) => client.end());
  server.close();
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
