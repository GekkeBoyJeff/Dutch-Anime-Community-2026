'use client';

import { Dialog } from '@base-ui/react/dialog';
import { useEffect, useState } from 'react';

import Interactive from '@/components/basics/Interactive';
import Media from '@/components/basics/Media';
import VisuallyHidden from '@/components/basics/VisuallyHidden';
import { classNames } from '@/lib/shared/classNames';
import type { VideoLightboxProps as VideoLightboxSchemaProps } from '@/lib/site/content/schema/components/videoLightbox';

// Keep the media mounted until the close transition finishes, so the iframe/video doesn't pop out
// before the panel has faded. Matches $speed in the SCSS.
const CLOSE_DELAY = 200;

type VideoLightboxProps = VideoLightboxSchemaProps;

const VideoLightbox = ({
	open,
	onClose,
	provider,
	embedId,
	src,
	poster,
	title,
	closeLabel = 'Close',
	className,
}: VideoLightboxProps) => {
	const [mounted, setMounted] = useState(open);

	// Opening must mount immediately: sync during render (no effect) so the player is there to fade in.
	if (open && !mounted) {
		setMounted(true);
	}

	useEffect(() => {
		if (open) {
			return undefined;
		}

		const timer = window.setTimeout(() => setMounted(false), CLOSE_DELAY);
		return () => window.clearTimeout(timer);
	}, [open]);

	const isTikTok = provider === 'tiktok';
	const ratio = isTikTok ? '9 / 16' : '16 / 9';

	const frameStyle = poster && !provider ? { backgroundImage: `url(${poster})` } : undefined;

	return (
		<Dialog.Root open={open} onOpenChange={(next) => (next ? undefined : onClose())}>
			<Dialog.Portal>
				<Dialog.Backdrop className="video-lightbox-backdrop" />

				<Dialog.Popup className={classNames('video-lightbox', className)}>
					<Dialog.Title render={<VisuallyHidden value={title || 'Video'} />} />

					<Dialog.Close
						render={
							<Interactive className="video-lightbox-close" ariaLabel={closeLabel}>
								&times;
							</Interactive>
						}
					/>

					<div className="video-lightbox-frame" style={frameStyle}>
						{mounted &&
							(provider && embedId ? (
								<Media type="embed" provider={provider} embedId={embedId} alt={title} ratio={ratio} className="video-lightbox-player" />
							) : (
								src && <Media type="video" src={src} alt={title} ratio={ratio} className="video-lightbox-player" />
							))}
					</div>
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	);
};

export default VideoLightbox;
