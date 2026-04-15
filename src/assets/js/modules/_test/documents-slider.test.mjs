import assert from 'node:assert/strict';
import test from 'node:test';

import { createDocumentsSliderOptions } from '../documents-slider.mjs';

test('createDocumentsSliderOptions enables dynamic bullet pagination with six visible slots', () => {
  const paginationElement = {};
  const options = createDocumentsSliderOptions(paginationElement);

  assert.equal(options.pagination.el, paginationElement);
  assert.equal(options.pagination.clickable, true);
  assert.equal(options.pagination.dynamicBullets, true);
  assert.equal(options.pagination.dynamicMainBullets, 2);
  assert.equal('bulletClass' in options.pagination, false);
  assert.equal('bulletActiveClass' in options.pagination, false);
  assert.equal('renderBullet' in options.pagination, false);
});
