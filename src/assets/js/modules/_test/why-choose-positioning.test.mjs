import assert from 'node:assert/strict';
import test from 'node:test';

import { getWhyChooseModelPinState } from '../why-choose-positioning.mjs';

test('keeps the model at the start of the section before the centered pin range begins', () => {
  const state = getWhyChooseModelPinState({
    viewportHeight: 900,
    modelHeight: 300,
    sectionRect: {
      top: 400,
      bottom: 1600,
      height: 1200
    }
  });

  assert.deepEqual(state, {
    state: 'start',
    fixedTop: 300
  });
});

test('pins the model to the viewport center while the section spans the active range', () => {
  const state = getWhyChooseModelPinState({
    viewportHeight: 900,
    modelHeight: 300,
    sectionRect: {
      top: 200,
      bottom: 1400,
      height: 1200
    }
  });

  assert.deepEqual(state, {
    state: 'fixed',
    fixedTop: 300
  });
});

test('locks the model to the section bottom after the model reaches the parent end', () => {
  const state = getWhyChooseModelPinState({
    viewportHeight: 900,
    modelHeight: 300,
    sectionRect: {
      top: -700,
      bottom: 500,
      height: 1200
    }
  });

  assert.deepEqual(state, {
    state: 'end',
    fixedTop: 300
  });
});

test('returns from end to fixed when scrolling back upward through the active range', () => {
  const state = getWhyChooseModelPinState({
    viewportHeight: 900,
    modelHeight: 300,
    sectionRect: {
      top: -500,
      bottom: 700,
      height: 1200
    }
  });

  assert.deepEqual(state, {
    state: 'fixed',
    fixedTop: 300
  });
});
