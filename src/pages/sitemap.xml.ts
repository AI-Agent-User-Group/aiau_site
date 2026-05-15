import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { toAbsoluteUrl } from '../config/site';
import { staticSitemapEntries } from '../data/site-pages';

export const prerender = true;

export const GET: APIRoute = async () => {
  const contentEntries = await getCollection('policies');
  const lastmod = new Date().toISOString();
  const entries = [
    ...staticSitemapEntries,
    ...contentEntries.map((entry) => ({
      path: `/${entry.id}/`,
      priority: entry.data.priority,
      changefreq: entry.data.changefreq,
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries
    .map(
      (entry) =>
        `  <url>\n    <loc>${toAbsoluteUrl(entry.path)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>${entry.changefreq}</changefreq>\n    <priority>${entry.priority.toFixed(1)}</priority>\n  </url>`
    )
    .join('\n')}\n</urlset>\n`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
