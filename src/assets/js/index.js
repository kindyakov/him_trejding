import { initMenu } from './modules/menu';
import { initRequestPriceModal } from './modules/modal';
import { initRequestForm } from './modules/request-form';
import { useDynamicAdapt } from './modules/dynamicAdapt';

window.addEventListener('DOMContentLoaded', () => {
  initMenu();

  const dialog = initRequestPriceModal();
  initRequestForm(dialog);

  useDynamicAdapt();
});
