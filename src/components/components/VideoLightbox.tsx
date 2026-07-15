'use client';

import { Dialog } from '@base-ui/react/dialog';
import { useEffect, useState } from 'react';
import type { Ref } from 'react';

import Interactive from '@/components/basics/Interactive';
import Media from '@/components/basics/Media';
import VisuallyHidden from '@/components/basics/VisuallyHidden';
import { classNames } from '@/lib/classNames';
import type { VideoLightboxProps as VideoLightboxSchemaProps } from '@/lib/content/schema/components/videoLightbox';

// Keep the media mounted until the close transition finishes, so the iframe/video doesn't pop out
// before the panel has faded. Matches $speed in the SCSS.
const CLOSE_DELAY = 200;

type VideoLightboxProps = VideoLightboxSchemaProps & {
	/** Called when the user dismisses it (close button, backdrop or Escape) */
	onClose: () => void;
};

// Fullscreen media overlay for an embed or a native video. Routes to the shared Media primitive
// (embed vs video) so playback behaviour stays in one place, and delays unmounting the player until
// the close transition ends. TikTok is forced to a 9:16 frame; everything else defaults to 16:9.
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
	ref,
}: VideoLightboxProps & { ref?: Ref<HTMLDivElement> }) => {
	// Tracks whether the player should be in the tree. Lags `open` on close by CLOSE_DELAY.
	const [mounted, setMounted] = useState(open);

	// Opening must mount immediately: sync during render (no effect) so the player is there to fade in.
	if (open && !mounted) {
		setMounted(true);
	}

	// Closing keeps the player mounted until the close transition has run, then unmounts it.
	useEffect(() => {
		if (open) {
			return undefined;
		}

		const timer = window.setTimeout(() => setMounted(false), CLOSE_DELAY);
		return () => window.clearTimeout(timer);
	}, [open]);

	const isTikTok = provider === 'tiktok';
	const ratio = isTikTok ? '9 / 16' : '16 / 9';

	// A poster only applies to native video; show it as the frame backdrop so the panel doesn't flash
	// empty before the (delay-mounted) player paints.
	const frameStyle = poster && !provider ? { backgroundImage: `url(${poster})` } : undefined;

	return (
		<Dialog.Root open={open} onOpenChange={(next) => (next ? undefined : onClose())}>
			<Dialog.Portal>
				<Dialog.Backdrop className="video-lightbox-backdrop" />

				<Dialog.Popup ref={ref} className={classNames('video-lightbox', className)}>
					<Dialog.Title render={<VisuallyHidden />}>{title || 'Video'}</Dialog.Title>

					<Dialog.Close
						render={
							<Interactive className="close" aria-label={closeLabel}>
								&times;
							</Interactive>
						}
					/>

					<div className="frame" style={frameStyle}>
						{mounted &&
							(provider && embedId ? (
								<Media type="embed" provider={provider} embedId={embedId} alt={title} ratio={ratio} className="player" />
							) : (
								src && <Media type="video" src={src} alt={title} ratio={ratio} className="player" />
							))}
					</div>
				</Dialog.Popup>
			</Dialog.Portal>
		</Dialog.Root>
	);
};

export default VideoLightbox;
