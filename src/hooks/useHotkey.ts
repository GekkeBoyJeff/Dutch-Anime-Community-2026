'use client';

import { useEffect } from 'react';

type HotkeyHandler = (event: KeyboardEvent) => void;

// Module-level singleton: one global keydown listener serves every registration, so binding the
// same chord in several components does not stack listeners.
const handlers = new Map<string, HotkeyHandler>();
let listening = false;

// Normalises a key press into a chord string, e.g. "mod+k" (mod = ⌘ or Ctrl).
const chordFromEvent = (event: KeyboardEvent): string => {
	const parts: string[] = [];

	if (event.metaKey || event.ctrlKey) {
		parts.push('mod');
	}
	if (event.shiftKey) {
		parts.push('shift');
	}
	if (event.altKey) {
		parts.push('alt');
	}

	parts.push(event.key.toLowerCase());

	return parts.join('+');
};

const onKeydown = (event: KeyboardEvent) => {
	const handler = handlers.get(chordFromEvent(event));
	if (!handler) {
		return;
	}

	event.preventDefault();
	handler(event);
};

const useHotkey = (shortcut: string, handler: HotkeyHandler) => {
	useEffect(() => {
		const chord = shortcut.toLowerCase();
		handlers.set(chord, handler);

		if (!listening) {
			window.addEventListener('keydown', onKeydown);
			listening = true;
		}

		return () => {
			handlers.delete(chord);
		};
	}, [shortcut, handler]);
};

export default useHotkey;
