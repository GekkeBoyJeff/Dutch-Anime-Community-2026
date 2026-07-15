import { REGISTRY } from '@/components/contentBlocks/Blocks';
import { humanise } from '@/lib/puck/fields';

// Block presets, sourced from the Storybook stories. Every story's `args` is a schema-shaped,
// human-curated fixture for exactly one block — reusing them keeps the builder's mock data and the
// component workshop permanently in sync (one source, no drift).

export interface BlockPreset {
	/** Human label derived from the story export name ('OnLight' → 'On light') */
	label: string;
	/** Schema-shaped props for the block: the story's args, sanitised for insertion */
	props: Record<string, unknown>;
}

type BlockType = keyof typeof REGISTRY;

interface StoryModule {
	default?: { component?: unknown };
	[storyExport: string]: unknown;
}

// Backfills a fresh id on array items that lack one: blocks whose item schemas require ids stay
// valid, and Zod's strip mode silently drops the key wherever an item schema doesn't model it.
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

/** Story args → insertable props: functions/JSX dropped via JSON, missing item ids backfilled. */
const sanitise = (args: object): Record<string, unknown> => {
	const plain = JSON.parse(JSON.stringify(args)) as Record<string, unknown>;
	return withItemIds(plain) as Record<string, unknown>;
};

const buildPresets = (): Partial<Record<BlockType, BlockPreset[]>> => {
	const typeByComponent = new Map<unknown, BlockType>(
		(Object.entries(REGISTRY) as [BlockType, unknown][]).map(([type, component]) => [component, type]),
	);

	const map: Partial<Record<BlockType, BlockPreset[]>> = {};
	const stories = require.context('../../stories/contentBlocks', false, /\.stories\.tsx$/);

	for (const key of stories.keys()) {
		const mod = stories(key) as StoryModule;
		const type = typeByComponent.get(mod.default?.component);
		if (!type) {
			continue; // library-only stories (PageHeader, ErrorState) aren't insertable blocks
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

/** The insert default for a block: its 'Default' story, or the first story that has args. */
export const defaultPresetFor = (type: string): Record<string, unknown> | undefined => {
	const list = presets[type as BlockType];
	const preferred = list?.find((preset) => preset.label === 'Default') ?? list?.[0];
	// Fresh ids per insert — presets are shared module data, instances must not share item ids.
	return preferred ? sanitise(preferred.props) : undefined;
};
