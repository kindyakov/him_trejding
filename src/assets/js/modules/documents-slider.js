import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';

const createPaginationBullet = (container, index, slider) => {
  const bullet = document.createElement('button');
  bullet.className = 'documents__pagination-bullet';
  bullet.type = 'button';
  bullet.setAttribute('aria-label', `Перейти к документу ${index + 1}`);
  bullet.addEventListener('click', () => {
    const maxIndex = Math.max(slider.slides.length - slider.params.slidesPerView, 0);
    slider.slideTo(Math.min(index, maxIndex));
  });

  container.append(bullet);
  return bullet;
};

export const initDocumentsSlider = () => {
  const sliderElement = document.querySelector('.documents__slider');
  const paginationElement = document.querySelector('.documents__pagination');

  if (!sliderElement || !paginationElement) {
    return null;
  }

  const slider = new Swiper(sliderElement, {
    modules: [Navigation],
    slidesPerView: 'auto',
    slidesPerGroup: 1,
    spaceBetween: 23,
    speed: 600,
    navigation: {
      prevEl: '.documents__nav--prev',
      nextEl: '.documents__nav--next'
    }
  });

  const bullets = Array.from(slider.slides, (_, index) =>
    createPaginationBullet(paginationElement, index, slider)
  );

  const syncPagination = () => {
    const activeIndex = slider.activeIndex;

    bullets.forEach((bullet, index) => {
      bullet.classList.toggle('is-active', index === activeIndex);
    });
  };

  slider.on('init', syncPagination);
  slider.on('slideChange', syncPagination);
  syncPagination();

  return slider;
};
