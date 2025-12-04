import { defineCollection, z } from "astro:content";

const postsCollection: ReturnType<typeof defineCollection> = defineCollection({
	schema: z.object({
		title: z.string(),
		published: z.date(),
		updated: z.date().optional(),
		draft: z.boolean().optional().default(false),
		description: z.string().optional().default(""),
		image: z.string().optional().default(""),
		tags: z.array(z.string()).optional().default([]),
		category: z.string().optional().nullable().default(""),
		expiry: z.boolean().optional().default(true),
		expiryDays: z.number().int().positive().optional(),
		pinned: z.boolean().optional().default(false),
		lang: z.string().optional().default(""),

		/* For internal use */
		prevTitle: z.string().default(""),
		prevSlug: z.string().default(""),
		nextTitle: z.string().default(""),
		nextSlug: z.string().default(""),
	}),
});
const specCollection: ReturnType<typeof defineCollection> = defineCollection({
	schema: z.object({
		title: z.string().optional(),
		description: z.string().optional(),
		lang: z.string().optional(),
	}),
});
const friendsCollection: ReturnType<typeof defineCollection> = defineCollection(
	{
		type: "data",
		schema: z.object({
			name: z.string(),
			url: z.string(),
			avatar: z.string().optional(),
			description: z.string().optional(),
			tags: z.array(z.string()).optional(),
		}),
	},
);
export const collections: {
	posts: typeof postsCollection;
	spec: typeof specCollection;
	friends: typeof friendsCollection;
} = {
	posts: postsCollection,
	spec: specCollection,
	friends: friendsCollection,
};
