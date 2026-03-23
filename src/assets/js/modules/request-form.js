import JustValidate from 'just-validate';
import { submitRequestPrice } from '../api/mock-request';
import { showErrorToast, showSuccessToast } from './toast';

export const initRequestForm = (dialog) => {
  const form = document.querySelector('#request-form');
  const fileInput = document.querySelector('#request-file');
  const fileName = document.querySelector('[data-file-name]');
  const submitButton = form?.querySelector('.request-form__submit');

  if (!form || !fileInput || !fileName || !submitButton) {
    return;
  }

  fileInput.addEventListener('change', () => {
    const [selectedFile] = fileInput.files || [];
    fileName.textContent = selectedFile ? selectedFile.name : 'Файл не выбран';
  });

  const validator = new JustValidate(form, {
    errorFieldCssClass: 'just-validate-error-field',
    errorLabelCssClass: 'just-validate-error-label',
    lockForm: false,
    focusInvalidField: true
  });

  validator
    .addField('#request-name', [
      {
        rule: 'required',
        errorMessage: 'Введите имя'
      },
      {
        rule: 'minLength',
        value: 2,
        errorMessage: 'Минимум 2 символа'
      }
    ])
    .addField('#request-phone', [
      {
        rule: 'required',
        errorMessage: 'Введите телефон'
      },
      {
        validator: (value) => /^[+\d\s()-]{10,}$/.test(value.trim()),
        errorMessage: 'Некорректный номер телефона'
      }
    ])
    .addField('#request-email', [
      {
        rule: 'required',
        errorMessage: 'Введите email'
      },
      {
        rule: 'email',
        errorMessage: 'Некорректный email'
      }
    ])
    .addField('#request-company', [
      {
        rule: 'required',
        errorMessage: 'Введите название компании'
      }
    ])
    .addField('#request-message', [
      {
        rule: 'required',
        errorMessage: 'Введите сообщение'
      },
      {
        rule: 'minLength',
        value: 10,
        errorMessage: 'Минимум 10 символов'
      }
    ])
    .addField('#request-policy', [
      {
        rule: 'required',
        errorMessage: 'Нужно согласие на обработку данных'
      }
    ])
    .onSuccess(async (event) => {
      event.preventDefault();

      const formData = new FormData(form);
      form.classList.add('is-loading');
      submitButton.classList.add('is-busy');

      try {
        await submitRequestPrice(formData);
        form.reset();
        fileName.textContent = 'Файл не выбран';
        showSuccessToast('Заявка отправлена. Мы свяжемся с вами в ближайшее время.');
        dialog?.hide();
      } catch (error) {
        showErrorToast('Не удалось отправить заявку. Попробуйте ещё раз.');
      } finally {
        form.classList.remove('is-loading');
        submitButton.classList.remove('is-busy');
      }
    });
};
