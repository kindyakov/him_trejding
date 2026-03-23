export const initMenu = () => {
  const body = document.body;
  const menu = document.querySelector('#site-menu');
  const openButton = document.querySelector('.header__menu-button');
  const openButtonLabel = openButton?.querySelector('[data-menu-button-label]');
  const openButtonIcon = openButton?.querySelector('use');
  const closeButton = document.querySelector('.site-menu__close');
  const overlay = document.querySelector('[data-menu-overlay]');

  if (
    !body ||
    !menu ||
    !openButton ||
    !openButtonLabel ||
    !openButtonIcon ||
    !closeButton ||
    !overlay
  ) {
    return;
  }

  const setMenuState = (isOpen) => {
    menu.setAttribute('aria-hidden', String(!isOpen));
    openButton.setAttribute('aria-expanded', String(isOpen));
    openButton.setAttribute('aria-label', isOpen ? 'Закрыть меню' : 'Открыть меню');
    openButtonLabel.textContent = isOpen ? 'Close' : 'Menu';
    openButtonIcon.setAttribute('href', isOpen ? '#icon-menu-close' : '#icon-menu');
    overlay.hidden = !isOpen;
    overlay.classList.toggle('is-open', isOpen);
    body.classList.toggle('menu-open', isOpen);

    if (isOpen) {
      closeButton.focus();
      return;
    }

    openButton.focus();
  };

  openButton.addEventListener('click', () => {
    const isOpen = openButton.getAttribute('aria-expanded') === 'true';
    setMenuState(!isOpen);
  });

  closeButton.addEventListener('click', () => {
    setMenuState(false);
  });

  overlay.addEventListener('click', () => {
    setMenuState(false);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && openButton.getAttribute('aria-expanded') === 'true') {
      setMenuState(false);
    }
  });
};
