import AOS from 'aos';
import { initMenu } from './modules/menu';
import { initHeaderScroll } from './modules/header-scroll';
import { initActivityTimeline } from './modules/activity-timeline';
import { initDocumentsSlider } from './modules/documents-slider';
import { initHeroVideo } from './modules/hero-video.mjs';
import { initHistorySlider } from './modules/history-slider';
import { initRequestPriceModal } from './modules/modal';
import { initContactsMap } from './modules/contacts-map';
import { initRequestForms } from './modules/request-form';
import { initAboutCounters } from './modules/about-counters.mjs';
import { initRevealLines } from './modules/reveal-lines.mjs';
import { initWhyChoose } from './modules/why-choose.mjs';
import { useDynamicAdapt } from './modules/dynamicAdapt';
import { initGeography } from './modules/geography.js';

window.addEventListener('DOMContentLoaded', () => {
  AOS.init({
    duration: 700,
    easing: 'ease-out-cubic',
    once: true,
    offset: 120,
    disable: window.matchMedia('(prefers-reduced-motion: reduce)').matches
  });

  initHeaderScroll();
  initMenu();
  initHeroVideo();
  initHistorySlider();
  initActivityTimeline();
  initDocumentsSlider();
  initContactsMap();
  initWhyChoose();
  initAboutCounters();
  initRevealLines();

  const dialog = initRequestPriceModal();
  initRequestForms(dialog);
  initGeography();

  useDynamicAdapt();
});
