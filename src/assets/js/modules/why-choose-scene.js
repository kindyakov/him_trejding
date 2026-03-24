import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const modelUrl = '/assets/models/Logo-Tech-Trade-for-site.glb';

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);
const lerp = (start, end, alpha) => start + (end - start) * alpha;

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

  const updateModelPlacement = () => {
    const sectionRect = section.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const modelHeight = modelLayer.offsetHeight;

    if (!modelHeight) {
      return;
    }

    const desiredTop = viewportHeight / 2 - modelHeight / 2 - sectionRect.top;
    const maxTop = Math.max(section.offsetHeight - modelHeight, 0);
    const clampedTop = clamp(desiredTop, 0, maxTop);

    section.style.setProperty('--why-choose-model-offset', `${clampedTop}px`);
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
      updateModelPlacement();
      resizeScene();
    },
    undefined,
    (error) => {
      console.error('Why choose GLB model failed to load:', error);
    }
  );

  const onResize = () => {
    resizeScene();
    updateTargetsFromScroll();
    updateModelPlacement();
  };

  const onScroll = () => {
    updateTargetsFromScroll();
    updateModelPlacement();
  };

  resizeScene();
  updateTargetsFromScroll();
  updateModelPlacement();
  render();

  window.addEventListener('resize', onResize);
  window.addEventListener('scroll', onScroll, { passive: true });

  return {
    destroy() {
      disposed = true;
      window.cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
      renderer.dispose();
    }
  };
};
