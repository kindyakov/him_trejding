# Request Price Modal Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a Figma-matched request-price modal opened from the header CTA, with modular JS, validation, loading state, and toast notifications.

**Architecture:** Use `a11y-dialog` for the accessible modal shell, `just-validate` for form validation, and `notyf` for feedback. Keep `src/assets/js/index.js` as the entry only and move menu, modal, mock API, and toast logic into dedicated modules.

**Tech Stack:** Parcel 2, PostHTML partials, vanilla JS modules, a11y-dialog, just-validate, notyf

---

### Task 1: Add modal markup and sprite icons

**Files:**

- Modify: `src/partials/header.html`
- Modify: `src/partials/sprite.html`

**Step 1:** Replace the CTA link with a button trigger.

**Step 2:** Add modal markup with desktop/mobile-friendly structure and form fields.

**Step 3:** Add any missing icons to the inline sprite.

### Task 2: Style modal and interactive states

**Files:**

- Modify: `src/assets/css/index.css`
- Modify: `src/assets/css/sections/header.css`
- Create: `src/assets/css/sections/modal.css`

**Step 1:** Import modal stylesheet.

**Step 2:** Add hover/focus transitions for header and modal controls.

**Step 3:** Match the Figma modal layout for desktop and mobile.

### Task 3: Modularize JavaScript

**Files:**

- Modify: `src/assets/js/index.js`
- Create: `src/assets/js/modules/menu.js`
- Create: `src/assets/js/modules/modal.js`
- Create: `src/assets/js/modules/request-form.js`
- Create: `src/assets/js/modules/toast.js`
- Create: `src/assets/js/api/mock-request.js`

**Step 1:** Move the existing menu code into its own module.

**Step 2:** Wire the modal controller via `a11y-dialog`.

**Step 3:** Add validation, loader state, and mock request handling.

### Task 4: Verify build and behavior

**Files:**

- Verify: `dist/`

**Step 1:** Run `npm run build`.

**Step 2:** Confirm the modal trigger, menu logic, and bundled assets still build cleanly.
