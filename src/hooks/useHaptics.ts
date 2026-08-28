'use client';

import { useCallback } from 'react';
import type { HapticInput } from 'web-haptics';
import { WebHaptics } from 'web-haptics';

// `debug: true` is the package's (oddly named) switch for its synthetic click SOUND. It is the only
// sound feature the package offers. Set it to false to go silent.
const SOUND = true;

let engine: WebHaptics | null = null;

// Browsers cap how many AudioContexts a page may open, so a per-component instance would start
// failing once enough controls had played a sound.
const getEngine = (): WebHaptics | null => {
	if (typeof window === 'undefined') {
		return null;
	}
	if (!engine) {
		engine = new WebHaptics({ debug: SOUND });
	}
	return engine;
};

const useHaptics = () => {
	const haptic = useCallback((pattern: HapticInput = 'selection') => {
		void getEngine()?.trigger(pattern);
	}, []);

	return { haptic };
};

export default useHaptics;
