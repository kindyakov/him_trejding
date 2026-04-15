export const submitRequestPrice = (formData) =>
  new Promise((resolve) => {
    window.setTimeout(() => {
      console.log(Array.from(formData))

      resolve({
        ok: true,
        payload: Object.fromEntries(formData.entries())
      });
    }, 2500);
  });
