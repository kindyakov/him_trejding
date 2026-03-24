const defaultImportSceneModule = () => import('./why-choose-scene.js');

const startWhyChooseScene = async ({ importSceneModule }) => {
  try {
    const module = await importSceneModule();
    module.initWhyChooseScene?.();
  } catch (error) {
    console.error('Failed to initialize why choose scene:', error);
  }
};

export const initWhyChoose = ({
  root = document,
  observerFactory = typeof IntersectionObserver === 'function' ? IntersectionObserver : null,
  importSceneModule = defaultImportSceneModule
} = {}) => {
  const section = root.querySelector('[data-why-choose-scene]');

  if (!section) {
    return null;
  }

  if (!observerFactory) {
    return startWhyChooseScene({ importSceneModule });
  }

  const observer = new observerFactory((entries, instance) => {
    if (!entries.some((entry) => entry.isIntersecting)) {
      return;
    }

    instance.disconnect();
    void startWhyChooseScene({ importSceneModule });
  });

  observer.observe(section);
  return observer;
};
