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

test('preloads and initializes the scene before the section enters the viewport', async () => {
  const observerInstances = [];
  let initialized = 0;

  class MockIntersectionObserver {
    constructor(callback, options) {
      this.callback = callback;
      this.options = options;
      this.observedTarget = null;
      this.disconnectCalls = 0;
      observerInstances.push(this);
    }

    observe(target) {
      this.observedTarget = target;
    }

    disconnect() {
      this.disconnectCalls += 1;
    }
  }

  const section = { id: 'section' };

  initWhyChoose({
    root: {
      querySelector(selector) {
        return selector === '[data-why-choose-scene]' ? section : null;
      }
    },
    observerFactory: MockIntersectionObserver,
    importSceneModule: async () => ({
      initWhyChooseScene() {
        initialized += 1;
      }
    })
  });

  assert.equal(observerInstances.length, 1);
  assert.equal(observerInstances[0].options.rootMargin, '0px 0px 1400px 0px');
  assert.equal(observerInstances[0].observedTarget, section);

  observerInstances[0].callback([{ isIntersecting: true }], observerInstances[0]);
  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.equal(initialized, 1);
  assert.equal(observerInstances[0].disconnectCalls, 1);
});

test('loads the scene module only once even if the observer fires multiple times', async () => {
  const observerInstances = [];
  let importCalls = 0;
  let initialized = 0;

  class MockIntersectionObserver {
    constructor(callback) {
      this.callback = callback;
      observerInstances.push(this);
    }

    observe() {}

    disconnect() {}
  }

  initWhyChoose({
    root: {
      querySelector(selector) {
        return selector === '[data-why-choose-scene]' ? { id: 'section' } : null;
      }
    },
    observerFactory: MockIntersectionObserver,
    importSceneModule: async () => {
      importCalls += 1;

      return {
        initWhyChooseScene() {
          initialized += 1;
        }
      };
    }
  });

  observerInstances[0].callback([{ isIntersecting: true }], observerInstances[0]);
  observerInstances[0].callback([{ isIntersecting: true }], observerInstances[0]);
  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.equal(importCalls, 1);
  assert.equal(initialized, 1);
});
