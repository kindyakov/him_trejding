import IMask from 'imask';
import JustValidate from 'just-validate';
import { submitRequestPrice } from '../api/mock-request';
import { showErrorToast, showSuccessToast } from './toast';

const PHONE_MASK_OPTIONS = {
  mask: '+{7} (000) 000-00-00'
};

const bindFileInput = (fileInput, fileName) => {
  fileInput.addEventListener('change', () => {
    const [selectedFile] = fileInput.files || [];
    fileName.textContent = selectedFile ? selectedFile.name : 'Файл не выбран';
  });
};

const getFieldSelector = (formId, name) => `#${formId} [name="${name}"]`;
const syncFloatingLabelState = (input) => {
  const field = input.closest('.request-form__field');

  if (!field) {
    return;
  }

  field.classList.toggle('is-filled', input.value.trim().length > 0);
};

const syncFloatingLabels = (form) => {
  const inputs = Array.from(form.querySelectorAll('.request-form__field .request-form__input'));
  inputs.forEach(syncFloatingLabelState);
};

const bindFloatingLabels = (form) => {
  const inputs = Array.from(form.querySelectorAll('.request-form__field .request-form__input'));

  inputs.forEach((input) => {
    const sync = () => syncFloatingLabelState(input);

    input.addEventListener('input', sync);
    input.addEventListener('change', sync);
    sync();

    // Browser autofill can populate fields after handlers are attached.
    window.setTimeout(sync, 150);
  });
};

const initPhoneMask = (form) => {
  const phoneInput = form.querySelector('[name="phone"]');

  if (!phoneInput) {
    return null;
  }

  return IMask(phoneInput, PHONE_MASK_OPTIONS);
};

export const initRequestForms = (dialog) => {
  const forms = Array.from(document.querySelectorAll('[data-request-form]'));

  forms.forEach((form, index) => {
    const fileInput = form.querySelector('.request-form__file-input');
    const fileName = form.querySelector('[data-file-name]');
    const submitButton = form.querySelector('.request-form__submit');

    if (!fileInput || !fileName || !submitButton) {
      return;
    }

    if (!form.id) {
      form.id = `request-form-${index + 1}`;
    }

    bindFileInput(fileInput, fileName);
    bindFloatingLabels(form);

    const formId = form.id;
    const phoneMask = initPhoneMask(form);
    const validator = new JustValidate(form, {
      errorFieldCssClass: 'just-validate-error-field',
      errorLabelCssClass: 'just-validate-error-label',
      lockForm: false,
      focusInvalidField: true
    });

    validator
      .addField(getFieldSelector(formId, 'name'), [
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
      .addField(getFieldSelector(formId, 'phone'), [
        {
          rule: 'required',
          errorMessage: 'Введите телефон'
        },
        {
          validator: () => phoneMask?.unmaskedValue.length === 11,
          errorMessage: 'Некорректный номер телефона'
        }
      ])
      .addField(getFieldSelector(formId, 'email'), [
        {
          rule: 'required',
          errorMessage: 'Введите email'
        },
        {
          rule: 'email',
          errorMessage: 'Некорректный email'
        }
      ])
      .addField(getFieldSelector(formId, 'company'), [
        {
          rule: 'minLength',
          value: 10,
          errorMessage: 'Минимум 10 символов'
        }
      ])
      .addField(getFieldSelector(formId, 'message'), [
        {
          rule: 'minLength',
          value: 10,
          errorMessage: 'Минимум 10 символов'
        }
      ])
      .addField(getFieldSelector(formId, 'policy'), [
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
          if (phoneMask) {
            phoneMask.value = '';
          }
          syncFloatingLabels(form);
          fileName.textContent = 'Файл не выбран';
          showSuccessToast('Заявка отправлена. Мы свяжемся с вами в ближайшее время.');

          if (dialog && form.closest('.request-modal')) {
            dialog.hide();
          }
        } catch (error) {
          showErrorToast('Не удалось отправить заявку. Попробуйте ещё раз.');
        } finally {
          form.classList.remove('is-loading');
          submitButton.classList.remove('is-busy');
        }
      });
  });
};
