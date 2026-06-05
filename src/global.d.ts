import type { AstroIntegration } from "@swup/astro";

declare module "*.css?raw" {
	const content: string;
	export default content;
}

export interface PagefindSearchResponse {
	results: Array<{
		data: () => Promise<SearchResult>;
	}>;
}

export interface PagefindOptions {
	excerptLength?: number;
	[key: string]: unknown;
}

export interface PagefindModule {
	search: (query: string) => Promise<PagefindSearchResponse>;
	options: (options: PagefindOptions) => Promise<void> | void;
	init?: () => Promise<void> | void;
	preload?: (query?: string) => Promise<void> | void;
}

declare global {
	interface Window {
		// type from '@swup/astro' is incorrect
		swup: AstroIntegration;
		pagefind?: PagefindModule;
	}
}

export interface SearchResult {
	url: string;
	meta: {
		title: string;
	};
	excerpt: string;
	content?: string;
	word_count?: number;
	filters?: Record<string, unknown>;
	anchors?: Array<{
		element: string;
		id: string;
		text: string;
		location: number;
	}>;
	weighted_locations?: Array<{
		weight: number;
		balanced_score: number;
		location: number;
	}>;
	locations?: number[];
	raw_content?: string;
	raw_url?: string;
	sub_results?: SearchResult[];
}
