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
				createdDate: z.coerce.date(),
				updatedDate: z.coerce.date().optional(),
				heroImage: image().optional(),
				tags: z.array(z.string()).optional(),
				coverAlt: z.string().optional(),
			}),
});

const reviews = defineCollection({
  loader: glob({ base: './src/content/reviews', pattern: '**/*.{md,mdx}' }),
  schema: ({ image }) =>
		z.object({
			productName: z.string(),
			brand: z.string(),
			createdDate: z.coerce.date(),
			// Support either `rating` or legacy `ratingOverall` in content
			rating: z.number().min(1).max(5).optional(),
			ratingOverall: z.number().min(1).max(5).optional(),
			productImage: image().optional(), // @assets alias or public path
			tags: z.array(z.string()).optional(),
			allergenInfo: z.array(z.string()).optional(), // e.g., GF, DF
			price: z.number().optional(),
			stores: z.array(z.string()).optional(),
			imagePath: z.string().optional(),
			updatedDate: z.coerce.date().optional(),
			// createdDate already defined above
		}),
});

const tracking = defineCollection({
	loader: glob({ base: './src/content/tracking', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		type: z.enum(['run','workout','eating','sleep','misc']).default('misc'),
		date: z.coerce.date(),
		distanceKm: z.number().optional(),
		durationMin: z.string().optional(),
		calories: z.number().optional(),
		notes: z.string().optional(),
		tags: z.array(z.string()).optional(),
		updatedDate: z.coerce.date().optional(),
		createdDate: z.coerce.date().optional(),
	})
});

const runTracking = defineCollection({
	loader: glob({ base: './src/content/tracking/runs', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		date: z.coerce.date(),
		distanceKm: z.number().min(0).optional(),
		durationMin: z.string().optional(),
		calories: z.number().min(0).optional(),
		notes: z.string().optional(),
		tags: z.array(z.string()).optional(),
		updatedDate: z.coerce.date().optional(),
		createdDate: z.coerce.date().optional(),
	})
});

const about = defineCollection({
	loader: glob({ base: './src/content', pattern: 'about-me.md' }),
	schema: z.object({}).passthrough(),
});

export const collections = { blog, reviews, tracking, about };