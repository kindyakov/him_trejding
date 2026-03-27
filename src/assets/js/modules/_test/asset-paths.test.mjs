import assert from 'node:assert/strict';
import test from 'node:test';

import { getAssetPath, getBasePath } from '../asset-paths.mjs';

test('getBasePath falls back to the site root when the meta tag is absent', () => {
  const root = {
    querySelector() {
      return null;
    }
  };

  assert.equal(getBasePath(root), '/');
});

test('getBasePath normalizes the meta base path value', () => {
  const root = {
    querySelector(selector) {
      return selector === 'meta[name="app-base-path"]'
        ? { content: 'him_trejding' }
        : null;
    }
  };

  assert.equal(getBasePath(root), '/him_trejding/');
});

test('getAssetPath prefixes asset paths with the configured base path', () => {
  const root = {
    querySelector(selector) {
      return selector === 'meta[name="app-base-path"]'
        ? { content: '/him_trejding/' }
        : null;
    }
  };

  assert.equal(
    getAssetPath('/assets/models/Logo-Tech-Trade-for-site.glb', root),
    '/him_trejding/assets/models/Logo-Tech-Trade-for-site.glb'
  );
});
