import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawn } from 'node:child_process';

const projectRoot = process.cwd();
const devDir = resolve(projectRoot, '.dev');
const cssDir = resolve(devDir, 'css');
const jsDir = resolve(devDir, 'js');
const parcelCliPath = resolve(projectRoot, 'node_modules/parcel/lib/cli.js');

mkdirSync(cssDir, { recursive: true });
mkdirSync(jsDir, { recursive: true });

let isShuttingDown = false;

const createChild = (label, args) => {
  const child = spawn(process.execPath, args, {
    cwd: projectRoot,
    stdio: 'inherit'
  });

  child.on('error', (error) => {
    console.error(`${label} failed:`, error.message);
    shutdown(1);
  });

  child.on('exit', (code) => {
    if (isShuttingDown) {
      return;
    }

    if (code !== 0 && code !== null) {
      console.error(`${label} exited with code ${code}`);
      shutdown(code);
    }
  });

  return child;
};

const processes = [
  createChild('Parcel CSS watcher', [
    parcelCliPath,
    'watch',
    'src/assets/css/index.css',
    '--dist-dir',
    '.dev/css',
    '--public-url',
    '/css',
    '--no-source-maps',
    '--no-content-hash',
    '--no-hmr'
  ]),
  createChild('Parcel JS watcher', [
    parcelCliPath,
    'watch',
    'src/assets/js/index.js',
    '--dist-dir',
    '.dev/js',
    '--public-url',
    '/js',
    '--no-source-maps',
    '--no-content-hash',
    '--no-hmr'
  ]),
  createChild('Dev server', ['scripts/dev-server.mjs'])
];

function shutdown(exitCode = 0) {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  processes.forEach((child) => {
    if (!child.killed) {
      child.kill('SIGTERM');
    }
  });

  setTimeout(() => {
    processes.forEach((child) => {
      if (!child.killed) {
        child.kill('SIGKILL');
      }
    });

    process.exit(exitCode);
  }, 150);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));
