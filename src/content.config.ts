import { glob } from 'astro/loaders';
import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';

const policies = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/policies' }),
  schema: z.object({
    title: z.string(),
    metaTitle: z.string(),
    description: z.string(),
    ogImage: z.string(),
    priority: z.number(),
    changefreq: z.enum(['weekly', 'yearly']),
    type: z.enum(['website', 'article']).default('article'),
  }),
});

export const collections = { policies };
