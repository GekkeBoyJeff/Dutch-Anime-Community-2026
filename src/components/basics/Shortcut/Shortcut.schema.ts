import { z } from 'zod';

export const ShortcutProps = z
	.object({
		keys: z.array(z.string()).optional().describe('The keys of the shortcut, e.g. [\'⌘\', \'K\']'),
		separator: z.string().optional().describe('Glyph shown between keys; defaults to \'+\''),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Shortcut' });
export type ShortcutProps = z.infer<typeof ShortcutProps>;
