<script lang="ts">
import { onMount } from "svelte";
import { umamiConfig } from "@/config";

type Metric = "pageviews" | "visitors" | "visits";

export let path: string | null = null;
export let className = "";
export let placeholder = "—";
export let metric: Metric = "pageviews";

if (!umamiConfig.shareId) throw new Error("umamiConfig.shareId is required");

const config = {
	apiBase: umamiConfig.apiBase || "https://cloud.umami.is/analytics/us/api",
	shareId: umamiConfig.shareId,
	websiteId: umamiConfig.websiteId,
	timezone: umamiConfig.timezone || "Asia/Shanghai",
};

const GLOBAL_KEY = "__umamiShare";

const getGlobalShare = () => {
	const win = window as Window & {
		[GLOBAL_KEY]?: {
			token: string | null;
			websiteId: string | null;
			promise: Promise<{ websiteId: string; token: string }> | null;
			statsCache: Map<
				string,
				Promise<{ pageviews: number; visitors: number; visits: number }>
			>;
		};
	};
	if (!win[GLOBAL_KEY]) {
		win[GLOBAL_KEY] = {
			token: null,
			websiteId: null,
			promise: null,
			statsCache: new Map(),
		};
	}
	return win[GLOBAL_KEY];
};

const getShare = (): Promise<{ websiteId: string; token: string }> => {
	const share = getGlobalShare();
	if (share.token && share.websiteId) {
		return Promise.resolve({ websiteId: share.websiteId, token: share.token });
	}
	if (share.promise) return share.promise;
	share.promise = fetch(`${config.apiBase}/share/${config.shareId}`)
		.then((res) =>
			res.ok ? res.json() : Promise.reject(new Error(`share ${res.status}`)),
		)
		.then((data) => {
			share.websiteId = config.websiteId || data.websiteId;
			share.token = data.token;
			share.promise = null;
			if (!share.websiteId || !share.token) {
				throw new Error("missing websiteId or token");
			}
			return { websiteId: share.websiteId, token: share.token };
		})
		.catch((err) => {
			share.promise = null;
			throw err;
		});
	return share.promise;
};

const normalizePath = (p?: string | null) =>
	!p || p === "/" ? "/" : `/${p}`.replace(/\/+/g, "/");

const fetchStats = (p?: string | null) => {
	const share = getGlobalShare();
	const key = p ? normalizePath(p) : "__site__";
	const cached = share.statsCache.get(key);
	if (cached) return cached;

	const promise = getShare()
		.then((s) => {
			const params = new URLSearchParams({
				startAt: "0",
				endAt: Date.now().toString(),
				unit: "hour",
				timezone: config.timezone,
				compare: "false",
			});
			if (p) params.set("path", `eq.${normalizePath(p)}`);
			return fetch(
				`${config.apiBase}/websites/${s.websiteId}/stats?${params}`,
				{
					headers: { "x-umami-share-token": s.token },
				},
			);
		})
		.then((res) =>
			res.ok ? res.json() : Promise.reject(new Error(`stats ${res.status}`)),
		)
		.then((raw) => ({
			pageviews: Number(raw.pageviews ?? 0),
			visitors: Number(raw.visitors ?? 0),
			visits: Number(raw.visits ?? 0),
		}))
		.catch((err) => {
			share.statsCache.delete(key);
			throw err;
		});

	share.statsCache.set(key, promise);
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

<span class={`view-counter inline-flex items-center ${className}`} aria-live="polite">
	{display}
</span>
