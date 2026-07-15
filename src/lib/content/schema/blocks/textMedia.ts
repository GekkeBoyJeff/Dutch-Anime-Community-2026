import { z } from 'zod';

import { Colorset, Id, Media } from '@/lib/content/schema/primitives';

export const TextMediaProps = z.object({
	colorset: Colorset.optional().describe('Light/dark theme applied to the surrounding section'),
	title: z.string().optional().describe('Heading rendered above the body text'),
	text: z.string().optional().describe('Body copy rendered below the title').meta({ editor: 'richtext' }),
	media: Media.optional().describe('Image, video, or embed rendered alongside the text'),
	reverse: z.boolean().optional().describe('When true, swaps the media to appear before the text column on tablet screens and up'),
}).meta({ title: 'TextMedia' });
export type TextMediaProps = z.infer<typeof TextMediaProps>;

// Component props = the block minus the keys Blocks strips before spreading (`type` selects the
// component, `id` becomes the React key).
export const TextMediaBlock = TextMediaProps.extend({ type: z.literal('textMedia'), id: Id.optional() });
export type TextMediaBlock = z.infer<typeof TextMediaBlock>;
