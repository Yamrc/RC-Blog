export function initMathScrollbars(): void {
	const katexElements = document.querySelectorAll(
		".katex-display",
	) as NodeListOf<HTMLElement>;
	if (katexElements.length === 0) return;

	const katexObserverOptions = {
		root: null,
		rootMargin: "100px",
		threshold: 0.1,
	};

	const processKatexElement = (element: HTMLElement) => {
		if (!element.parentNode) return;
		if (element.hasAttribute("data-scrollbar-initialized")) return;

		const container = document.createElement("div");
		container.className = "katex-display-container";
		container.setAttribute("aria-label", "scrollable container for formulas");

		element.parentNode.insertBefore(container, element);
		container.appendChild(element);

		element.setAttribute("data-scrollbar-initialized", "true");
	};

	const katexObserver = new IntersectionObserver((entries, observer) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				processKatexElement(entry.target as HTMLElement);
				observer.unobserve(entry.target);
			}
		});
	}, katexObserverOptions);

	katexElements.forEach((element) => {
		katexObserver.observe(element);
	});
}
