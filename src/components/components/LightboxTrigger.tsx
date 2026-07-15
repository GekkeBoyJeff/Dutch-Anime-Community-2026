'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';

import VideoLightbox from '@/components/components/VideoLightbox';
import type { LightboxTriggerProps as LightboxTriggerSchemaProps } from '@/lib/content/schema/components/lightboxTrigger';

type LightboxTriggerProps = LightboxTriggerSchemaProps & {
	/** The trigger; receives the open callback — wire it to a Button's onClick */
	children: (open: () => void) => ReactNode;
};

// Opens the shared VideoLightbox from any clickable: the child render-prop receives the open
// callback, so a Button (or Pill, or a whole card) becomes a lightbox trigger without owning any
// dialog state itself.
const LightboxTrigger = ({ children, ...media }: LightboxTriggerProps) => {
	const [open, setOpen] = useState(false);

	return (
		<>
			{children(() => setOpen(true))}
			<VideoLightbox {...media} open={open} onClose={() => setOpen(false)} />
		</>
	);
};

export default LightboxTrigger;
