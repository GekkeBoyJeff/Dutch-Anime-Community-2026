'use client';

import React, { useState, useSyncExternalStore } from 'react';
import type { ReactNode, Ref } from 'react';

import Interactive from '@/components/basics/Interactive';
import useReducedMotion from '@/hooks/useReducedMotion';
import { classNames } from '@/lib/classNames';
import type { AnnouncementDismissProps as AnnouncementDismissSchemaProps } from '@/lib/content/schema/structures/announcementDismiss';

type AnnouncementDismissProps = AnnouncementDismissSchemaProps & {
	/** Fires once the slide-out finishes */
	onDismiss?: () => void;
	/** The server-rendered message and CTA */
	children?: ReactNode;
};

const STORAGE_PREFIX = 'announcement-dismissed:';

// Reads the persisted dismissal as an external store: the server snapshot is always "not dismissed",
// so the banner renders server-side and only hides on the client once we know it was closed — no
// hydration mismatch. Subscribing to the cross-tab `storage` event hides it in other tabs too.
// https://react.dev/reference/react/useSyncExternalStore#adding-support-for-server-rendering
const subscribe = (callback: () => void) => {
	window.addEventListener('storage', callback);
	return () => window.removeEventListener('storage', callback);
};

const makeSnapshots = (id: string) => {
	return {
		get: () => window.localStorage.getItem(`${STORAGE_PREFIX}${id}`) === '1',
		server: () => false,
	};
};

// The interactive wrapper for AnnouncementBar: holds the open/leaving state, the close button, and
// the per-id persistence. Kept small — the message and CTA are passed in as server-rendered children.
const AnnouncementDismiss = ({
	variant = 'info',
	dismissible = true,
	id,
	onDismiss,
	className,
	children,
	ref,
}: AnnouncementDismissProps & { ref?: Ref<HTMLDivElement> }) => {
	const reducedMotion = useReducedMotion();
	const snapshots = React.useMemo(() => (id ? makeSnapshots(id) : { get: () => false, server: () => false }), [id]);
	const persistedDismissed = useSyncExternalStore(subscribe, snapshots.get, snapshots.server);

	// In-session close (and the slide-out) are local; the persisted flag covers reloads.
	const [closed, setClosed] = useState(false);
	const [leaving, setLeaving] = useState(false);

	const dismiss = () => {
		if (id) {
			window.localStorage.setItem(`${STORAGE_PREFIX}${id}`, '1');
		}

		// With no slide-out transition there is no transitionend to wait for, so close right away.
		if (reducedMotion) {
			setClosed(true);
			onDismiss?.();
			return;
		}

		setLeaving(true);
	};

	const onLeaveEnd = () => {
		if (leaving) {
			setClosed(true);
			onDismiss?.();
		}
	};

	if (closed || persistedDismissed) {
		return null;
	}

	return (
		<div
			ref={ref}
			role="region"
			aria-label="Announcement"
			aria-live="polite"
			className={classNames('announcement-bar', `is-${variant}`, leaving && 'is-leaving', className)}
			onTransitionEnd={onLeaveEnd}
		>
			<div className="content">{children}</div>

			{dismissible && (
				<Interactive className="close" aria-label="Dismiss announcement" onClick={dismiss}>
					<span aria-hidden="true">&times;</span>
				</Interactive>
			)}
		</div>
	);
};

export default AnnouncementDismiss;
