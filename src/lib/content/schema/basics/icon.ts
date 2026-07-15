import { z } from 'zod';

// The glyph name, e.g. 'search' or 'chevron-down' — see the ICONS map for the set. `className` is
// included as it is a plain string prop on the underlying svg; the rest of the SVG passthrough stays TS-only.
export const IconProps = z
	.object({
		name: z.string().min(1).describe('The glyph name, e.g. \'search\' or \'chevron-down\' — see the ICONS map for the set'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Icon' });
export type IconProps = z.infer<typeof IconProps>;
