# AGENTS.MD

## Project overview

- This repository is the source for the **AIAU (AI Agent User Group)** community site.
- The frontend is built with **Astro** + **Tailwind CSS v4** and written in **TypeScript**.
- Production delivery is handled by **Cloudflare Workers Static Assets** via `src/worker.ts`.
- The site uses **Astro's static output** (`output: 'static'`), generating pre-rendered HTML under `dist\` at build time.

## Runtime architecture

### Development

- `astro dev` starts the Astro development server.
- Pages are authored as **Astro components** under `src\pages\*.astro`.
- Markdown policy pages live in `src\content\policies\*.md` and are consumed through **Astro Content Collections** (`astro:content`).
- Layout, header, and page components are composed in `.astro` files; `BaseLayout.astro` injects SEO metadata, Open Graph tags, Twitter tags, and JSON-LD.

### Production

- `npm run build` runs:
  1. `npm run icons` — generates PWA icons from `public\favicon.svg`
  2. `astro check` — TypeScript / Astro type checking
  3. `astro build` — static site generation into `dist\`
- `src\worker.ts` serves `env.ASSETS.fetch(request)` and adds security headers such as CSP, HSTS, Referrer-Policy, and Permissions-Policy.
- Astro's static build produces:
  - HTML pages for every route under `src\pages\`
  - `sitemap.xml` from `src\pages\sitemap.xml.ts`
  - `robots.txt` from `src\pages\robots.txt.ts`
  - `404.html` from `src\pages\404.astro`

## Key files

- `astro.config.mjs`: Astro configuration (site URL, static output, trailing slash behavior).
- `src\layouts\BaseLayout.astro`: shared HTML shell, global metadata, SEO injection, header/footer.
- `src\components\SiteHeader.astro`: site header with navigation and mobile menu.
- `src\worker.ts`: Cloudflare Worker wrapper around static assets plus security headers.
- `src\content.config.ts`: Astro Content Collections definition for policy Markdown files.
- `src\lib\seo.ts`: helpers for canonical URLs, Open Graph images, JSON-LD generation.
- `src\config\site.ts`: site-wide constants (name, URLs, nav links, community links).
- `src\data\site-pages.ts`: page metadata and sitemap entries for static pages.
- `src\data\manners.ts`: structured content data for the manners page.
- `scripts\gen-icons.mjs`: generates PWA icons from `public\favicon.svg`.
- `src\content\policies\`: source Markdown content for policy/guideline pages.
- `public\`: static assets such as OGP images, favicon, manifest, client-side scripts.
- `dist\`: generated output; do not hand-edit.

## Current route model

- `/` -> home page (`src\pages\index.astro`)
- `/privacy-policy` -> Markdown-backed policy page (`src\content\policies\privacy-policy.md`)
- `/code-of-conduct` -> Markdown-backed policy page (`src\content\policies\code-of-conduct.md`)
- `/anti-harassment-policy` -> Markdown-backed policy page (`src\content\policies\anti-harassment-policy.md`)
- `/guidelines` -> Markdown-backed policy page (`src\content\policies\guidelines.md`)
- `/manners` -> inline Astro page (`src\pages\manners.astro`)
- `/sitemap.xml` -> dynamic endpoint (`src\pages\sitemap.xml.ts`)
- `/robots.txt` -> dynamic endpoint (`src\pages\robots.txt.ts`)
- `/404` -> 404 page (`src\pages\404.astro`)

## Important implementation constraints

### 1. Route additions follow Astro file-based routing

When adding or removing a page:

- For static pages: create or remove `.astro` files under `src\pages\`.
- For Markdown-backed pages: add or remove `.md` files under `src\content\policies\` and ensure the front matter matches the schema in `src\content.config.ts`.
- Update `src\data\site-pages.ts` if the page needs custom metadata or sitemap entries.
- Update `src\config\site.ts` (`navLinks`) if the page should appear in the header navigation.
- Update page metadata / OGP image selection if applicable.

### 2. CSP must match any new third-party integration

If you add external embeds, scripts, fonts, forms, APIs, or images, update the CSP and related policies in `src\worker.ts`. Current allowed third-party origins include:

- `https://luma.com`
- `https://docs.google.com`
- `https://cdnjs.cloudflare.com`
- `https://aiau.group` for images

### 3. Content collections schema changes

If you modify the front matter schema in `src\content.config.ts`, run `astro sync` or `astro check` to regenerate type definitions. All Markdown policy files must conform to the Zod schema defined there.

## Content model

- Policy and guideline pages are authored in Markdown under `src\content\policies\`.
- Markdown front matter is validated by the Zod schema in `src\content.config.ts` (title, metaTitle, description, ogImage, priority, changefreq, type).
- Astro renders Markdown to HTML via `render()` from `astro:content`.
- SEO metadata, canonical URLs, Open Graph tags, Twitter tags, and JSON-LD are injected by `BaseLayout.astro` using helpers from `src\lib\seo.ts`.

## Build and deployment commands

- `npm run dev`: start local Astro development server
- `npm run check`: run Astro type checking
- `npm run icons`: generate PWA icons
- `npm run build`: generate icons, run type checking, then build static site
- `npm run preview`: preview the built site locally on port `5173`
- `npm run deploy`: deploy with Wrangler

## Environment and config notes

- `SITE_URL` environment variable controls canonical URLs, OGP URLs, and sitemap URLs. Default: `https://aiau.group` (set in `astro.config.mjs` and `src\config\site.ts`).
- `wrangler.toml` expects:
  - `main = "src/worker.ts"`
  - static assets from `dist\`
  - `ASSETS` binding

## Validation

- There is currently **no dedicated test suite** in `package.json`.
- The practical validation path for changes is `npm run build` (which includes `astro check`).

## Editing guidance for future agents

- Prefer editing source files under `src\`, `scripts\`, `public\`, and configuration files at the project root.
- Do not make manual source-of-truth edits directly in `dist\`.
- Keep Japanese copy consistent with the existing tone unless the task explicitly changes content strategy.
- Preserve accessibility hooks already in place, such as skip links, `aria-current`, menu `aria-expanded`, and descriptive labels on external-action links.
- When modifying the site header navigation, edit `src\config\site.ts` (`navLinks`) rather than editing `SiteHeader.astro` directly.
