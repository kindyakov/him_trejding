import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { getWhyChooseModelPinState } from './why-choose-positioning.mjs';

const modelUrl = '/assets/models/Logo-Tech-Trade-for-site.glb';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const lerp = (start, end, alpha) => start + (end - start) * alpha;

const clearModelPinningStyles = (modelLayer) => {
  modelLayer.dataset.pinState = 'start';
  modelLayer.style.removeProperty('top');
  modelLayer.style.removeProperty('right');
  modelLayer.style.removeProperty('bottom');
  modelLayer.style.removeProperty('left');
  modelLayer.style.removeProperty('width');
};

const measureNaturalModelRect = (modelLayer) => {
  const previousState = modelLayer.dataset.pinState;
  const previousTop = modelLayer.style.top;
  const previousRight = modelLayer.style.right;
  const previousBottom = modelLayer.style.bottom;
  const previousLeft = modelLayer.style.left;
  const previousWidth = modelLayer.style.width;

  clearModelPinningStyles(modelLayer);

  const rect = modelLayer.getBoundingClientRect();

  modelLayer.dataset.pinState = previousState;
  modelLayer.style.top = previousTop;
  modelLayer.style.right = previousRight;
  modelLayer.style.bottom = previousBottom;
  modelLayer.style.left = previousLeft;
  modelLayer.style.width = previousWidth;

  return rect;
};

export const initWhyChooseScene = () => {
  const section = document.querySelector('[data-why-choose-scene]');
  const modelLayer = section?.querySelector('.why-choose__model');
  const canvasHost = document.querySelector('[data-why-choose-canvas]');

  if (!section || !modelLayer || !canvasHost) {
    return null;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  camera.position.set(0, 0.05, 9.3);
  let renderer;

  try {
    renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
  } catch (error) {
    console.error('Why choose WebGL renderer initialization failed:', error);
    return null;
  }

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  canvasHost.append(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 2.3);
  const keyLight = new THREE.DirectionalLight(0xffffff, 2.8);
  const fillLight = new THREE.DirectionalLight(0x8cb7ff, 1.6);

  keyLight.position.set(5, 8, 10);
  fillLight.position.set(-6, -2, 8);

  scene.add(ambientLight, keyLight, fillLight);

  let frameId = 0;
  let disposed = false;
  let model = null;
  let currentRotationY = -0.3;
  let currentRotationX = 0.08;
  let targetRotationY = -0.3;
  let targetRotationX = 0.08;
  let pinRafId = 0;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const resizeScene = () => {
    const width = canvasHost.clientWidth;
    const height = canvasHost.clientHeight;

    if (!width || !height) {
      return;
    }

    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height, false);
  };

  const updateTargetsFromScroll = () => {
    const rect = section.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const progress = clamp((viewportHeight - rect.top) / (rect.height + viewportHeight), 0, 1);

    targetRotationY = -0.35 + progress * Math.PI * 1.15;
    targetRotationX = 0.12 - progress * 0.18;
  };

  const applyModelPinning = () => {
    const sectionRect = section.getBoundingClientRect();
    const modelHeight = modelLayer.offsetHeight;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    if (!modelHeight) {
      return;
    }

    const { state, fixedTop } = getWhyChooseModelPinState({
      viewportHeight,
      modelHeight,
      sectionRect: {
        top: sectionRect.top,
        bottom: sectionRect.bottom,
        height: sectionRect.height
      }
    });

    if (state === 'fixed') {
      const modelRect = measureNaturalModelRect(modelLayer);

      modelLayer.dataset.pinState = 'fixed';
      modelLayer.style.top = `${Math.round(fixedTop)}px`;
      modelLayer.style.right = 'auto';
      modelLayer.style.bottom = 'auto';
      modelLayer.style.left = `${Math.round(modelRect.left)}px`;
      modelLayer.style.width = `${Math.round(modelRect.width)}px`;
      return;
    }

    clearModelPinningStyles(modelLayer);
    modelLayer.dataset.pinState = state;

    if (state === 'end') {
      modelLayer.style.top = 'auto';
      modelLayer.style.bottom = '0';
    } else {
      modelLayer.style.top = '0';
    }
  };

  const flushPinning = () => {
    pinRafId = 0;

    if (disposed) {
      return;
    }

    updateTargetsFromScroll();
    applyModelPinning();
  };

  const schedulePinningUpdate = () => {
    if (pinRafId) {
      return;
    }

    pinRafId = window.requestAnimationFrame(flushPinning);
  };

  const render = () => {
    if (disposed) {
      return;
    }

    frameId = window.requestAnimationFrame(render);

    if (model) {
      if (prefersReducedMotion) {
        currentRotationY = targetRotationY;
        currentRotationX = targetRotationX;
      } else {
        currentRotationY = lerp(currentRotationY, targetRotationY, 0.08);
        currentRotationX = lerp(currentRotationX, targetRotationX, 0.08);
      }

      model.rotation.y = currentRotationY;
      model.rotation.x = currentRotationX;
    }

    renderer.render(scene, camera);
  };

  const loader = new GLTFLoader();
  loader.load(
    modelUrl,
    (gltf) => {
      model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      const scale = 5.2 / Math.max(size.x, size.y, size.z || 1);

      model.position.sub(center);
      model.scale.setScalar(scale);
      model.position.y -= size.y * scale * 0.12;
      scene.add(model);

      camera.lookAt(0, 1, 0);

      updateTargetsFromScroll();
      applyModelPinning();
      resizeScene();
    },
    undefined,
    (error) => {
      console.error('Why choose GLB model failed to load:', error);
    }
  );

  const onResize = () => {
    resizeScene();
    schedulePinningUpdate();
  };

  const onScroll = () => {
    schedulePinningUpdate();
  };

  resizeScene();
  flushPinning();
  render();

  window.addEventListener('resize', onResize);
  window.addEventListener('scroll', onScroll, { passive: true });

  return {
    destroy() {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      window.cancelAnimationFrame(pinRafId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
      clearModelPinningStyles(modelLayer);
      renderer.dispose();
    }
  };
};
