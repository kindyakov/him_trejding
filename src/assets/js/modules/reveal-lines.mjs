const REVEAL_SELECTOR = '.js-reveal-lines';
const READY_CLASS = 'is-reveal-lines-ready';
const VISIBLE_CLASS = 'is-reveal-lines-visible';
const STAGGER_STEP_MS = 180;
const LINE_TOP_TOLERANCE_PX = 4;

export const getStaggerDelay = (index) => `${index * STAGGER_STEP_MS}ms`;

export const normalizeTextSegments = (text) => text
  .split(/\n+/)
  .map((segment) => segment.replace(/\s+/g, ' ').trim())
  .filter(Boolean);

export const collectLineGroups = (nodes) => {
  const lines = [];
  let currentTop = null;
  let currentLine = [];

  nodes.forEach((node) => {
    const nextTop = Math.round(node.getBoundingClientRect().top);
    const text = node.textContent?.replace(/\s+/g, ' ').trim();

    if (!text) {
      return;
    }

    if (currentTop === null || Math.abs(nextTop - currentTop) <= LINE_TOP_TOLERANCE_PX) {
      currentTop = nextTop;
      currentLine.push(text);
      return;
    }

    lines.push(currentLine.join(' ').replace(/\s+/g, ' ').trim());
    currentTop = nextTop;
    currentLine = [text];
  });

  if (currentLine.length) {
    lines.push(currentLine.join(' ').replace(/\s+/g, ' ').trim());
  }

  return lines;
};

const extractSourceText = (element) => {
  const chunks = [];

  const walk = (node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      chunks.push(node.textContent ?? '');
      return;
    }

    if (node.nodeType !== Node.ELEMENT_NODE) {
      return;
    }

    if (node.tagName === 'BR') {
      chunks.push('\n');
      return;
    }

    node.childNodes.forEach(walk);
  };

  element.childNodes.forEach(walk);

  return chunks.join('').replace(/\u00a0/g, ' ');
};

const createMeasureLayer = (segments) => {
  const measure = document.createElement('span');
  const tokenGroups = [];

  measure.className = 'reveal-lines__measure';

  segments.forEach((segment) => {
    const row = document.createElement('span');
    const tokens = segment.match(/\S+/g) ?? [];
    const rowTokens = [];

    row.className = 'reveal-lines__segment';

    tokens.forEach((token, tokenIndex) => {
      const tokenNode = document.createElement('span');
      tokenNode.className = 'reveal-lines__token';
      tokenNode.textContent = tokenIndex === tokens.length - 1 ? token : `${token} `;
      row.append(tokenNode);
      rowTokens.push(tokenNode);
    });

    if (!rowTokens.length) {
      const tokenNode = document.createElement('span');
      tokenNode.className = 'reveal-lines__token';
      tokenNode.textContent = segment;
      row.append(tokenNode);
      rowTokens.push(tokenNode);
    }

    measure.append(row);
    tokenGroups.push(rowTokens);
  });

  return { measure, tokenGroups };
};

const buildLineNodes = (lines) => {
  const fragment = document.createDocumentFragment();

  lines.forEach((line, index) => {
    const mask = document.createElement('span');
    const inner = document.createElement('span');

    mask.className = 'reveal-lines__line';
    mask.style.setProperty('--reveal-line-delay', getStaggerDelay(index));

    inner.className = 'reveal-lines__line-inner';
    inner.textContent = line;

    mask.append(inner);
    fragment.append(mask);
  });

  return fragment;
};

const prepareHeading = (heading) => {
  if (!heading.dataset.revealLinesSource) {
    heading.dataset.revealLinesSource = extractSourceText(heading);
  }

  const width = Math.round(heading.getBoundingClientRect().width);

  if (!width || heading.dataset.revealLinesWidth === String(width)) {
    return;
  }

  const segments = normalizeTextSegments(heading.dataset.revealLinesSource);

  if (!segments.length) {
    return;
  }

  const { measure, tokenGroups } = createMeasureLayer(segments);
  const lines = [];
  const previousInlineWidth = heading.style.width;

  heading.style.width = `${width}px`;
  heading.textContent = '';
  heading.append(measure);

  tokenGroups.forEach((group) => {
    lines.push(...collectLineGroups(group));
  });

  heading.textContent = '';
  heading.append(buildLineNodes(lines));
  heading.style.width = previousInlineWidth;
  heading.classList.add(READY_CLASS);
  heading.dataset.revealLinesWidth = String(width);
};

export const initRevealLines = () => {
  const headings = Array.from(document.querySelectorAll(REVEAL_SELECTOR));

  if (!headings.length) {
    return;
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    headings.forEach((heading) => heading.classList.add(VISIBLE_CLASS));
    return;
  }

  const rebuild = () => {
    headings.forEach(prepareHeading);
  };

  rebuild();

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add(VISIBLE_CLASS);
        observer.unobserve(entry.target);
      });
    }, {
      threshold: 0.2,
      rootMargin: '0px 0px -10% 0px'
    });

    headings.forEach((heading) => observer.observe(heading));
  } else {
    headings.forEach((heading) => heading.classList.add(VISIBLE_CLASS));
  }

  let resizeFrame = 0;

  window.addEventListener('resize', () => {
    window.cancelAnimationFrame(resizeFrame);
    resizeFrame = window.requestAnimationFrame(rebuild);
  });

  document.fonts?.ready?.then(rebuild).catch(() => {});
};
