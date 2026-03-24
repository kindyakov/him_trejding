import { getActivityTimelineState } from './activity-timeline-logic.mjs';

const applyTimelineState = (line, lineFill, cards) => {
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const lineRect = line.getBoundingClientRect();
  const cardRects = Array.from(cards, (card) => card.getBoundingClientRect());
  const state = getActivityTimelineState({
    viewportHeight,
    lineRect,
    cardRects
  });

  lineFill.style.height = `${state.fillHeight}px`;

  cards.forEach((card, index) => {
    card.classList.toggle('is-revealed', state.revealedCards[index]);
  });
};

export const initActivityTimeline = () => {
  const section = document.querySelector('[data-activity-section]');

  if (!section) {
    return;
  }

  const timeline = section.querySelector('[data-activity-timeline]');
  const line = section.querySelector('.activity__line');
  const lineFill = section.querySelector('[data-activity-line-fill]');
  const cards = section.querySelectorAll('[data-activity-card]');

  if (!timeline || !line || !lineFill || !cards.length) {
    return;
  }

  let frameId = 0;

  const syncProgress = () => {
    frameId = 0;
    applyTimelineState(line, lineFill, cards);
  };

  const onFrameUpdate = () => {
    if (frameId) {
      return;
    }

    frameId = window.requestAnimationFrame(syncProgress);
  };

  syncProgress();

  window.addEventListener('scroll', onFrameUpdate, { passive: true });
  window.addEventListener('resize', onFrameUpdate);
};
