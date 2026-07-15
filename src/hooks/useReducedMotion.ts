'use client';

import { useSyncExternalStore } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

// Subscribe/snapshot for the reduced-motion media query. useSyncExternalStore is the right tool for
// reading an external, mutable browser store: no setState-in-effect, and the server snapshot keeps
// the first client render in sync (no hydration mismatch).
const subscribe = (onChange: () => void) => {
	const media = window.matchMedia(QUERY);
	media.addEventListener('change', onChange);

	return () => media.removeEventListener('change', onChange);
};

const getSnapshot = () => {
	return window.matchMedia(QUERY).matches;
};

const getServerSnapshot = () => {
	return false;
};

// Reads the user's reduced-motion preference for JS-driven motion (rAF loops, spring islands) that
// CSS `@media (prefers-reduced-motion)` can't gate.
const useReducedMotion = () => {
	return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};

export default useReducedMotion;
