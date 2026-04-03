const YANDEX_MAPS_SCRIPT_ID = 'yandex-maps-js';

const parseJsonIfNeeded = (value) => {
  if (typeof value !== 'string') {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const getWpData = () => {
  const candidates = [window.wpData, window['wp-data'], window.wp_data];

  for (const candidate of candidates) {
    const parsedCandidate = parseJsonIfNeeded(candidate);

    if (parsedCandidate && typeof parsedCandidate === 'object' && !Array.isArray(parsedCandidate)) {
      return parsedCandidate;
    }
  }

  return null;
};

const isMarker = (marker) =>
  marker &&
  typeof marker === 'object' &&
  typeof marker.title === 'string' &&
  typeof marker.description === 'string' &&
  typeof marker.href === 'string' &&
  Number.isFinite(Number(marker.lat)) &&
  Number.isFinite(Number(marker.lng));

const normalizeMarker = (marker) => ({
  id: typeof marker.id === 'string' && marker.id ? marker.id : `marker-${String(marker.lat)}-${String(marker.lng)}`,
  title: marker.title,
  description: marker.description,
  lat: Number(marker.lat),
  lng: Number(marker.lng),
  href: marker.href
});

const getContactsMapMarkers = () => {
  const markers = parseJsonIfNeeded(getWpData()?.CONTACTS_MAP_MARKERS);

  if (!Array.isArray(markers)) {
    if (markers && typeof markers === 'object') {
      return Object.values(markers).filter(isMarker).map(normalizeMarker);
    }

    return [];
  }

  return markers.filter(isMarker).map(normalizeMarker);
};

const getMetaContent = (name) =>
  document.querySelector(`meta[name="${name}"]`)?.getAttribute('content')?.trim() || '';

const renderFallback = (container, message) => {
  container.innerHTML = `
    <div class="contacts-map__fallback">
      <p class="contacts-map__fallback-text">${message}</p>
    </div>
  `;
};

const toYandexCoordinates = (marker) => [marker.lng, marker.lat];

const loadYandexMapsApi = (apiKey) =>
  new Promise((resolve, reject) => {
    if (window.ymaps3?.ready) {
      resolve(window.ymaps3);
      return;
    }

    const existingScript = document.getElementById(YANDEX_MAPS_SCRIPT_ID);

    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(window.ymaps3), { once: true });
      existingScript.addEventListener('error', () => reject(new Error('Yandex Maps script failed to load.')), {
        once: true
      });
      return;
    }

    const script = document.createElement('script');

    script.id = YANDEX_MAPS_SCRIPT_ID;
    script.src =
      `https://api-maps.yandex.ru/v3/?apikey=${encodeURIComponent(apiKey)}&lang=ru_RU`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve(window.ymaps3);
    script.onerror = () => reject(new Error('Yandex Maps script failed to load.'));

    document.head.append(script);
  });

const createMarkerContent = (marker) => {
  const wrapper = document.createElement('a');

  wrapper.className = 'contacts-map__marker-button';
  wrapper.href = marker.href;
  wrapper.target = '_blank';
  wrapper.rel = 'noreferrer';
  wrapper.setAttribute('aria-label', `${marker.title}: ${marker.description}`);

  const tooltip = document.createElement('span');
  tooltip.className = 'contacts-map__tooltip';
  const tooltipTitle = document.createElement('strong');
  tooltipTitle.textContent = marker.title;

  const tooltipCoordinates = document.createElement('span');
  tooltipCoordinates.textContent = `${marker.lat}, ${marker.lng}`;

  wrapper.innerHTML = `
    <span class="contacts-map__pin" aria-hidden="true">
      <svg width="27" height="32" aria-hidden="true">
        <use href="#icon-marker"></use>
      </svg>
    </span>
  `;
  tooltip.append(tooltipTitle, tooltipCoordinates);
  wrapper.append(tooltip);

  return wrapper;
};

const initYandexMap = async (container) => {
  const apiKey = getMetaContent('yandex-maps-api-key');

  if (!apiKey) {
    renderFallback(
      container,
      'Добавьте Yandex Maps API key в meta[name="yandex-maps-api-key"], чтобы отрисовать карту и маркеры.'
    );
    return;
  }

  const ymaps3 = await loadYandexMapsApi(apiKey);
  await ymaps3.ready;

  const {
    YMap,
    YMapDefaultSchemeLayer,
    YMapDefaultFeaturesLayer,
    YMapMarker
  } = ymaps3;
  const markers = getContactsMapMarkers();
  const center = markers[0] ? toYandexCoordinates(markers[0]) : [37.5567, 55.7945];

  const map = new YMap(container, {
    location: {
      center,
      zoom: 10
    }
  });

  map.addChild(new YMapDefaultSchemeLayer());
  map.addChild(new YMapDefaultFeaturesLayer());

  markers.forEach((marker) => {
    map.addChild(
      new YMapMarker(
        {
          coordinates: toYandexCoordinates(marker)
        },
        createMarkerContent(marker)
      )
    );
  });
};

export const initContactsMap = async () => {
  const mapContainer = document.querySelector('[data-contacts-map]');

  if (!mapContainer) {
    return;
  }

  try {
    await initYandexMap(mapContainer);
  } catch (error) {
    renderFallback(
      mapContainer,
      error instanceof Error ? error.message : 'Не удалось загрузить Yandex Maps.'
    );
  }
};

export { getContactsMapMarkers };
