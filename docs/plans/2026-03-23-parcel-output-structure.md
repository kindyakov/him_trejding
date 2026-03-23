# Parcel Output Structure Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Configure Parcel to emit a Vite-like output structure with HTML at the root and generated assets grouped into `css/`, `js/`, and `assets/`.

**Architecture:** Keep Parcel and PostHTML as the build stack, and add a local Parcel namer plugin to control bundle output paths centrally. This avoids post-build file moves and preserves Parcel's internal URL rewriting and source map handling.

**Tech Stack:** Parcel 2, PostHTML, local Parcel namer plugin, Node CommonJS

---

### Task 1: Add a local Parcel namer plugin

**Files:**

- Create: `plugins/parcel-namer-structured/package.json`
- Create: `plugins/parcel-namer-structured/index.js`

**Step 1: Create a local plugin package**

Add a package manifest with a valid Parcel engine range so Parcel can resolve it as a local config dependency.

**Step 2: Implement naming rules**

Return bundle names by type:

- `html` stays at root
- `css` goes to `css/`
- `js` goes to `js/`
- images/fonts/media go to `assets/`

**Step 3: Preserve hashed names**

Include Parcel hash references for non-stable bundles so cache busting continues to work.

### Task 2: Wire the plugin into Parcel config

**Files:**

- Modify: `.parcelrc`

**Step 1: Register the custom namer before the default namer**

Keep the default namer as fallback for unsupported cases.

### Task 3: Verify output structure

**Files:**

- Verify: `dist/`

**Step 1: Run production build**

Run: `npm run build`

**Step 2: Confirm structure**

Expected:

- `dist/*.html`
- `dist/css/*`
- `dist/js/*`
- `dist/assets/*`
