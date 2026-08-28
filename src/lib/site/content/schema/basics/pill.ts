import { z } from 'zod';

import { InteractiveProps } from '@/lib/site/content/schema/basics/interactive';

export const PillProps = InteractiveProps.extend({
	value: z.string().min(1).describe('The pill\'s visible text'),
	count: z.number().optional().describe('Optional count of matching results shown beside the text'),
	active: z.boolean().optional().describe('Marks the pill as selected; defaults to false'),
}).meta({ title: 'Pill' });
export type PillProps = z.infer<typeof PillProps>;
