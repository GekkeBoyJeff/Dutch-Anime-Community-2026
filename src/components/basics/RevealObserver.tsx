'use client';

import { useEffect } from 'react';

// Marks [data-reveal] elements as revealed once they scroll into view. The html[data-motion]
// attribute (set here, on mount) gates the hidden initial state, so content stays fully visible
// when JavaScript never runs and for crawlers; prefers-reduced-motion is handled in CSS.
// IntersectionObserver rootMargin/threshold: https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/IntersectionObserver
const RevealObserver = () => {
	useEffect(() => {
		const root = document.documentElement;
		root.setAttribute('data-motion', 'on');

		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						entry.target.classList.add('is-revealed');
						observer.unobserve(entry.target);
					}
				}
			},
			{ rootMargin: '0px 0px -10% 0px', threshold: 0.05 },
		);

		const observeAll = () => {
			document.querySelectorAll('[data-reveal]:not(.is-revealed)').forEach((element) => observer.observe(element));
		};

		observeAll();

		// Route changes swap the page content under <body>; pick up the fresh sections as they land.
		const mutations = new MutationObserver(observeAll);
		mutations.observe(document.body, { childList: true, subtree: true });

		return () => {
			observer.disconnect();
			mutations.disconnect();
			root.removeAttribute('data-motion');
		};
	}, []);

	return null;
};

export default RevealObserver;
