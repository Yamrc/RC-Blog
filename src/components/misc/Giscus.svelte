<script lang="ts">
import Giscus from "@giscus/svelte";
import { getHue } from "@utils/setting-utils.ts";
import { onDestroy, onMount } from "svelte";
import { giscusConfig } from "@/config";

let hue = getHue();
let mode =
	typeof document !== "undefined" &&
	document.documentElement.classList.contains("dark")
		? "dark"
		: "light";
let theme: string;
let iframe: HTMLIFrameElement | null = null;

let { className = "" }: { className?: string } = $props();

// iframe，不好搞啊，能设置html的style，定义var都好搞多了...只能这样屎上雕花了
const build_theme = () => {
	const url_raw = mode === "dark" ? "/giscus/dark.css" : "/giscus/light.css";
	const url = url_raw.startsWith("http")
		? url_raw
		: new URL(url_raw, window.location.origin).href;
	return `data:text/css;charset=utf-8,${encodeURIComponent(`@import url("${url}");\nmain { --hue: ${hue}; }`)}`;
};

const update_theme = (retries = 0) => {
	if (!iframe?.contentWindow && retries < 10) {
		setTimeout(() => update_theme(retries + 1), 100 * 1.5 ** retries);
		return;
	}
	theme = build_theme();
	iframe?.contentWindow?.postMessage(
		{ giscus: { setConfig: { theme } } },
		"https://giscus.app",
	);
};

theme = build_theme();

const observer = new MutationObserver(() => {
	const new_hue = getHue();
	const new_mode = document.documentElement.classList.contains("dark")
		? "dark"
		: "light";
	if (hue !== new_hue || mode !== new_mode) {
		hue = new_hue;
		mode = new_mode;
		update_theme();
	}
});

onMount(() => {
	const find_iframe = (retries = 0) => {
		iframe = document
			.getElementById("comments")
			?.shadowRoot?.querySelector("iframe") as HTMLIFrameElement;
		// retry这一块
		if (!iframe && retries < 10) {
			setTimeout(() => find_iframe(retries + 1), 100 * 1.5 ** retries);
		}
	};
	find_iframe();
	observer.observe(document.documentElement, {
		attributes: true,
		attributeFilter: ["class", "style"],
	});
});
onDestroy(() => observer.disconnect());
</script>

<div class={className}>
	<Giscus
		id="comments"
		{theme}
		repo={giscusConfig.repo}
		repoId={giscusConfig.repoId}
		category={giscusConfig.category}
		categoryId={giscusConfig.categoryId}
		mapping={giscusConfig.mapping}
		term={""}
		strict={giscusConfig.strict}
		reactionsEnabled={giscusConfig.reactionsEnabled}
		inputPosition={giscusConfig.inputPosition}
		lang={giscusConfig.lang}
		loading={giscusConfig.loading}
	/>
</div>
