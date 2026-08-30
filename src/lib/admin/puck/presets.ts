import { REGISTRY } from '@/components/contentBlocks/Blocks';
import { humanise } from '@/lib/admin/puck/fields';

export interface BlockPreset {
	label: string;
	props: Record<string, unknown>;
}

type BlockType = keyof typeof REGISTRY;

interface StoryModule {
	default?: { component?: unknown };
	[storyExport: string]: unknown;
}

// Backfills an id on every array item that lacks one: item schemas that require an id stay valid,
// and Zod's strip mode drops the key again wherever an item schema doesn't model it.
const withItemIds = (value: unknown): unknown => {
	if (Array.isArray(value)) {
		return value.map((item) =>
			item && typeof item === 'object' && !Array.isArray(item)
				? { id: crypto.randomUUID(), ...(withItemIds(item) as Record<string, unknown>) }
				: withItemIds(item),
		);
	}
	if (value && typeof value === 'object') {
		return Object.fromEntries(Object.entries(value).map(([key, sub]) => [key, withItemIds(sub)]));
	}
	return value;
};

// The JSON round-trip is deliberate: it drops the functions and JSX that story args may carry.
const sanitise = (args: object): Record<string, unknown> => {
	const plain = JSON.parse(JSON.stringify(args)) as Record<string, unknown>;
	return withItemIds(plain) as Record<string, unknown>;
};

const buildPresets = (): Partial<Record<BlockType, BlockPreset[]>> => {
	const typeByComponent = new Map<unknown, BlockType>(
		(Object.entries(REGISTRY) as [BlockType, unknown][]).map(([type, component]) => [component, type]),
	);

	const map: Partial<Record<BlockType, BlockPreset[]>> = {};
	const stories = require.context('../../../stories/contentBlocks', false, /\.stories\.tsx$/);

	for (const key of stories.keys()) {
		const mod = stories(key) as StoryModule;
		const type = typeByComponent.get(mod.default?.component);
		if (!type) {
			continue;
		}

		const blockPresets: BlockPreset[] = [];
		for (const [exportName, story] of Object.entries(mod)) {
			if (exportName === 'default' || !story || typeof story !== 'object') {
				continue;
			}
			const { args } = story as { args?: object };
			if (args && typeof args === 'object') {
				blockPresets.push({ label: humanise(exportName), props: sanitise(args) });
			}
		}
		if (blockPresets.length) {
			map[type] = blockPresets;
		}
	}

	return map;
};

export const presets = buildPresets();

export const defaultPresetFor = (type: string): Record<string, unknown> | undefined => {
	const list = presets[type as BlockType];
	const preferred = list?.find((preset) => preset.label === 'Default') ?? list?.[0];
	// Fresh ids per insert — presets are shared module data, instances must not share item ids.
	return preferred ? sanitise(preferred.props) : undefined;
};
