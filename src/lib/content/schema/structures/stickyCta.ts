import { z } from 'zod';

// The fixed action bar on small screens. It carries no label or destination of its own: it shows the
// navigation's call to action, so the one conversion goal cannot drift into two different buttons.
export const StickyCtaProps = z
	.object({
		excludePaths: z
			.array(z.string())
			.optional()
			.describe('Paths where the bar stays hidden because that page asks something else of the visitor, e.g. [\'/supporters\']'),
	})
	.meta({ title: 'StickyCta' });
export type StickyCtaProps = z.infer<typeof StickyCtaProps>;
