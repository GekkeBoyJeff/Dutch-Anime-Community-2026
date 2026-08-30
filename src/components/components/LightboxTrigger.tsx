'use client';

import { useState } from 'react';

import VideoLightbox from '@/components/components/VideoLightbox';
import type { LightboxTriggerProps as LightboxTriggerSchemaProps } from '@/lib/site/content/schema/components/lightboxTrigger';

type LightboxTriggerProps = LightboxTriggerSchemaProps;

const LightboxTrigger = ({
	children,
	...media
}: LightboxTriggerProps) => {
	const [open, setOpen] = useState(false);

	return (
		<>
			{children(() => setOpen(true))}
			<VideoLightbox {...media} open={open} onClose={() => setOpen(false)} />
		</>
	);
};

export default LightboxTrigger;
