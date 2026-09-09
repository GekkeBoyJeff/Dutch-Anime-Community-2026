import { z } from 'zod';

import { InteractiveProps } from '@/lib/site/content/schema/basics/interactive';

export const ButtonProps = InteractiveProps.extend({
	value: z.string().optional().describe('The button\'s visible text; omit only for an icon-only button that carries its own aria-label'),
	variant: z.enum(['primary', 'secondary', 'ghost']).optional().describe('Visual variant; primary always carries the brand colour; defaults to primary'),
	icon: z.string().optional().describe('Icon name rendered after the text').meta({ editor: 'icon' }),
}).meta({ title: 'Button' });
export type ButtonProps = z.infer<typeof ButtonProps>;
