import type { PuckAction } from '@puckeditor/core';

// Hand-off between the drawer and the editor: Puck's Drawer.Item can only carry a component type,
// not props. Dragging a story preset records it here; the editor's onAction applies it to the item
// Puck just inserted. Module-level on purpose — drawer and editor live in separate React trees.

interface PendingPreset {
	type: string;
	props: Record<string, unknown>;
	at: number;
}

let pendingPreset: PendingPreset | null = null;

/** Called on pointer-down of a preset drawer item (a click that never drags simply expires). */
export const setPendingPreset = (type: string, props: Record<string, unknown>): void => {
	pendingPreset = { type, props, at: Date.now() };
};

/** Consumes the pending preset when it matches the inserted type and is fresh (drags take seconds). */
export const takePendingPreset = (type: string): Record<string, unknown> | null => {
	const preset = pendingPreset;
	pendingPreset = null;
	if (!preset || preset.type !== type || Date.now() - preset.at > 15_000) {
		return null;
	}
	return preset.props;
};

// The editor needs dispatch inside onAction (which receives none); the drawer renders inside Puck's
// context and registers it here.
export const dispatchRef: { current: ((action: PuckAction) => void) | null } = { current: null };
