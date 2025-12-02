import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";
import OpenGraph from "@components/misc/OpenGraph";
import { getFonts } from "@utils/fonts";
import type { APIContext, GetStaticPaths } from "astro";
import satori from "satori";
import sharp from "sharp";

export const prerender = true;
export const getStaticPaths: GetStaticPaths = async () => {
	const posts = (await getCollection("posts")).filter(
		(post) => !post.data.draft,
	);

	return posts.map((post) => ({
		params: { slug: post.slug },
		props: { post },
	}));
};

export async function GET({
	props,
}: APIContext<{ post: CollectionEntry<"posts"> }>) {
	const { post } = props;

	const fonts = await getFonts();
	const svg = await satori(await OpenGraph(post), {
		width: 1200,
		height: 630,
		fonts,
	});
	const webp = await sharp(Buffer.from(svg)).webp().toBuffer();

	return new Response(new Uint8Array(webp), {
		headers: {
			"Content-Type": "image/webp",
			"Cache-Control": "public, max-age=31536000, immutable",
		},
	});
}
