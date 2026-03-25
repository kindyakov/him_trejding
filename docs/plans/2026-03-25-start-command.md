# Start Command Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add `npm run start` to serve the built `dist/` output as a production-like static site.

**Architecture:** Introduce a small Node HTTP server dedicated to `dist/` only. Keep `dev` and `start` separate so development behavior does not leak into production serving, and fail fast when `dist/` has not been built yet.

**Tech Stack:** Node.js `http`, filesystem APIs, existing Parcel/PostHTML build output in `dist/`

---

### Task 1: Add a production static file server

**Files:**
- Create: `scripts/start.mjs`

**Step 1: Validate the serving model**

Serve only `dist/` files. Map `/` to `dist/index.html`, resolve other paths inside `dist/`, and return 404 for missing files.

**Step 2: Add HTTP serving logic**

Implement a minimal Node server with content types for html/css/js/svg/png/mp4/ico and a readable startup message.

**Step 3: Fail fast on missing build output**

If `dist/` or `dist/index.html` is missing, throw a clear error telling the user to run `npm run build`.

### Task 2: Wire package.json

**Files:**
- Modify: `package.json`

**Step 1: Add the script**

Add `"start": "node scripts/start.mjs"` under `scripts`.

### Task 3: Verify behavior

**Files:**
- Verify: `package.json`
- Verify: `scripts/start.mjs`

**Step 1: Run the production build**

Run: `npm run build`

**Step 2: Start the production server**

Run: `npm run start`

**Step 3: Confirm expected result**

Expect a startup message with a localhost URL and no dependency on `src/` or live reload endpoints.
