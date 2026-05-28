import { initMathScrollbars } from "./math-scroll";
import { setupPageScrollbar, updatePageScrollbar } from "./scrollbar";
import {
	clearInitialLoadAnimation,
	loadHue,
	loadTheme,
} from "./theme-listeners";

function init() {
	loadTheme();
	loadHue();
	setupPageScrollbar();
	updatePageScrollbar();
	initMathScrollbars();
	window.setTimeout(clearInitialLoadAnimation, 1000);
}

init();

const setup = () => {
	window.swup.hooks.on("link:click", () => {
		document.documentElement.style.setProperty("--content-delay", "0ms");
		clearInitialLoadAnimation();
	});
	window.swup.hooks.on("content:replace", () => {
		initMathScrollbars();
		window.requestAnimationFrame(updatePageScrollbar);
	});
	window.swup.hooks.on("visit:start", () => {
		const heightExtend = document.getElementById("page-height-extend");
		if (heightExtend) {
			heightExtend.classList.remove("hidden");
		}

		const toc = document.getElementById("toc-wrapper");
		if (toc) {
			toc.classList.add("toc-not-ready");
		}
	});
	window.swup.hooks.on("page:view", () => {
		const heightExtend = document.getElementById("page-height-extend");
		if (heightExtend) {
			heightExtend.classList.remove("hidden");
		}
	});
	window.swup.hooks.on("visit:end", () => {
		setTimeout(() => {
			const heightExtend = document.getElementById("page-height-extend");
			if (heightExtend) {
				heightExtend.classList.add("hidden");
			}

			const toc = document.getElementById("toc-wrapper");
			if (toc) {
				toc.classList.remove("toc-not-ready");
			}
		}, 200);
	});
};

if (window?.swup?.hooks) setup();
else document.addEventListener("swup:enable", setup);
