import assert from 'node:assert/strict';
import test from 'node:test';

import { bindDialogTriggers } from '../modal-triggers.mjs';

const createTrigger = () => {
  const listeners = new Map();

  return {
    addEventListener(eventName, handler) {
      listeners.set(eventName, handler);
    },
    click() {
      listeners.get('click')?.();
    }
  };
};

test('bindDialogTriggers wires every trigger to the same open callback', () => {
  const firstTrigger = createTrigger();
  const secondTrigger = createTrigger();
  let opened = 0;

  bindDialogTriggers([firstTrigger, secondTrigger], () => {
    opened += 1;
  });

  firstTrigger.click();
  secondTrigger.click();

  assert.equal(opened, 2);
});
