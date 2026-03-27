export const getWhyChooseModelUrl = (moduleUrl = import.meta.url) =>
  new URL('../../models/Logo-Tech-Trade-for-site.glb', moduleUrl).toString();
