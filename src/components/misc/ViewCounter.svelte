<script lang="ts">
	import { onMount } from "svelte";
	import { umamiConfig } from "@/config";

	type Metric = "pageviews" | "visitors" | "visits";

	export let path: string | null = null;
	export let className = "";
	export let placeholder = "—";
	export let metric: Metric = "pageviews";

	const config = {
		apiBase: umamiConfig.apiBase || "https://api.umami.is/v1",
		apiKey: umamiConfig.apiKey,
		websiteId: umamiConfig.websiteId,
	};

	const GLOBAL_KEY = "__umamiStats";

	const getGlobalCache = () => {
		const win = window as Window & {
			[GLOBAL_KEY]?: {
				statsCache: Map<
					string,
					Promise<{ pageviews: number; visitors: number; visits: number }>
				>;
			};
		};
		if (!win[GLOBAL_KEY]) {
			win[GLOBAL_KEY] = {
				statsCache: new Map(),
			};
		}
		return win[GLOBAL_KEY];
	};

	const normalizePath = (p?: string | null) =>
		!p || p === "/" ? "/" : `/${p}`.replace(/\/+/g, "/");

	const fetchStats = (p?: string | null) => {
		const cache = getGlobalCache();
		const key = p ? normalizePath(p) : "__site__";
		const cached = cache.statsCache.get(key);
		if (cached) return cached;

		if (!config.apiKey) return Promise.reject(new Error("apiKey not set"));

		const params = new URLSearchParams({
			startAt: "0",
			endAt: Date.now().toString(),
		});
		if (p) params.set("path", normalizePath(p));

		const promise = fetch(
			`${config.apiBase}/websites/${config.websiteId}/stats?${params}`,
			{
				headers: { "x-umami-api-key": config.apiKey },
			},
		)
			.then((res) =>
				res.ok
					? res.json()
					: Promise.reject(new Error(`stats ${res.status}`)),
			)
			.then((raw) => ({
				pageviews: Number(raw.pageviews ?? 0),
				visitors: Number(raw.visitors ?? 0),
				visits: Number(raw.visits ?? 0),
			}))
			.catch((err) => {
				cache.statsCache.delete(key);
				throw err;
			});

		cache.statsCache.set(key, promise);
		return promise;
	};

	let display = placeholder;
	let lastKey = "";

	const load = async () => {
		try {
			const stats = await fetchStats(path);
			const m: Metric =
				metric === "pageviews" || metric === "visitors" || metric === "visits"
					? metric
					: "pageviews";
			const val = Number(stats[m] ?? 0);
			display = Number.isFinite(val) ? val.toLocaleString() : placeholder;
		} catch {
			display = placeholder;
		}
	};

	onMount(() => load());

	$: {
		const key = `${path ?? ""}|${metric}`;
		if (key !== lastKey) {
			lastKey = key;
			load();
		}
	}
</script>

<span
	class={`view-counter inline-flex items-center ${className}`}
	aria-live="polite"
>
	{display}
</span>
