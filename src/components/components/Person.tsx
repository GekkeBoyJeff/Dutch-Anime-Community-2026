import type { ReactNode, Ref } from 'react';

import Avatar from '@/components/basics/Avatar';
import Icon from '@/components/basics/Icon';
import Interactive from '@/components/basics/Interactive';
import Skeleton from '@/components/basics/Skeleton';
import { classNames } from '@/lib/classNames';

export type PersonStatus = 'online' | 'busy' | 'away' | 'offline';

export interface PersonProps {
	name: string;
	/** Role or function, shown under the name */
	role?: ReactNode;
	avatarUrl?: string | null;
	/** Falls back to the first two letters of `name` */
	initials?: string;
	/** Presence dot on the avatar; omit when presence is not tracked */
	status?: PersonStatus;
	/** Trailing slot — badges, a count, a row action */
	trailing?: ReactNode;
	href?: string;
	onClick?: () => void;
	/** Shows a chevron when the row leads somewhere */
	chevron?: boolean;
	loading?: boolean;
	className?: string;
}

const STATUS_LABEL: Record<PersonStatus, string> = {
	online: 'Online',
	busy: 'Bezet',
	away: 'Afwezig',
	offline: 'Offline',
};

// A human, shown as a human. The organisation is people; rendering them as bare strings is what makes
// a roster read as a database dump.
const Person = ({ name, role, avatarUrl, initials, status, trailing, href, onClick, chevron, loading = false, className, ref }: PersonProps & { ref?: Ref<HTMLDivElement> }) => {
	const body = (
		<>
			<span className={classNames('person-avatar', status && `is-${status}`)}>
				<Avatar size="m" src={avatarUrl ?? undefined} initials={initials ?? name.slice(0, 2).toUpperCase()} alt="" />
				{status && <span className="person-status" title={STATUS_LABEL[status]} />}
			</span>
			<span className="person-info">
				<span className="person-name">{loading ? <Skeleton height="0.95rem" width="7rem" /> : name}</span>
				{(role !== undefined || loading) && <span className="person-role">{loading ? <Skeleton height="0.8rem" width="4.5rem" /> : role}</span>}
			</span>
			{trailing !== undefined && !loading && <span className="person-trailing">{trailing}</span>}
			{chevron && !loading && <Icon name="chevron-right" className="person-chevron" aria-hidden="true" />}
		</>
	);

	if (loading) {
		return (
			<div ref={ref} className={classNames('person', 'is-loading', className)} aria-hidden="true">
				{body}
			</div>
		);
	}

	if (href) {
		return (
			<Interactive url={href} className={classNames('person', 'is-interactive', className)}>
				{body}
			</Interactive>
		);
	}

	if (onClick) {
		return (
			<button type="button" className={classNames('person', 'is-interactive', className)} onClick={onClick}>
				{body}
			</button>
		);
	}

	return (
		<div ref={ref} className={classNames('person', className)}>
			{body}
		</div>
	);
};

export default Person;
