import A11yDialog from 'a11y-dialog';
import { bindDialogTriggers } from './modal-triggers.mjs';

export const initRequestPriceModal = () => {
  const modalElement = document.querySelector('#request-price-modal');
  const triggers = Array.from(document.querySelectorAll('[data-request-modal-open]'));

  if (!modalElement || triggers.length === 0) {
    return null;
  }

  const dialog = new A11yDialog(modalElement);

  dialog.on('show', () => {
    document.body.classList.add('request-modal-open');
  });

  dialog.on('hide', () => {
    document.body.classList.remove('request-modal-open');
  });

  bindDialogTriggers(triggers, () => {
    dialog.show();
  });

  return dialog;
};
