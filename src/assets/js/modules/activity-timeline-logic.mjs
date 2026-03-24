const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getViewportCenter = (viewportHeight) => viewportHeight / 2;

export const getActivityTimelineState = ({ viewportHeight, lineRect, cardRects }) => {
  const lineHeight = Math.max(lineRect.height, 0);
  const viewportCenter = getViewportCenter(viewportHeight);
  const fillHeight = clamp(viewportCenter - lineRect.top, 0, lineHeight);
  const tipViewportY = lineRect.top + fillHeight;

  return {
    fillHeight,
    tipViewportY,
    revealedCards: cardRects.map((cardRect) => tipViewportY >= cardRect.top + cardRect.height / 2)
  };
};
