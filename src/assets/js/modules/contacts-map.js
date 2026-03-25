const CONTACTS_MAP_MARKERS = [
  {
    id: 'moscow-office',
    title: 'Представительство в России',
    description: 'Ленинградский проспект, 36, стр. 39, Москва',
    lat: 55.790236,
    lng: 37.567231,
    href: 'https://yandex.ru/maps/?text=%D0%9B%D0%B5%D0%BD%D0%B8%D0%BD%D0%B3%D1%80%D0%B0%D0%B4%D1%81%D0%BA%D0%B8%D0%B9%20%D0%BF%D1%80%D0%BE%D1%81%D0%BF%D0%B5%D0%BA%D1%82%2C%2036%20%D1%81%D1%82%D1%80.%2039%2C%20%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0'
  }
];

const YANDEX_MAPS_SCRIPT_ID = 'yandex-maps-js';

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
  tooltip.innerHTML = `<strong>${marker.title}</strong><span>${marker.lat}, ${marker.lng}</span>`;

  wrapper.innerHTML = `
    <span class="contacts-map__pin" aria-hidden="true">
      <svg width="27" height="32" aria-hidden="true">
        <use href="#icon-marker"></use>
      </svg>
    </span>
  `;
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
  const center = CONTACTS_MAP_MARKERS[0] ? toYandexCoordinates(CONTACTS_MAP_MARKERS[0]) : [37.5567, 55.7945];

  const map = new YMap(container, {
    location: {
      center,
      zoom: 10
    }
  });

  map.addChild(new YMapDefaultSchemeLayer());
  map.addChild(new YMapDefaultFeaturesLayer());

  CONTACTS_MAP_MARKERS.forEach((marker) => {
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

export { CONTACTS_MAP_MARKERS };
