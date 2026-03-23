import assert from 'node:assert/strict';
import test from 'node:test';

import { restartVideoPlayback } from './hero-video.mjs';

test('restartVideoPlayback resets time and starts playback again', async () => {
  let played = 0;

  const video = {
    currentTime: 12.4,
    play() {
      played += 1;
      return Promise.resolve();
    }
  };

  await restartVideoPlayback(video);

  assert.equal(video.currentTime, 0);
  assert.equal(played, 1);
});

test('restartVideoPlayback tolerates rejected play promise', async () => {
  const video = {
    currentTime: 7,
    play() {
      return Promise.reject(new Error('autoplay blocked'));
    }
  };

  await assert.doesNotReject(() => restartVideoPlayback(video));
  assert.equal(video.currentTime, 0);
});
