const CONTACTS_MAP_MARKERS = [
  {
    id: 'moscow-office',
    title: 'Представительство в России',
    description: 'Ленинградский проспект, 36, стр. 39, Москва',
    coordinates: [37.5567, 55.7945],
    href: 'https://www.google.com/maps/search/?api=1&query=%D0%9B%D0%B5%D0%BD%D0%B8%D0%BD%D0%B3%D1%80%D0%B0%D0%B4%D1%81%D0%BA%D0%B8%D0%B9+%D0%BF%D1%80%D0%BE%D1%81%D0%BF%D0%B5%D0%BA%D1%82%2C+36+%D1%81%D1%82%D1%80.+39%2C+%D0%9C%D0%BE%D1%81%D0%BA%D0%B2%D0%B0'
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
  tooltip.innerHTML = `<strong>${marker.title}</strong><span>${marker.coordinates[1]}, ${marker.coordinates[0]}</span>`;

  wrapper.innerHTML = `
    <span class="contacts-map__pin" aria-hidden="true">
      <svg viewBox="0 0 40 40" role="presentation">
        <path
          d="M20 4.99805C12.6402 4.99805 6.66797 10.9703 6.66797 18.3301C6.66797 28.3293 20 36.6643 20 36.6643C20 36.6643 33.332 28.3293 33.332 18.3301C33.332 10.9703 27.3598 4.99805 20 4.99805ZM20 23.3301C17.2385 23.3301 15 21.0915 15 18.3301C15 15.5686 17.2385 13.3301 20 13.3301C22.7614 13.3301 25 15.5686 25 18.3301C25 21.0915 22.7614 23.3301 20 23.3301Z"
          fill="currentColor" />
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
  const center = CONTACTS_MAP_MARKERS[0]?.coordinates || [37.5567, 55.7945];

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
          coordinates: marker.coordinates
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
