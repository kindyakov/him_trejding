export const initHeaderScroll = () => {
  const header = document.querySelector('.header');

  if (!header) return;

  const handleScroll = () => {
    if (window.scrollY > 0) {
      header.classList.add('header--scrolled');
    } else {
      header.classList.remove('header--scrolled');
    }
  };

  handleScroll();

  window.addEventListener('scroll', handleScroll, { passive: true });
};
