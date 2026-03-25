import { initMenu } from './modules/menu';
import { initActivityTimeline } from './modules/activity-timeline';
import { initDocumentsSlider } from './modules/documents-slider';
import { initHeroVideo } from './modules/hero-video.mjs';
import { initHistorySlider } from './modules/history-slider';
import { initRequestPriceModal } from './modules/modal';
import { initContactsMap } from './modules/contacts-map';
import { initRequestForms } from './modules/request-form';
import { initWhyChoose } from './modules/why-choose.mjs';
import { useDynamicAdapt } from './modules/dynamicAdapt';

window.addEventListener('DOMContentLoaded', () => {
  initMenu();
  initHeroVideo();
  initHistorySlider();
  initActivityTimeline();
  initDocumentsSlider();
  initContactsMap();
  initWhyChoose();

  const dialog = initRequestPriceModal();
  initRequestForms(dialog);

  useDynamicAdapt();
});
