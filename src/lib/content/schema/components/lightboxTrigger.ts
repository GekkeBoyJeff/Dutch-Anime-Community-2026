import { z } from 'zod';

import { VideoLightboxProps } from '@/lib/content/schema/components/videoLightbox';

// Props for the LightboxTrigger component: the media fields of VideoLightbox (the trigger owns the
// open state itself, so `open` drops out); the trigger element comes in as a render-prop child.
export const LightboxTriggerProps = VideoLightboxProps.omit({ open: true }).meta({ title: 'LightboxTrigger' });
export type LightboxTriggerProps = z.infer<typeof LightboxTriggerProps>;
