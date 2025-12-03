// https://github.com/saicaca/fuwari/pull/600
import type { CollectionEntry } from "astro:content";
import fs from "node:fs";
import sharp from "sharp";
import { profileConfig, siteConfig } from "@/config";

async function convertImageToPngBase64(buffer: Buffer): Promise<string | null> {
	try {
		const fmt = (await sharp(buffer).metadata()).format;
		if (fmt === "png")
			return `data:image/png;base64,${buffer.toString("base64")}`;
		if (fmt === "svg")
			return `data:image/svg+xml;base64,${buffer.toString("base64")}`;
		const cBuffer = await sharp(buffer)
			.png({ quality: 100, compressionLevel: 9 })
			.toBuffer();
		return `data:image/png;base64,${cBuffer.toString("base64")}`;
	} catch (error) {
		console.warn("Failed to convert image to PNG:", error);
		return `data:image/png;base64,${buffer.toString("base64")}`;
	}
}

export default async function OpenGraph(post: CollectionEntry<"posts">) {
	const avatarBase64 = await convertImageToPngBase64(
		fs.readFileSync(`./src/${profileConfig.avatar}`),
	);

	let iconPath = "./public/favicon/favicon-dark-192.png";
	if (siteConfig.favicon.length > 0) {
		iconPath = `./public${siteConfig.favicon[0].src}`;
	}
	const iconBase64 = await convertImageToPngBase64(fs.readFileSync(iconPath));

	const hue = siteConfig.themeColor.hue;
	const primaryColor = `hsl(${hue}, 90%, 65%)`;
	const textColor = "hsl(0, 0%, 95%)";

	const subtleTextColor = `hsl(${hue}, 10%, 75%)`;
	const backgroundColor = `hsl(${hue}, 15%, 12%)`;

	const pubDate = post.data.published.toLocaleDateString("zh-CN", {
		year: "numeric",
		month: "short",
		day: "numeric",
	});

	const description = post.data.description;

	return {
		type: "div",
		props: {
			style: {
				height: "100%",
				width: "100%",
				display: "flex",
				flexDirection: "column",
				backgroundColor: backgroundColor,
				fontFamily:
					'"Noto Sans SC", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
				padding: "60px",
			},
			children: [
				{
					type: "div",
					props: {
						style: {
							width: "100%",
							display: "flex",
							alignItems: "center",
							gap: "20px",
						},
						children: (() => {
							const items = [];
							if (iconBase64) {
								items.push({
									type: "img",
									props: {
										src: iconBase64,
										width: 48,
										height: 48,
										style: { borderRadius: "10px" },
									},
								});
							}
							items.push({
								type: "div",
								props: {
									style: {
										fontSize: "36px",
										fontWeight: 600,
										color: subtleTextColor,
									},
									children: siteConfig.title,
								},
							});
							return items;
						})(),
					},
				},

				{
					type: "div",
					props: {
						style: {
							display: "flex",
							flexDirection: "column",
							justifyContent: "center",
							flexGrow: 1,
							gap: "20px",
						},
						children: (() => {
							const items = [
								{
									type: "div",
									props: {
										style: {
											display: "flex",
											alignItems: "flex-start",
										},
										children: [
											{
												type: "div",
												props: {
													style: {
														width: "10px",
														height: "68px",
														backgroundColor: primaryColor,
														borderRadius: "6px",
														marginTop: "14px",
													},
												},
											},
											{
												type: "div",
												props: {
													style: {
														fontSize: "72px",
														fontWeight: 700,
														lineHeight: 1.2,
														color: textColor,
														marginLeft: "25px",
														display: "-webkit-box",
														overflow: "hidden",
														textOverflow: "ellipsis",
														lineClamp: 3,
														WebkitLineClamp: 3,
														WebkitBoxOrient: "vertical",
													},
													children: post.data.title,
												},
											},
										],
									},
								},
							];
							if (description) {
								items.push({
									type: "div",
									props: {
										style: {
											fontSize: "32px",
											lineHeight: 1.5,
											color: subtleTextColor,
											paddingLeft: "35px",
											display: "-webkit-box",
											overflow: "hidden",
											textOverflow: "ellipsis",
											lineClamp: 2,
											WebkitLineClamp: 2,
											WebkitBoxOrient: "vertical",
										},
										children: description,
									},
								});
							}
							return items;
						})(),
					},
				},
				{
					type: "div",
					props: {
						style: {
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							width: "100%",
						},
						children: [
							{
								type: "div",
								props: {
									style: {
										display: "flex",
										alignItems: "center",
										gap: "20px",
									},
									children: (() => {
										const items = [];
										if (avatarBase64) {
											items.push({
												type: "img",
												props: {
													src: avatarBase64,
													width: 60,
													height: 60,
													style: { borderRadius: "50%" },
												},
											});
										}
										items.push({
											type: "div",
											props: {
												style: {
													fontSize: "28px",
													fontWeight: 600,
													color: textColor,
												},
												children: profileConfig.name,
											},
										});
										return items;
									})(),
								},
							},
							{
								type: "div",
								props: {
									style: { fontSize: "28px", color: subtleTextColor },
									children: pubDate,
								},
							},
						],
					},
				},
			],
		},
	};
}
