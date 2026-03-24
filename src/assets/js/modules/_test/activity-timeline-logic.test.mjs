import assert from 'node:assert/strict';
import test from 'node:test';

import { getActivityTimelineState } from '../activity-timeline-logic.mjs';

test('keeps the line tip pinned to the viewport center while the timeline crosses it', () => {
  const state = getActivityTimelineState({
    viewportHeight: 800,
    lineRect: {
      top: -200,
      height: 1000
    },
    cardRects: []
  });

  assert.equal(state.fillHeight, 600);
  assert.equal(state.tipViewportY, 400);
});

test('clamps the line tip to the timeline bounds before and after the active range', () => {
  const beforeStart = getActivityTimelineState({
    viewportHeight: 800,
    lineRect: {
      top: 520,
      height: 1000
    },
    cardRects: []
  });

  const afterEnd = getActivityTimelineState({
    viewportHeight: 800,
    lineRect: {
      top: -920,
      height: 1000
    },
    cardRects: []
  });

  assert.equal(beforeStart.fillHeight, 0);
  assert.equal(beforeStart.tipViewportY, 520);
  assert.equal(afterEnd.fillHeight, 1000);
  assert.equal(afterEnd.tipViewportY, 80);
});

test('reveals cards only after the line tip reaches their center and removes reveal when scrolling back', () => {
  const activeScrollState = getActivityTimelineState({
    viewportHeight: 800,
    lineRect: {
      top: -200,
      height: 1000
    },
    cardRects: [
      {
        top: 280,
        height: 80
      },
      {
        top: 430,
        height: 80
      }
    ]
  });

  const rewindState = getActivityTimelineState({
    viewportHeight: 800,
    lineRect: {
      top: -80,
      height: 1000
    },
    cardRects: [
      {
        top: 370,
        height: 80
      }
    ]
  });

  assert.deepEqual(activeScrollState.revealedCards, [true, false]);
  assert.deepEqual(rewindState.revealedCards, [false]);
});
