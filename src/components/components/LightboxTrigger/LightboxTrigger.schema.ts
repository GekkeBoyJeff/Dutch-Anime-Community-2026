import type { ReactNode } from 'react';
import { z } from 'zod';

import { VideoLightboxProps } from '@/components/components/VideoLightbox/VideoLightbox.schema';

export const LightboxTriggerProps = VideoLightboxProps.omit({ open: true, onClose: true })
	.extend({
		children: z.custom<(open: () => void) => ReactNode>().describe('Render prop handed the opener; returns the element that opens the lightbox'),
	})
	.meta({ title: 'LightboxTrigger' });
export type LightboxTriggerProps = z.infer<typeof LightboxTriggerProps>;
