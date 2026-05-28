let scrollbarRevealTimer: number | undefined;
let scrollbarUpdateFrame = 0;
let scrollbarDragStartY = 0;
let scrollbarDragStartScrollY = 0;
let scrollbarDragging = false;

function revealPageScrollbar(delay = 900) {
	document.documentElement.classList.add("scrollbar-interacting");
	window.clearTimeout(scrollbarRevealTimer);
	scrollbarRevealTimer = window.setTimeout(() => {
		document.documentElement.classList.remove("scrollbar-interacting");
	}, delay);
}

export function updatePageScrollbar(): void {
	const scrollbar = document.getElementById("page-scrollbar");
	const thumb = document.getElementById("page-scrollbar-thumb");
	if (!scrollbar || !thumb) return;

	const scrollHeight = document.documentElement.scrollHeight;
	const clientHeight = document.documentElement.clientHeight;
	const scrollable = scrollHeight - clientHeight;
	if (scrollable <= 1) {
		scrollbar.classList.add("hidden");
		return;
	}

	scrollbar.classList.remove("hidden");
	const trackHeight = scrollbar.clientHeight;
	const thumbHeight = Math.max(
		48,
		Math.round((clientHeight / scrollHeight) * trackHeight),
	);
	const maxThumbTop = trackHeight - thumbHeight;
	const thumbTop = Math.round((window.scrollY / scrollable) * maxThumbTop);

	thumb.style.height = `${thumbHeight}px`;
	thumb.style.transform = `translate3d(0, ${thumbTop}px, 0)`;
}

function queuePageScrollbarUpdate() {
	if (scrollbarUpdateFrame) return;
	scrollbarUpdateFrame = window.requestAnimationFrame(() => {
		scrollbarUpdateFrame = 0;
		updatePageScrollbar();
	});
}

function handlePageScroll() {
	revealPageScrollbar();
	updatePageScrollbar();
}

export function setupPageScrollbar(): void {
	const scrollbar = document.getElementById("page-scrollbar");
	const thumb = document.getElementById("page-scrollbar-thumb");
	if (!scrollbar || !thumb || scrollbar.dataset.initialized) return;
	scrollbar.dataset.initialized = "true";

	thumb.addEventListener("pointerdown", (event) => {
		event.preventDefault();
		scrollbarDragging = true;
		scrollbarDragStartY = event.clientY;
		scrollbarDragStartScrollY = window.scrollY;
		scrollbar.classList.add("dragging");
		thumb.setPointerCapture(event.pointerId);
		revealPageScrollbar(10000);
	});

	thumb.addEventListener("pointermove", (event) => {
		if (!scrollbarDragging) return;

		const scrollHeight = document.documentElement.scrollHeight;
		const clientHeight = document.documentElement.clientHeight;
		const scrollable = scrollHeight - clientHeight;
		const thumbHeight = thumb.getBoundingClientRect().height;
		const maxThumbTop = scrollbar.clientHeight - thumbHeight;
		const delta = event.clientY - scrollbarDragStartY;
		const scrollDelta =
			maxThumbTop > 0 ? (delta / maxThumbTop) * scrollable : 0;

		window.scrollTo({
			top: scrollbarDragStartScrollY + scrollDelta,
			behavior: "auto",
		});
	});

	thumb.addEventListener("pointerup", (event) => {
		scrollbarDragging = false;
		scrollbar.classList.remove("dragging");
		thumb.releasePointerCapture(event.pointerId);
		revealPageScrollbar();
	});
}

window.addEventListener("scroll", handlePageScroll, { passive: true });
window.addEventListener("resize", queuePageScrollbarUpdate);
window.addEventListener(
	"pointermove",
	(event) => {
		const verticalGutter = 24;
		const horizontalGutter = 24;
		if (
			window.innerWidth - event.clientX <= verticalGutter ||
			window.innerHeight - event.clientY <= horizontalGutter
		) {
			revealPageScrollbar(1200);
		}
	},
	{ passive: true },
);

const backToTopBtn = document.getElementById("back-to-top-btn");
function scrollFunction() {
	if (backToTopBtn) {
		const threshold = 400;
		if (
			document.body.scrollTop > threshold ||
			document.documentElement.scrollTop > threshold
		) {
			backToTopBtn.classList.remove("hide");
		} else {
			backToTopBtn.classList.add("hide");
		}
	}
}
window.onscroll = scrollFunction;
