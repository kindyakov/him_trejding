import A11yDialog from 'a11y-dialog';

export const initRequestPriceModal = () => {
  const modalElement = document.querySelector('#request-price-modal');
  const trigger = document.querySelector('[data-request-modal-open]');

  if (!modalElement || !trigger) {
    return null;
  }

  const dialog = new A11yDialog(modalElement);

  dialog.on('show', () => {
    document.body.classList.add('request-modal-open');
  });

  dialog.on('hide', () => {
    document.body.classList.remove('request-modal-open');
  });

  trigger.addEventListener('click', () => {
    dialog.show();
  });

  return dialog;
};
