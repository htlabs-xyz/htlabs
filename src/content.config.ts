import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const teamCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/team' }),
  schema: z.object({
    name: z.string(),
    role: z.string(),
    initials: z.string().max(3),
    photoUrl: z.string().optional().nullable(),
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
    title_vi: z.string().optional(),
    description: z.string(),
    description_vi: z.string().optional(),
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
    title_vi: z.string().optional(),
    description: z.string(),
    description_vi: z.string().optional(),
    coverImage: z.string().optional().nullable(),
    tags: z.array(z.string()).default([]),
    tags_vi: z.array(z.string()).optional(),
    clientName: z.string().optional().nullable(),
    isPlaceholder: z.boolean().default(false),
    order: z.number().default(0),
  }),
});

const faqCollection = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/faq' }),
  schema: z.object({
    question: z.string(),
    question_vi: z.string().optional(),
    answer: z.string(),
    answer_vi: z.string().optional(),
    order: z.number().default(0),
  }),
});

const blogCollection = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    excerpt: z.string(),
    author: z.string(),
    date: z.coerce.date(),
    coverImage: z.string().optional().nullable(),
    isPlaceholder: z.boolean().default(false),
  }),
});

export const collections = {
  team: teamCollection,
  services: serviceCollection,
  partners: partnerCollection,
  portfolio: portfolioCollection,
  faq: faqCollection,
  blog: blogCollection,
};
