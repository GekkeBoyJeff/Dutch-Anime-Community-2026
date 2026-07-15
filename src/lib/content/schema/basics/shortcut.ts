import { z } from 'zod';

export const ShortcutProps = z
	.object({
		keys: z.array(z.string()).optional().describe('The keys of the shortcut, e.g. [\'⌘\', \'K\']. A single-key array (or `children`) renders one key'),
		separator: z.string().optional().describe('Glyph shown between keys; defaults to \'+\''),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Shortcut' });
export type ShortcutProps = z.infer<typeof ShortcutProps>;
