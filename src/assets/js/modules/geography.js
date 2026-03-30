import Accordion from 'accordion-js';

export const initGeography = () => {
  const mapCard = document.querySelector('.geography__map-card');
  const mapSvg = document.querySelector('.geography-map');
  const sidebarCopy = document.querySelector('.geography__sidebar-copy');
  const sidebarCopyInner = document.querySelector('.geography__sidebar-copy-inner');
  const titleEl = document.querySelector('.title-geography-map');
  const textEl = document.querySelector('.text-geography-map');
  const accordionContainer = document.getElementById('geography-accordion');
  const datasetRoot = document.querySelector('.geography__dataset');

  if (!mapCard || !mapSvg || !accordionContainer || !datasetRoot) return;

  const markersList = [];
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const CONTENT_EXIT_DURATION = 180;
  const CONTENT_SETTLE_DURATION = 320;
  let contentExitTimer = null;
  let contentSettleTimer = null;
  let hasRenderedInitialContent = false;
  const geographyData = Array.from(datasetRoot.querySelectorAll('.geography__item-data'))
    .map((itemEl) => {
      const id = itemEl.dataset.id?.trim();
      const code = itemEl.dataset.code?.trim();
      const country = itemEl.querySelector('.geography__item-title')?.textContent?.trim();
      const textHtml = itemEl.querySelector('.geography__item-text')?.innerHTML?.trim();

      if (!id || !code || !country || !textHtml) {
        return null;
      }

      return {
        id,
        code,
        country,
        textHtml,
        anchor: itemEl.dataset.anchor?.trim() || '',
      };
    })
    .filter(Boolean);

  if (geographyData.length === 0) return;

  const applySidebarContent = (item) => {
    if (titleEl) titleEl.textContent = item.country;
    if (textEl) textEl.innerHTML = item.textHtml;
  };

  const resetSidebarAnimationState = () => {
    if (contentExitTimer) {
      window.clearTimeout(contentExitTimer);
      contentExitTimer = null;
    }

    if (contentSettleTimer) {
      window.clearTimeout(contentSettleTimer);
      contentSettleTimer = null;
    }

    if (sidebarCopyInner) {
      sidebarCopyInner.classList.remove('is-leaving', 'is-entering');
    }

    if (sidebarCopy) {
      sidebarCopy.style.height = '';
    }
  };

  const animateSidebarContent = (item) => {
    if (!titleEl || !textEl || !sidebarCopy || !sidebarCopyInner || prefersReducedMotion.matches) {
      resetSidebarAnimationState();
      applySidebarContent(item);
      return;
    }

    if (
      hasRenderedInitialContent &&
      titleEl.textContent === item.country &&
      textEl.textContent === item.text
    ) {
      return;
    }

    if (!hasRenderedInitialContent) {
      applySidebarContent(item);
      hasRenderedInitialContent = true;
      return;
    }

    resetSidebarAnimationState();

    sidebarCopy.style.height = `${sidebarCopy.offsetHeight}px`;
    sidebarCopy.offsetHeight;
    sidebarCopyInner.classList.add('is-leaving');

    contentExitTimer = window.setTimeout(() => {
      applySidebarContent(item);
      sidebarCopy.style.height = `${sidebarCopyInner.offsetHeight}px`;
      sidebarCopyInner.classList.remove('is-leaving');
      sidebarCopyInner.classList.add('is-entering');

      requestAnimationFrame(() => {
        sidebarCopyInner.classList.remove('is-entering');
      });

      contentSettleTimer = window.setTimeout(() => {
        sidebarCopy.style.height = '';
        contentSettleTimer = null;
      }, CONTENT_SETTLE_DURATION);

      contentExitTimer = null;
    }, CONTENT_EXIT_DURATION);
  };

  // Logic for Map
  const setActive = (targetId) => {
    const activeItem = geographyData.find(item => item.id === targetId);
    if (!activeItem) return;

    animateSidebarContent(activeItem);

    mapSvg.querySelectorAll('[data-country]').forEach(el => el.classList.remove('active'));
    markersList.forEach(m => m.classList.remove('active'));

    const group = mapSvg.querySelector(`[data-country="${activeItem.code}"]`);
    if (group) group.classList.add('active');

    const activeMarker = markersList.find(m => m.getAttribute('data-marker-id') === targetId);
    if (activeMarker) activeMarker.classList.add('active');
  };

  const createMarkerElement = (item) => {
    const marker = document.createElement('div');
    marker.className = 'geography__marker';
    marker.setAttribute('data-country-code', item.code);
    marker.setAttribute('data-marker-id', item.id);

    marker.addEventListener('click', (e) => {
      e.stopPropagation();
      setActive(item.id);
    });

    return marker;
  };

  const positionMarker = (marker, group, anchorSelector) => {
    const updatePosition = () => {
      if (window.innerWidth <= 1200) return; // Don't position if hidden

      const cardRect = mapCard.getBoundingClientRect();
      const targetElement = anchorSelector ? group.querySelector(`[data-anchor="${anchorSelector}"]`) : group;
      if (!targetElement) return;

      const targetBounds = targetElement.getBBox();
      const matrix = targetElement.getScreenCTM?.();
      let left;
      let top;

      if (matrix) {
        const screenPoint = new DOMPoint(
          targetBounds.x + targetBounds.width / 2,
          targetBounds.y + targetBounds.height / 2,
        ).matrixTransform(matrix);

        left = screenPoint.x - cardRect.left;
        top = screenPoint.y - cardRect.top;
      } else {
        const targetRect = targetElement.getBoundingClientRect();
        left = targetRect.left - cardRect.left + targetRect.width / 2;
        top = targetRect.top - cardRect.top + targetRect.height / 2;
      }

      marker.style.left = `${left}px`;
      marker.style.top = `${top}px`;
      marker.style.transform = 'translate(-50%, -50%)';
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
  };

  // Logic for Accordion
  const renderAccordion = () => {
    accordionContainer.innerHTML = geographyData.map(item => `
      <div class="ac">
        <h2 class="ac-header">
          <button type="button" class="ac-trigger">${item.country}</button>
        </h2>
        <div class="ac-panel">
          <div class="ac-text">${item.textHtml}</div>
        </div>
      </div>
    `).join('');

    new Accordion('#geography-accordion', {
      duration: 400,
      showMultiple: false,
      onOpen: (currentElement) => {
        // Option to sync with map if needed, but they are hidden anyway
      }
    });
  };

  // Init Map elements
  geographyData.forEach((item) => {
    const group = mapSvg.querySelector(`[data-country="${item.code}"]`);
    if (!group) return;

    const markerEl = createMarkerElement(item);
    mapCard.appendChild(markerEl);
    markersList.push(markerEl);
    
    positionMarker(markerEl, group, item.anchor);

    if (!group.dataset.hasClick) {
      group.style.cursor = 'pointer';
      group.addEventListener('click', () => {
        const firstItemWithCode = geographyData.find(d => d.code === item.code);
        if (firstItemWithCode) setActive(firstItemWithCode.id);
      });
      group.dataset.hasClick = 'true';
    }
  });

  renderAccordion();

  setActive(geographyData[0].id);
};
