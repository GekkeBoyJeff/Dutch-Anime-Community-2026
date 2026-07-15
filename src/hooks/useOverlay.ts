'use client';

import { useEffect } from 'react';

interface UseOverlayOptions {
	closeOnEscape?: boolean;
}

// Central overlay lifecycle for Modal, Drawer and the video lightbox: locks page scroll while the
// overlay is open and restores it on close, with opt-in Escape-to-close. The page scrolls inside
// .page-frame when present (the body only scrolls in contexts without the frame, like Storybook),
// so both get locked.
const useOverlay = (isOpen: boolean, onClose?: () => void, { closeOnEscape = true }: UseOverlayOptions = {}) => {
	useEffect(() => {
		if (!isOpen) {
			return undefined;
		}

		// Store the current values and offset the scrollbar width to avoid layout shift.
		const frame = document.querySelector<HTMLElement>('.page-frame-scroll');
		const previous = {
			overflow: document.body.style.overflow,
			paddingRight: document.body.style.paddingRight,
			frameOverflow: frame?.style.overflowY ?? '',
			framePadding: frame?.style.paddingRight ?? '',
		};
		const scrollbar = frame
			? frame.offsetWidth - frame.clientWidth
			: window.innerWidth - document.documentElement.clientWidth;

		document.body.style.overflow = 'hidden';
		if (frame) {
			frame.style.overflowY = 'hidden';
		}
		if (scrollbar > 0) {
			(frame ?? document.body).style.paddingRight = `${scrollbar}px`;
		}

		const onKeydown = (event: KeyboardEvent) => {
			if (closeOnEscape && event.key === 'Escape') {
				onClose?.();
			}
		};
		document.addEventListener('keydown', onKeydown);

		return () => {
			document.body.style.overflow = previous.overflow;
			document.body.style.paddingRight = previous.paddingRight;
			if (frame) {
				frame.style.overflowY = previous.frameOverflow;
				frame.style.paddingRight = previous.framePadding;
			}
			document.removeEventListener('keydown', onKeydown);
		};
	}, [isOpen, onClose, closeOnEscape]);
};

export default useOverlay;
