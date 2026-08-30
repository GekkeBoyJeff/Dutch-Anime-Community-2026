'use client';

import { useEffect } from 'react';

// The page scrolls inside .page-frame when present (the body only scrolls in contexts without the
// frame, like Storybook), so both get locked.
const useOverlay = (isOpen: boolean, onClose?: () => void) => {
	useEffect(() => {
		if (!isOpen) {
			return undefined;
		}

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
			if (event.key === 'Escape') {
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
	}, [isOpen, onClose]);
};

export default useOverlay;
