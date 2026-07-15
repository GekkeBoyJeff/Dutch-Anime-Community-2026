import { z } from 'zod';

import { Colorset, Id } from '@/lib/content/schema/primitives';

export const ProseProps = z.object({
	colorset: Colorset.optional().describe('Light/dark theme applied to the surrounding section'),
	value: z.string().min(1).describe('Long-form HTML content rendered inside the .prose-styled div').meta({ editor: 'richtext' }),
}).meta({ title: 'Prose' });
export type ProseProps = z.infer<typeof ProseProps>;

// Component props = the block minus the keys Blocks strips before spreading (`type` selects the
// component, `id` becomes the React key).
export const ProseBlock = ProseProps.extend({ type: z.literal('prose'), id: Id.optional() });
export type ProseBlock = z.infer<typeof ProseBlock>;
