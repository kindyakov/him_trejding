import assert from 'node:assert/strict';
import test from 'node:test';

import { getWhyChooseModelUrl } from '../why-choose-scene-assets.mjs';

test('getWhyChooseModelUrl resolves the model relative to the module instead of the site root', () => {
  const moduleUrl = 'file:///project/src/assets/js/modules/why-choose-scene-assets.mjs';

  assert.equal(
    getWhyChooseModelUrl(moduleUrl),
    'file:///project/src/assets/models/Logo-Tech-Trade-for-site.glb'
  );
});
