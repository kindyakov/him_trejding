# Why Choose Model Pinning Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace scroll-driven CSS offset updates for the why-choose 3D model with a discrete pinned layout that switches cleanly between start, fixed-center, and end states.

**Architecture:** Extract the pinning math into a pure module with deterministic state calculation so the DOM layer only applies `start`, `fixed`, or `end`. Keep scroll work lightweight by batching DOM reads and writes through a single `requestAnimationFrame` update and preserving the model's width and horizontal position while fixed.

**Tech Stack:** Vanilla JavaScript modules, Node `node:test`, existing Parcel build.

---

### Task 1: Add regression coverage for pinning state math

**Files:**
- Create: `src/assets/js/modules/why-choose-positioning.mjs`
- Create: `src/assets/js/modules/_test/why-choose-positioning.test.mjs`

**Step 1: Write the failing test**

Add tests for:
- entering `start` when the section top has not reached the viewport-centered top;
- entering `fixed` while the viewport center crosses the parent;
- entering `end` when the model bottom reaches the parent bottom;
- returning from `end` to `fixed` while scrolling upward.

**Step 2: Run test to verify it fails**

Run: `node --test src/assets/js/modules/_test/why-choose-positioning.test.mjs`
Expected: FAIL because the module does not exist yet.

**Step 3: Write minimal implementation**

Implement a pure function that accepts `sectionRect`, `modelHeight`, and `viewportHeight`, then returns:
- `state: 'start' | 'fixed' | 'end'`
- `fixedTop`

**Step 4: Run test to verify it passes**

Run: `node --test src/assets/js/modules/_test/why-choose-positioning.test.mjs`
Expected: PASS.

### Task 2: Replace CSS offset-based positioning with discrete states

**Files:**
- Modify: `src/assets/css/sections/why-choose.css`
- Modify: `src/assets/js/modules/why-choose-scene.js`

**Step 1: Remove the offset variable design**

Delete the `--why-choose-model-offset` dependency and define explicit state selectors for the model container.

**Step 2: Implement fixed/start/end DOM application**

Update the scene module to:
- measure section and model geometry;
- compute the pin state using the pure helper;
- apply `data-pin-state` plus inline `top/left/width/bottom` only when needed;
- batch scroll/resize work through a single scheduled frame.

**Step 3: Preserve cleanup and fallback behavior**

Ensure destroy logic clears listeners and inline styles, and that missing DOM nodes still short-circuit safely.

### Task 3: Verify integration

**Files:**
- Verify only

**Step 1: Run focused tests**

Run: `node --test src/assets/js/modules/_test/why-choose-positioning.test.mjs src/assets/js/modules/_test/why-choose.test.mjs`

**Step 2: Run production build**

Run: `npm run build`

**Step 3: Review outputs**

Confirm tests pass and build exits with code `0`.
