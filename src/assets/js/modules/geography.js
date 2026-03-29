const GEOGRAPHY_DATA = [
  { id: 'ge', code: 'ge', country: 'Грузия', text: 'Грузия представляет собой важное направление с точки зрения снабжения внутреннего рынка и логистического транзита. Потребление нефтепродуктов формируется за счет транспорта, коммерческого сектора и инфраструктуры, а нефтехимическая продукция востребована в промышленном и сервисном сегментах. Дополнительное значение направлению придает роль Грузии как логистического хаба в акватории Черного моря.' },
  { id: 'kg', code: 'kg', country: 'Киргизия', text: 'Текст для Киргизии' },
  { id: 'ru-baltic', code: 'ru', country: 'Балтийские порты РФ', text: 'Балтийское направление является важным каналом для перевалки и экспортной логистики нефтепродуктов и нефтехимической продукции. Оно востребовано для организации поставок в адрес международных рынков, где особое значение имеют гибкость маршрутов, ритмичность отгрузок и эффективность портовой инфраструктуры.', anchor: 'ru-petersburg' },
  { id: 'ru-fareast', code: 'ru', country: 'Дальневосточные порты РФ', text: 'Дальневосточное направление имеет стратегическое значение для организации экспортных поставок в страны Азии. Портовая инфраструктура региона используется для вывоза нефтепродуктов и нефтехимической продукции на быстрорастущие рынки, где особенно важны надежность логистики и доступ к морским маршрутам.', anchor: 'ru-vladivostok' },
  { id: 'cn', code: 'cn', country: 'Китай', text: 'Китай остается одним из крупнейших мировых центров потребления сырья, нефтепродуктов и продукции нефтехимии. Это направление отличается высокой емкостью рынка, развитой промышленной базой и устойчивым спросом со стороны производственных, энергетических и перерабатывающих отраслей.' },
  { id: 'tj', code: 'tj', country: 'Таджикистан', text: 'Для рынка Таджикистана характерен стабильный спрос на нефтепродукты, обеспечивающие транспорт, строительный сектор, промышленность и локальную инфраструктуру. Нефтехимическая продукция востребована в сегментах, связанных с производственными, хозяйственными и техническими нуждами.' },
  { id: 'ua', code: 'ua', country: 'Черноморские порты РФ', text: 'Черноморское направление играет важную роль в экспортной логистике и доступе к широкому кругу зарубежных рынков. Этот маршрут используется для поставок нефтепродуктов и нефтехимической продукции с акцентом на оперативность перевалки, оптимизацию логистики и дальнейшее распределение по внешним направлениям.' },
  { id: 'kz', code: 'kz', country: 'Казахстан', text: 'Казахстан — крупный и диверсифицированный рынок с широким потреблением нефтепродуктов в промышленности, добывающем секторе, транспорте и сельском хозяйстве. Существенный спрос на нефтехимическую продукцию поддерживается производственными предприятиями, переработкой и смежными отраслями.' },
  { id: 'uz', code: 'uz', country: 'Узбекистан', text: 'Узбекистан — один из наиболее емких и динамично развивающихся рынков региона с высоким потреблением нефтепродуктов со стороны промышленности, транспорта, аграрного сектора и инфраструктурных проектов. Одновременно сохраняется стабильный спрос на нефтехимическую продукцию для производственных и перерабатывающих предприятий.' },
  { id: 'mn', code: 'mn', country: 'Монголия', text: 'Рынок Монголии характеризуется стабильной потребностью в нефтепродуктах для транспорта, горнодобывающего сектора, строительства и инфраструктуры. Спрос на нефтехимическую продукцию формируется преимущественно за счет промышленных, технических и сопутствующих хозяйственных нужд.' },
];

export const initGeography = () => {
  const mapCard = document.querySelector('.geography__map-card');
  const mapSvg = document.querySelector('.geography-map');
  const titleEl = document.querySelector('.title-geography-map');
  const textEl = document.querySelector('.text-geography-map');

  if (!mapCard || !mapSvg) return;

  const markersList = [];

  const setActive = (targetId) => {
    const activeItem = GEOGRAPHY_DATA.find(item => item.id === targetId);
    if (!activeItem) return;

    // Обновляем текст и заголовок
    if (titleEl) titleEl.textContent = activeItem.country;
    if (textEl) textEl.textContent = activeItem.text;

    // Сбрасываем все активные классы в SVG
    mapSvg.querySelectorAll('[data-country]').forEach(el => el.classList.remove('active'));
    // Сбрасываем все активные классы у всех маркеров
    markersList.forEach(m => m.classList.remove('active'));

    // Активируем группу страны в SVG
    const group = mapSvg.querySelector(`[data-country="${activeItem.code}"]`);
    if (group) group.classList.add('active');

    // Активируем конкретный маркер
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
      const svgRect = mapSvg.getBoundingClientRect();
      const cardRect = mapCard.getBoundingClientRect();

      const targetElement = anchorSelector ? group.querySelector(`[data-anchor="${anchorSelector}"]`) : group;
      if (!targetElement) return;

      const targetBounds = targetElement.getBBox();
      const scaleX = svgRect.width / mapSvg.viewBox.baseVal.width;
      const scaleY = svgRect.height / mapSvg.viewBox.baseVal.height;

      const left = (svgRect.left - cardRect.left) + (targetBounds.x + targetBounds.width / 2) * scaleX;
      const top = (svgRect.top - cardRect.top) + (targetBounds.y + targetBounds.height / 2) * scaleY;

      marker.style.left = `${left}px`;
      marker.style.top = `${top}px`;
      marker.style.transform = 'translate(-50%, -50%)';
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
  };

  GEOGRAPHY_DATA.forEach((item) => {
    const group = mapSvg.querySelector(`[data-country="${item.code}"]`);
    if (!group) return;

    const markerEl = createMarkerElement(item);
    mapCard.appendChild(markerEl);
    markersList.push(markerEl);
    
    positionMarker(markerEl, group, item.anchor);

    if (!group.dataset.hasClick) {
      group.style.cursor = 'pointer';
      group.addEventListener('click', () => {
        const firstItemWithCode = GEOGRAPHY_DATA.find(d => d.code === item.code);
        if (firstItemWithCode) setActive(firstItemWithCode.id);
      });
      group.dataset.hasClick = 'true';
    }
  });

  // Устанавливаем первый элемент активным по умолчанию
  if (GEOGRAPHY_DATA.length > 0) {
    setActive(GEOGRAPHY_DATA[0].id);
  }
};