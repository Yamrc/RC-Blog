import { getSortedPosts } from "@utils/content-utils";
import { url } from "@utils/url-utils";
import type { APIContext } from "astro";
import getAtomResponse from "astrojs-atom";
import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";
import { profileConfig, siteConfig } from "@/config";

const parser = new MarkdownIt();
const xmlInvalidChars =
	// biome-ignore lint/suspicious/noControlCharactersInRegex: https://www.w3.org/TR/xml/#charsets
	/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\uFDD0-\uFDEF\uFFFE\uFFFF]/g;

export async function GET(context: APIContext): Promise<Response> {
	const blog = await getSortedPosts();
	const siteUrl = context.site?.toString() ?? "https://yamr.cc";
	const baseUrl = siteUrl.endsWith("/") ? siteUrl.slice(0, -1) : siteUrl;

	return getAtomResponse({
		title: siteConfig.title,
		id: siteUrl,
		updated: blog[0]
			? new Date(blog[0].data.updated ?? blog[0].data.published).toISOString()
			: new Date().toISOString(),
		subtitle: siteConfig.subtitle || siteConfig.description || "",
		lang: siteConfig.lang.replace("_", "-"),
		link: [
			{ href: siteUrl, rel: "alternate" },
			{ href: context.url.toString(), rel: "self" },
		],
		author: [{ name: profileConfig.name }],
		entry: blog.map((post) => {
			const content = String(post.body || "");
			const cleaned = content.replace(xmlInvalidChars, "");
			const postUrl = `${baseUrl}${url(`/posts/${post.slug}/`)}`;

			return {
				title: post.data.title,
				id: postUrl,
				updated: new Date(
					post.data.updated ?? post.data.published,
				).toISOString(),
				published: new Date(post.data.published).toISOString(),
				link: [{ href: postUrl, rel: "alternate" }],
				summary: post.data.description || "",
				content: {
					type: "html",
					value: sanitizeHtml(parser.render(cleaned), {
						allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
					}),
				},
				...(post.data.tags?.length
					? { category: post.data.tags.map((tag: string) => ({ term: tag })) }
					: {}),
			};
		}),
	});
}
