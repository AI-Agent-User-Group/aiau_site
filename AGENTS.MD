# AGENTS.MD

## Project overview

- This repository is the source for the **AIAU (AI Agent User Group)** community site.
- The frontend is built with **Vite + Tailwind CSS v4** and written in **TypeScript**.
- Production delivery is handled by **Cloudflare Workers Static Assets** via `src/worker.ts`.
- The site is not purely SPA in production: build output is **pre-rendered static HTML** under `dist\`.

## Runtime architecture

### Development

- `index.html` provides the common shell.
- `src\main.ts` handles client-side routing and rendering.
- Markdown pages are fetched from `\md\*.md` and rendered with `marked`.

### Production

- `npm run build` runs:
  1. `npm run icons`
  2. `vite build`
  3. `node scripts\prerender.mjs`
- `scripts\prerender.mjs` rewrites `dist\index.html` into static pages, injects SEO metadata, generates `sitemap.xml`, `robots.txt`, `404.html`, copies `md\`, and writes `dist\_headers`.
- `src\worker.ts` serves `env.ASSETS.fetch(request)` and adds security headers such as CSP, HSTS, Referrer-Policy, and Permissions-Policy.

## Key files

- `index.html`: shared HTML shell, global metadata baseline, shared header/footer.
- `src\main.ts`: route detection, dev-only page rendering, mobile nav behavior, Markdown rendering.
- `src\styles.css`: Tailwind import and minimal global styles.
- `src\worker.ts`: Cloudflare Worker wrapper around static assets plus security headers.
- `scripts\prerender.mjs`: static page generation and SEO output.
- `scripts\gen-icons.mjs`: generates PWA icons from `public\favicon.svg`.
- `md\`: source Markdown content for policy/guideline pages.
- `public\`: static assets such as OGP images, favicon, manifest.
- `dist\`: generated output; do not hand-edit.

## Current route model

- `/` -> home page
- `/privacy-policy` -> Markdown-backed page
- `/code-of-conduct` -> Markdown-backed page
- `/anti-harassment-policy` -> Markdown-backed page
- `/guidelines` -> Markdown-backed page
- `/manners` -> inline HTML page

## Important implementation constraints

### 1. Some page content is duplicated on purpose

The home page and manners page exist in two places:

- `src\main.ts`
- `scripts\prerender.mjs`

This is how the project keeps development SPA rendering and production pre-rendered HTML aligned. If you change the home page or manners page content, update both files together.

### 2. Route additions require updates in multiple places

When adding or removing a page, update all relevant surfaces:

- route detection and rendering in `src\main.ts`
- pre-render generation in `scripts\prerender.mjs`
- sitemap output in `scripts\prerender.mjs`
- header/navigation links in `index.html` or rendered content
- page metadata / OGP image selection if applicable

### 3. CSP must match any new third-party integration

If you add external embeds, scripts, fonts, forms, APIs, or images, update the CSP and related policies in `src\worker.ts`. Current allowed third-party origins include:

- `https://luma.com`
- `https://docs.google.com`
- `https://cdnjs.cloudflare.com`
- `https://aiau.group` for images

## Content model

- Policy and guideline pages are authored in Markdown under `md\`.
- Markdown front matter is stripped before rendering.
- HTML conversion uses `marked`.
- SEO metadata, canonical URLs, Open Graph tags, Twitter tags, and JSON-LD are injected during pre-render.

## Build and deployment commands

- `npm run dev`: start local Vite development server
- `npm run build`: generate icons, build frontend, then pre-render static pages
- `npm run preview`: preview the built site locally on port `5173`
- `npm run deploy`: deploy with Wrangler

## Environment and config notes

- `SITE_URL` controls canonical URLs, OGP URLs, and sitemap URLs during pre-render. Default: `https://aiau.group`
- `wrangler.toml` expects:
  - `main = "src/worker.ts"`
  - static assets from `dist\`
  - `ASSETS` binding

## Validation

- There is currently **no dedicated test suite** in `package.json`.
- The practical validation path for changes is `npm run build`.

## Editing guidance for future agents

- Prefer editing source files under `src\`, `scripts\`, `md\`, `public\`, and `index.html`.
- Do not make manual source-of-truth edits directly in `dist\`.
- Keep Japanese copy consistent with the existing tone unless the task explicitly changes content strategy.
- Preserve accessibility hooks already in place, such as skip links, `aria-current`, menu `aria-expanded`, and descriptive labels on external-action links.
