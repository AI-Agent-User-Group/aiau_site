import { defineConfig } from 'astro/config';

const site = process.env.SITE_URL || 'https://aiau.group';

export default defineConfig({
  site,
  output: 'static',
  build: {
    format: 'directory',
  },
  trailingSlash: 'ignore',
});
