const clampIndex = (index, lastIndex) => Math.min(Math.max(index, 0), lastIndex);

const animateElements = (elements) => {
  const shouldReduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  if (shouldReduceMotion) {
    return;
  }

  elements.forEach((element) => {
    if (!element || typeof element.animate !== 'function') {
      return;
    }

    element.getAnimations?.().forEach((animation) => animation.cancel());
    element.animate(
      [
        { opacity: 0, transform: 'translateY(12px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ],
      {
        duration: 260,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)'
      }
    );
  });
};

export const initHistorySlider = ({ root = document } = {}) => {
  const section = root.querySelector('[data-history]');

  if (!section) {
    return null;
  }

  const triggers = Array.from(section.querySelectorAll('[data-history-trigger]'));
  const currentYearDesktop = section.querySelector('[data-history-current-year-desktop]');
  const currentYearMobile = section.querySelector('[data-history-current-year-mobile]');
  const currentText = section.querySelector('[data-history-current-text]');
  const prevButton = section.querySelector('[data-history-prev]');
  const nextButton = section.querySelector('[data-history-next]');
  const pagination = section.querySelector('[data-history-pagination]');

  if (!triggers.length || !currentYearDesktop || !currentYearMobile || !currentText || !prevButton || !nextButton || !pagination) {
    return null;
  }

  const slides = triggers.map((trigger) => ({
    year: trigger.dataset.historyYear?.trim() || trigger.textContent.trim(),
    text: trigger.dataset.historyText?.trim() || ''
  }));

  const paginationButtons = slides.map((slide, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'history__pagination-button';
    button.setAttribute('aria-label', `Показать этап ${slide.year}`);
    button.setAttribute('aria-pressed', 'false');
    button.addEventListener('click', () => {
      setActiveIndex(index, { animate: true });
    });
    pagination.append(button);
    return button;
  });

  let activeIndex = clampIndex(
    triggers.findIndex((trigger) => trigger.classList.contains('is-active')),
    slides.length - 1
  );

  const syncButtons = () => {
    triggers.forEach((trigger, index) => {
      const isActive = index === activeIndex;
      trigger.classList.toggle('is-active', isActive);
      trigger.setAttribute('aria-pressed', String(isActive));
    });

    paginationButtons.forEach((button, index) => {
      const isActive = index === activeIndex;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });

    prevButton.disabled = activeIndex === 0;
    nextButton.disabled = activeIndex === slides.length - 1;
  };

  const render = ({ animate }) => {
    const slide = slides[activeIndex];
    currentYearDesktop.textContent = slide.year;
    currentYearMobile.textContent = slide.year;
    currentText.textContent = slide.text;
    syncButtons();

    if (animate) {
      animateElements([currentYearDesktop, currentYearMobile, currentText]);
    }
  };

  function setActiveIndex(index, { animate = false } = {}) {
    const nextIndex = clampIndex(index, slides.length - 1);

    if (nextIndex === activeIndex && animate) {
      return;
    }

    activeIndex = nextIndex;
    render({ animate });
  }

  triggers.forEach((trigger, index) => {
    trigger.addEventListener('click', () => {
      setActiveIndex(index, { animate: true });
    });
  });

  prevButton.addEventListener('click', () => {
    setActiveIndex(activeIndex - 1, { animate: true });
  });

  nextButton.addEventListener('click', () => {
    setActiveIndex(activeIndex + 1, { animate: true });
  });

  render({ animate: false });
  return {
    get activeIndex() {
      return activeIndex;
    },
    setActiveIndex
  };
};
