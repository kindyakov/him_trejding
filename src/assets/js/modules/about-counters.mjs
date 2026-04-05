const COUNTER_SELECTOR = '[data-about-counter]';
const SECTION_SELECTOR = '.about';
const DURATION_MS = 2000;

const easeOutCubic = (progress) => 1 - (1 - progress) ** 3;

const getDecimalPlaces = (rawValue) => {
  const normalized = String(rawValue ?? '').trim().replace(',', '.');
  const [, fraction = ''] = normalized.split('.');

  return fraction.length;
};

const getCounterConfig = (element) => {
  const rawValue = element.dataset.counterValue ?? element.textContent ?? '0';
  const value = Number.parseFloat(rawValue);
  const decimals = getDecimalPlaces(rawValue);
  const suffix = element.dataset.counterSuffix ?? '';

  return {
    decimals,
    suffix,
    value: Number.isFinite(value) ? value : 0
  };
};

const formatValue = (value, decimals) => {
  const rounded = value.toFixed(decimals);

  return decimals > 0 ? rounded.replace('.', ',') : rounded;
};

const animateCounter = (element) => {
  const { decimals, suffix, value } = getCounterConfig(element);
  const start = performance.now();

  const tick = (now) => {
    const progress = Math.min((now - start) / DURATION_MS, 1);
    const currentValue = value * easeOutCubic(progress);

    element.textContent = `${formatValue(currentValue, decimals)}${suffix}`;

    if (progress < 1) {
      window.requestAnimationFrame(tick);
      return;
    }

    element.textContent = `${formatValue(value, decimals)}${suffix}`;
  };

  window.requestAnimationFrame(tick);
};

export const initAboutCounters = () => {
  const section = document.querySelector(SECTION_SELECTOR);
  const counters = section ? Array.from(section.querySelectorAll(COUNTER_SELECTOR)) : [];

  if (!counters.length) {
    return;
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    counters.forEach((element) => {
      const { decimals, suffix, value } = getCounterConfig(element);
      element.textContent = `${formatValue(value, decimals)}${suffix}`;
    });
    return;
  }

  const run = () => {
    counters.forEach((element) => {
      if (element.dataset.aboutCounterAnimated === 'true') {
        return;
      }

      element.dataset.aboutCounterAnimated = 'true';
      animateCounter(element);
    });
  };

  if (!('IntersectionObserver' in window)) {
    run();
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) {
        return;
      }

      run();
      observer.disconnect();
    });
  }, {
    threshold: 0.25,
    rootMargin: '0px 0px -10% 0px'
  });

  observer.observe(section);
};
