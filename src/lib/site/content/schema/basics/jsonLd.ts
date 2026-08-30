import { z } from 'zod';

export const JsonLdProps = z
	.object({
		data: z.custom<unknown>().describe('The schema.org node (or @graph wrapper) serialised into the script tag'),
	})
	.meta({ title: 'JsonLd' });
export type JsonLdProps = z.infer<typeof JsonLdProps>;
