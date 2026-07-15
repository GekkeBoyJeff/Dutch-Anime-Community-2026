import { z } from 'zod';

import { InteractiveProps } from '@/lib/content/schema/basics/interactive';

export const PillProps = InteractiveProps.extend({
	active: z.boolean().optional().describe('Marks the pill as selected; defaults to false'),
}).meta({ title: 'Pill' });
export type PillProps = z.infer<typeof PillProps>;
