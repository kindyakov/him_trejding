export const submitRequestPrice = (formData) =>
  new Promise((resolve) => {
    window.setTimeout(() => {
      resolve({
        ok: true,
        payload: Object.fromEntries(formData.entries())
      });
    }, 2500);
  });
