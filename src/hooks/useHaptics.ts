'use client';

import { useCallback } from 'react';
import type { HapticInput, TriggerOptions } from 'web-haptics';
import { WebHaptics } from 'web-haptics';

// One shared engine for the whole app. A single instance means one AudioContext and one hidden switch
// element instead of one per component — browsers cap how many AudioContexts a page may open, so a
// per-component instance would start failing once enough controls had played a sound.
//
// `debug: true` is the package's (oddly named) switch for its synthetic click SOUND: a short filtered
// noise burst played with each haptic. It is the only sound feature the package offers. Set it to false
// to go silent. The sound also gives feedback where the haptic itself can't fire (iOS 26.5+, desktop).
const SOUND = true;

let engine: WebHaptics | null = null;

const getEngine = (): WebHaptics | null => {
	if (typeof window === 'undefined') {
		return null;
	}
	if (!engine) {
		engine = new WebHaptics({ debug: SOUND });
	}
	return engine;
};

// Haptic + sound feedback, powered by web-haptics (haptics.lochie.me). The haptic is the Vibration API
// on Android; iPhones used Safari's switch tap until Apple removed it in iOS 26.5. `trigger` takes a
// preset name, a duration in ms, an array, or a custom pattern; preset names: selection, light, medium,
// heavy, soft, rigid, success, warning, error, nudge, buzz — all listed in the "7. Hooks" story.
// `cancel` stops a running pattern; `isSupported` reports Vibration API support.
const useHaptics = () => {
	// Shorthand for a plain tap; defaults to 'selection', a light crisp tick.
	const haptic = useCallback((pattern: HapticInput = 'selection') => {
		void getEngine()?.trigger(pattern);
	}, []);

	const trigger = useCallback(
		(pattern?: HapticInput, options?: TriggerOptions) => getEngine()?.trigger(pattern, options),
		[],
	);
	const cancel = useCallback(() => getEngine()?.cancel(), []);

	return { haptic, trigger, cancel, isSupported: WebHaptics.isSupported };
};

export default useHaptics;
