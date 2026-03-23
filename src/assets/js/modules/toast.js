import { Notyf } from 'notyf';

let notifier;

const getNotifier = () => {
  if (!notifier) {
    notifier = new Notyf({
      duration: 3500,
      position: {
        x: 'right',
        y: 'top'
      },
      types: [
        {
          type: 'success',
          background: '#274aa5',
          dismissible: true
        },
        {
          type: 'error',
          background: '#b81111',
          dismissible: true
        }
      ]
    });
  }

  return notifier;
};

export const showSuccessToast = (message) => {
  getNotifier().success(message);
};

export const showErrorToast = (message) => {
  getNotifier().error(message);
};
