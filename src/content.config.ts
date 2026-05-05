import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const teamCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/team' }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    initials: z.string().max(3),
    linkedInUrl: z.string().url().optional().nullable(),
    githubUrl: z.string().url().optional().nullable(),
    isPlaceholder: z.boolean().default(false),
    order: z.number().default(0),
  }),
});

const serviceCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/services' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    icon: z.string(),
    isFeatured: z.boolean().default(false),
    order: z.number().default(0),
  }),
});

const partnerCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/partners' }),
  schema: z.object({
    name: z.string(),
    isPlaceholder: z.boolean().default(true),
    order: z.number().default(0),
  }),
});

const portfolioCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/portfolio' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    coverImage: z.string().optional().nullable(),
    tags: z.array(z.string()).default([]),
    clientName: z.string().optional().nullable(),
    isPlaceholder: z.boolean().default(false),
    order: z.number().default(0),
  }),
});

const faqCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/faq' }),
  schema: z.object({
    question: z.string(),
    answer: z.string(),
    order: z.number().default(0),
  }),
});

export const collections = {
  team: teamCollection,
  services: serviceCollection,
  partners: partnerCollection,
  portfolio: portfolioCollection,
  faq: faqCollection,
};
