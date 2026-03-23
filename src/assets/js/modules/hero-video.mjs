export const restartVideoPlayback = (video) => {
  if (!video) {
    return Promise.resolve();
  }

  video.currentTime = 0;

  const playback = video.play?.();
  return playback instanceof Promise ? playback.catch(() => {}) : Promise.resolve();
};

export const initHeroVideo = () => {
  const video = document.querySelector('.hero__video');

  if (!video) {
    return;
  }

  const ensurePlayback = () => {
    const playback = video.play?.();

    if (playback instanceof Promise) {
      playback.catch(() => {});
    }
  };

  video.addEventListener('loadeddata', ensurePlayback);
  video.addEventListener('ended', () => {
    void restartVideoPlayback(video);
  });

  ensurePlayback();
};
