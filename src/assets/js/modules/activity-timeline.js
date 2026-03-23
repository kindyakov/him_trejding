const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const updateTimelineProgress = (section, timeline, lineFill) => {
  const sectionRect = section.getBoundingClientRect();
  const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
  const timelineRect = timeline.getBoundingClientRect();

  const start = viewportHeight * 0.78;
  const end = sectionRect.height + timelineRect.height * 0.32;
  const rawProgress = (start - sectionRect.top) / end;
  const progress = clamp(rawProgress, 0, 1);

  lineFill.style.height = `${timelineRect.height * progress}px`;
};

export const initActivityTimeline = () => {
  const section = document.querySelector('[data-activity-section]');

  if (!section) {
    return;
  }

  const timeline = section.querySelector('[data-activity-timeline]');
  const lineFill = section.querySelector('[data-activity-line-fill]');
  const cards = section.querySelectorAll('[data-activity-card]');

  if (!timeline || !lineFill || !cards.length) {
    return;
  }

  const syncProgress = () => updateTimelineProgress(section, timeline, lineFill);
  const onFrameUpdate = () => window.requestAnimationFrame(syncProgress);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-revealed');
        }
      });
    },
    {
      rootMargin: '0px 0px -12% 0px',
      threshold: 0.2,
    }
  );

  cards.forEach((card) => observer.observe(card));

  syncProgress();

  window.addEventListener('scroll', onFrameUpdate, { passive: true });
  window.addEventListener('resize', onFrameUpdate);
};
