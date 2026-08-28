import type { PuckAction } from '@puckeditor/core';

// Puck's Drawer.Item can only carry a component type, not props, so a dragged story preset is
// parked here. Module-level on purpose — drawer and editor live in separate React trees.

interface PendingPreset {
	type: string;
	props: Record<string, unknown>;
	at: number;
}

let pendingPreset: PendingPreset | null = null;

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

export const dispatchRef: { current: ((action: PuckAction) => void) | null } = { current: null };
