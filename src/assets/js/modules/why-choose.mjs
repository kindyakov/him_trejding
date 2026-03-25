const defaultImportSceneModule = () => import('./why-choose-scene.js');
const PRELOAD_ROOT_MARGIN = '0px 0px 2000px 0px';

const createSceneLoader = (importSceneModule) => {
  let sceneModulePromise = null;
  let started = false;

  return async () => {
    if (started) {
      return;
    }

    started = true;

    try {
      if (!sceneModulePromise) {
        sceneModulePromise = importSceneModule();
      }

      const module = await sceneModulePromise;
      module.initWhyChooseScene?.();
    } catch (error) {
      console.error('Failed to initialize why choose scene:', error);
    }
  };
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

  const loadScene = createSceneLoader(importSceneModule);

  if (!observerFactory) {
    return loadScene();
  }

  const observer = new observerFactory((entries, instance) => {
    if (!entries.some((entry) => entry.isIntersecting)) {
      return;
    }

    instance.disconnect();
    void loadScene();
  }, {
    rootMargin: PRELOAD_ROOT_MARGIN
  });

  observer.observe(section);
  return observer;
};
