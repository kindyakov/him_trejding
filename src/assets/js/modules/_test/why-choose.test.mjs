import assert from 'node:assert/strict';
import test from 'node:test';

import { initWhyChoose } from '../why-choose.mjs';

test('does not load the scene module when the section is absent', async () => {
  let imported = false;

  const result = initWhyChoose({
    root: {
      querySelector() {
        return null;
      }
    },
    importSceneModule: async () => {
      imported = true;
      return {};
    }
  });

  assert.equal(result, null);
  assert.equal(imported, false);
});

test('loads and initializes the scene immediately when IntersectionObserver is unavailable', async () => {
  let initialized = 0;

  const start = initWhyChoose({
    root: {
      querySelector(selector) {
        return selector === '[data-why-choose-scene]' ? { id: 'section' } : null;
      }
    },
    observerFactory: null,
    importSceneModule: async () => ({
      initWhyChooseScene() {
        initialized += 1;
      }
    })
  });

  await start;

  assert.equal(initialized, 1);
});

test('swallows scene bootstrap failures so the rest of the page can continue', async () => {
  await assert.doesNotReject(() =>
    initWhyChoose({
      root: {
        querySelector(selector) {
          return selector === '[data-why-choose-scene]' ? { id: 'section' } : null;
        }
      },
      observerFactory: null,
      importSceneModule: async () => {
        throw new Error('WebGL unavailable');
      }
    })
  );
});
