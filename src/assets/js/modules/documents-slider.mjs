import Swiper from 'swiper';
import { Navigation, Pagination } from 'swiper/modules';

export const createDocumentsSliderOptions = (paginationElement) => ({
  modules: [Navigation, Pagination],
  slidesPerView: 4,
  spaceBetween: 24,
  speed: 600,
  navigation: {
    prevEl: '.documents__nav--prev',
    nextEl: '.documents__nav--next'
  },
  pagination: {
    el: paginationElement,
    clickable: true,
    dynamicBullets: true,
  },
  breakpoints: {
    300: {
      slidesPerView: 1.1,
      spaceBetween: 16,
    },
    640: {
      slidesPerView: 1.8,
    },
    920: {
      slidesPerView: 3,
    },
    1200: {
      slidesPerView: 3,
    },
    1600: {
      slidesPerView: 3.5,
      spaceBetween: 24,
    },
    1800: {
      slidesPerView: 4,
    }
  }
});

export const initDocumentsSlider = () => {
  const sliderElement = document.querySelector('.documents__slider');
  const paginationElement = document.querySelector('.documents__pagination');

  if (!sliderElement || !paginationElement) {
    return null;
  }

  return new Swiper(sliderElement, createDocumentsSliderOptions(paginationElement));
};
