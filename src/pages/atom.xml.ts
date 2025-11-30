import { getSortedPosts } from "@utils/content-utils";
import { url } from "@utils/url-utils";
import type { APIContext } from "astro";
import getAtomResponse from "astrojs-atom";
import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";
import { profileConfig, siteConfig } from "@/config";

const parser = new MarkdownIt();

function stripInvalidXmlChars(str: string): string {
	return str.replace(
		// biome-ignore lint/suspicious/noControlCharactersInRegex: https://www.w3.org/TR/xml/#charsets
		/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\uFDD0-\uFDEF\uFFFE\uFFFF]/g,
		"",
	);
}

function formatDate(date: Date | string): string {
	const d = date instanceof Date ? date : new Date(date);
	return d.toISOString();
}

function toAbsoluteUrl(path: string, base: string): string {
	if (path.startsWith("http://") || path.startsWith("https://")) {
		return path;
	}
	const baseUrl = base.endsWith("/") ? base.slice(0, -1) : base;
	const cleanPath = path.startsWith("/") ? path : `/${path}`;
	return `${baseUrl}${cleanPath}`;
}

export async function GET(context: APIContext): Promise<Response> {
	const blog = await getSortedPosts();
	const siteUrl = context.site?.toString() ?? "https://yamr.cc";

	const latestPost = blog[0];
	const feedUpdated = latestPost
		? formatDate(latestPost.data.updated ?? latestPost.data.published)
		: new Date().toISOString();

	const selfUrl = context.url.toString();

	return getAtomResponse({
		title: siteConfig.title,
		id: siteUrl,
		updated: feedUpdated,
		subtitle: siteConfig.subtitle || siteConfig.description || "",
		lang: siteConfig.lang.replace("_", "-"),
		link: [
			{ href: siteUrl, rel: "alternate" },
			{ href: selfUrl, rel: "self" },
		],
		author: [
			{
				name: profileConfig.name,
			},
		],
		entry: blog.map((post) => {
			const content =
				typeof post.body === "string" ? post.body : String(post.body || "");
			const cleanedContent = stripInvalidXmlChars(content);
			const postUrl = toAbsoluteUrl(url(`/posts/${post.slug}/`), siteUrl);
			const postUpdated = formatDate(post.data.updated ?? post.data.published);
			const postPublished = formatDate(post.data.published);

			return {
				title: post.data.title,
				id: postUrl,
				updated: postUpdated,
				published: postPublished,
				link: [{ href: postUrl, rel: "alternate" }],
				summary: post.data.description || "",
				content: {
					type: "html",
					value: sanitizeHtml(parser.render(cleanedContent), {
						allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
					}),
				},
				...(post.data.tags && post.data.tags.length > 0
					? {
							category: post.data.tags.map((tag: string) => ({ term: tag })),
						}
					: {}),
			};
		}),
	});
}
