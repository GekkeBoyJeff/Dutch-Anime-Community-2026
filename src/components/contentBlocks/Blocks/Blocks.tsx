import { RENDERERS } from '@/components/contentBlocks/Blocks/Blocks.registry.generated';
import type { Block } from '@/lib/site/content/document';

type BlocksProps = {
	blocks?: Block[];
};

type BlockRenderProps = {
	eager?: boolean;
};

type BlockRenderer<BlockData> = React.ComponentType<BlockData & BlockRenderProps>;

type BlockRenderers = {
	[B in Block as B['type']]: BlockRenderer<Omit<B, 'type' | 'id'>>;
};

// Typed on assignment, so a component whose props drifted from its own schema fails to compile.
export const REGISTRY: BlockRenderers = RENDERERS;

const Blocks = ({ blocks = [] }: BlocksProps) => {
	return blocks.map(({ type, id, ...props }, index) => {
		const Renderer = REGISTRY[type] as BlockRenderer<typeof props>;

		return <Renderer key={id ?? `${type}-${index}`} {...props} eager={index === 0} />;
	});
};

export default Blocks;
