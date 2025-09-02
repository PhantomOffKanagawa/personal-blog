import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
	// Load Markdown and MDX files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.object({
			title: z.string(),
			description: z.string(),
			// Transform string to Date object
			pubDate: z.coerce.date(),
			updatedDate: z.coerce.date().optional(),
			heroImage: image().optional(),
		}),
});

const reviews = defineCollection({
  loader: glob({ base: './src/content/reviews', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
	z.object({
		productName: z.string(),
		brand: z.string(),
		pubDate: z.coerce.date(),
		rating: z.number().min(1).max(5),
		productImage: image().optional(), // We'll use the @assets alias
		tags: z.array(z.string()).optional(),
  	}),
});

export const collections = { blog, reviews };
