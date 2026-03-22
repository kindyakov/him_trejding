# Repository Guidelines

## Project Structure & Module Organization
This repository is a Parcel-based multi-page site. Source files live under `src/`. Page entry points are in `src/pages` (for example, `index.html`, `about.html`). Shared HTML fragments are in `src/partials` and are included through PostHTML. Styles live in `src/assets/css`: keep global resets in `base.css`, design tokens in `variable.css`, page-wide composition in `index.css`, and section-specific rules in `sections/`. Client-side JavaScript currently starts from `src/assets/js/index.js`. Static files that should be copied as-is belong in `public/`. Treat `dist/` and `.parcel-cache/` as generated output.

## Build, Test, and Development Commands
- `npm install`: install local dependencies.
- `npm run dev`: start the Parcel dev server for all HTML entries in `src/pages` and open the site locally.
- `npm run build`: create a production build in `dist/` with the public URL set to `/`.

There is no separate lint or test script configured yet. Do not invent one in a PR without aligning the toolchain first.

## Coding Style & Naming Conventions
Use 2-space indentation in HTML, CSS, and JavaScript. Keep filenames lowercase and kebab-case where applicable. Preserve the current split between page templates, partials, and assets instead of mixing concerns. Prefer semantic HTML and keep includes small and reusable. In CSS, extend the existing token-first approach: reference variables before introducing hard-coded colors or spacing. Keep section styles isolated in `src/assets/css/sections/`.

## Testing Guidelines
No automated test framework is configured in this project. Verification is manual:
- run `npm run dev` and check each page entry renders correctly;
- run `npm run build` before submitting changes;
- verify shared partials, asset paths, and generated output in `dist/`.

When adding behavior in `src/assets/js/index.js`, test both initial page load and failure-safe behavior with missing optional DOM nodes.

## Commit & Pull Request Guidelines
Git history is not available in this workspace, so follow a strict default: use short imperative commit subjects such as `Add pricing page hero` or `Refactor header partial`. Keep commits focused. PRs should include a concise description, list of changed pages/partials, manual verification steps, and screenshots for visible UI changes.

## Configuration Notes
PostHTML include settings are defined in `.posthtmlrc`, and Parcel is configured through `package.json` and `.parcelrc`. Change build configuration only when the underlying need is clear and repository-wide.
