import type {
	ExpressiveCodeConfig,
	FriendLinksConfig,
	GiscusConfig,
	LicenseConfig,
	NavBarConfig,
	ProfileConfig,
	SiteConfig,
	UmamiConfig,
} from "./types/config";
import { LinkPreset } from "./types/config";

export const siteConfig: SiteConfig = {
	title: "RC Blog",
	subtitle: "技术分享与开发笔记",
	description:
		"Yamrc的个人博客，专注于Typescript、Rust技术的业余实战经验分享。内容涵盖网络技术、serverless、云服务、站点优化及日常开发中和网上冲浪遇到的的问题排查与解决方案。",
	lang: "zh_CN",
	themeColor: {
		hue: 295,
		fixed: true,
	},
	toc: {
		enable: true,
		depth: 2,
	},
	favicon: [
		{
			src: "/favicon.ico",
		},
	],
	record: {
		enable: true,
		text: "萌ICP备20240013号",
		url: "https://icp.gov.moe/?keyword=20240013",
	},
};

export const navBarConfig: NavBarConfig = {
	links: [
		LinkPreset.Home,
		LinkPreset.Archive,
		LinkPreset.About,
		LinkPreset.FriendLinks,
		{
			name: "状态",
			url: "https://ok.yamr.cc",
			external: true,
		},
	],
};

// Visit https://icones.js.org/ for icon codes
export const profileConfig: ProfileConfig = {
	avatar: "assets/avatar_192x192.webp",
	name: "Yamrc",
	bio: "unsafe fn life()",
	links: [
		{
			name: "GitHub",
			icon: "fa6-brands:github",
			url: "https://github.com/Yamrc",
		},
		{
			name: "QQ",
			icon: "fa6-brands:qq",
			url: "https://qm.qq.com/q/G7XhtC9RSw",
		},
		{
			name: "BiliBili",
			icon: "fa6-brands:bilibili",
			url: "https://space.bilibili.com/475403704",
		},
		{
			name: "Steam",
			icon: "fa6-brands:steam",
			url: "https://steamcommunity.com/id/yamrc/",
		},
		{
			name: "EMail",
			icon: "fa6-solid:envelope",
			url: "mailto:yamrci@outlook.com",
		},
	],
};

export const licenseConfig: LicenseConfig = {
	enable: true,
	name: "CC BY-NC-SA 4.0",
	url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
};

// https://giscus.app/
export const giscusConfig: GiscusConfig = {
	enable: true,
	repo: "Yamrc/Yamrc",
	repoId: "R_kgDOQKajwg",
	category: "Comments",
	categoryId: "DIC_kwDOQKajws4Cx6-Y",
	mapping: "pathname",
	reactionsEnabled: "1",
	inputPosition: "top",
	lang: "zh-CN",
	loading: "lazy",
};

export const friendLinksConfig: FriendLinksConfig = {
	enable: true,
	// page entry slug in "spec" collection
};

export const expressiveCodeConfig: ExpressiveCodeConfig = {
	theme: "github-dark",
};

export const umamiConfig: UmamiConfig = {
	enable: true,
	scriptUrl: "https://cloud.umami.is/script.js",
	websiteId: "33f4fac9-5553-4990-972c-11df432f392d",
	shareId: "K0e2CMszGjDWE8ql",
	timezone: "Asia/Shanghai",
};
