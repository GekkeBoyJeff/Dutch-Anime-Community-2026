'use client';

import React, { useState, useSyncExternalStore } from 'react';

import Button from '@/components/basics/Button';
import Content from '@/components/basics/Content';
import Interactive from '@/components/basics/Interactive';
import useReducedMotion from '@/hooks/useReducedMotion';
import { classNames } from '@/lib/shared/classNames';
import type { AnnouncementBarProps as AnnouncementBarSchemaProps, AnnouncementVariant } from '@/lib/site/content/schema/structures/announcementBar';

export type { AnnouncementVariant };

type AnnouncementBarProps = AnnouncementBarSchemaProps;

const STORAGE_PREFIX = 'announcement-dismissed:';

// The server snapshot is always "not dismissed", so the banner renders server-side and only hides on
// the client once we know it was closed — reading localStorage there is a hydration mismatch.
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

const AnnouncementBar = ({
	message,
	cta,
	variant = 'info',
	dismissible = true,
	id,
	className,
}: AnnouncementBarProps) => {
	const reducedMotion = useReducedMotion();
	const snapshots = React.useMemo(() => (id ? makeSnapshots(id) : { get: () => false, server: () => false }), [id]);
	const persistedDismissed = useSyncExternalStore(subscribe, snapshots.get, snapshots.server);

	const [closed, setClosed] = useState(false);
	const [leaving, setLeaving] = useState(false);

	const dismiss = () => {
		if (id) {
			window.localStorage.setItem(`${STORAGE_PREFIX}${id}`, '1');
		}

		// With no slide-out transition there is no transitionend to wait for, so close right away.
		if (reducedMotion) {
			setClosed(true);
			return;
		}

		setLeaving(true);
	};

	const onLeaveEnd = () => {
		if (leaving) {
			setClosed(true);
		}
	};

	if (closed || persistedDismissed) {
		return null;
	}

	return (
		<div
			role="region"
			aria-label="Announcement"
			aria-live="polite"
			className={classNames('announcement-bar', `is-${variant}`, leaving && 'is-leaving', className)}
			onTransitionEnd={onLeaveEnd}
		>
			<div className="announcement-bar-content">
				<Content element="p" className="announcement-bar-message" value={message} />

				{cta?.value && (
					<Button url={cta.url} target={cta.target} variant={cta.variant ?? 'ghost'} icon={cta.icon} value={cta.value} className="announcement-bar-cta" />
				)}
			</div>

			{dismissible && (
				<Interactive className="announcement-bar-close" ariaLabel="Dismiss announcement" onClick={dismiss}>
					<span aria-hidden="true">&times;</span>
				</Interactive>
			)}
		</div>
	);
};

export default AnnouncementBar;
