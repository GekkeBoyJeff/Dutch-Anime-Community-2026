import type { Ref } from 'react';

import Icon from '@/components/basics/Icon';
import Interactive from '@/components/basics/Interactive';
import type { InteractiveRef } from '@/components/basics/Interactive';
import Skeleton from '@/components/basics/Skeleton';
import { classNames } from '@/lib/classNames';

export interface NotificationBellProps {
	/** Unread count; ignored while `loading` */
	count: number;
	/** Reserves the badge slot with a skeleton instead of the count */
	loading?: boolean;
	/** Where the bell links to */
	href: string;
	/** Accessible label */
	label: string;
	className?: string;
}

// Unread-notification bell: a bell glyph with a small overflowing count badge (capped at '9+').
// Zero-CLS — the count slot keeps its size while loading, so resolving the number never nudges
// surrounding layout. Presentational; the caller owns the count query.
const NotificationBell = ({ count, loading = false, href, label, className, ref }: NotificationBellProps & { ref?: Ref<InteractiveRef> }) => (
	<Interactive ref={ref} url={href} className={classNames('notification-bell', className)} aria-label={label}>
		<Icon name="bell" className="notification-bell-icon" />
		<span className="notification-bell-count" aria-hidden="true">
			{loading ? <Skeleton width="1.1rem" height="1.1rem" circle /> : count > 0 ? <span className="notification-bell-badge">{count > 9 ? '9+' : count}</span> : null}
		</span>
	</Interactive>
);

export default NotificationBell;
