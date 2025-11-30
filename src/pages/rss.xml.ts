import rss from "@astrojs/rss";
import { getSortedPosts } from "@utils/content-utils";
import { url } from "@utils/url-utils";
import type { APIContext } from "astro";
import MarkdownIt from "markdown-it";
import sanitizeHtml from "sanitize-html";
import { siteConfig } from "@/config";

const parser = new MarkdownIt();
const xmlInvalidChars =
	// biome-ignore lint/suspicious/noControlCharactersInRegex: https://www.w3.org/TR/xml/#charsets
	/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F\uFDD0-\uFDEF\uFFFE\uFFFF]/g;

export async function GET(context: APIContext): Promise<Response> {
	const blog = await getSortedPosts();
	const siteUrl = (context.site?.toString() ?? "https://yamr.cc").replace(
		/\/$/,
		"",
	);

	return rss({
		title: siteConfig.title,
		description: siteConfig.subtitle || "No description",
		site: siteUrl,
		items: blog.map((post) => {
			const content = String(post.body || "");
			const cleaned = content.replace(xmlInvalidChars, "");
			const html = sanitizeHtml(parser.render(cleaned), {
				allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
			});
			const postUrl = `${siteUrl}${url(`/posts/${post.slug}/`)}`;

			return {
				title: post.data.title,
				pubDate: post.data.published,
				description: post.data.description || "",
				link: postUrl,
				content: html.replace(
					/(src|href)=["'](?!https?:\/\/|data:|#|mailto:)([^"']+)["']/g,
					(_, attr, urlPath) => {
						try {
							return `${attr}="${new URL(urlPath, siteUrl).href}"`;
						} catch {
							return `${attr}="${siteUrl}${urlPath.startsWith("/") ? urlPath : `/${urlPath}`}"`;
						}
					},
				),
			};
		}),
		customData: `<language>${siteConfig.lang.replace("_", "-")}</language>
		<atom:link href="${context.url.toString()}" rel="self" type="application/rss+xml" xmlns:atom="http://www.w3.org/2005/Atom"/>`,
	});
}
