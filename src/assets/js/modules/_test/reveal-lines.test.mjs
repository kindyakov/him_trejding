import assert from 'node:assert/strict';
import test from 'node:test';

import { createRevealLineModels } from '../reveal-lines.mjs';

test('createRevealLineModels builds line, word, and character groups', () => {
  const models = createRevealLineModels([
    'Hello world',
    'AB'
  ]);

  assert.equal(models.length, 2);

  assert.equal(models[0].words.length, 2);
  assert.equal(models[0].words[0].text, 'Hello');
  assert.deepEqual(models[0].words[0].chars.map(({ text }) => text), ['H', 'e', 'l', 'l', 'o']);
  assert.deepEqual(models[0].words[1].chars.map(({ text }) => text), ['w', 'o', 'r', 'l', 'd']);

  assert.equal(models[0].lineDelay, '0ms');
  assert.equal(models[1].lineDelay, '180ms');
  assert.deepEqual(models[1].words[0].chars.map(({ text }) => text), ['A', 'B']);
});
