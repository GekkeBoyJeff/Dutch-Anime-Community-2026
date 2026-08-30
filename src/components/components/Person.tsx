import Avatar from '@/components/basics/Avatar';
import Icon from '@/components/basics/Icon';
import Interactive from '@/components/basics/Interactive';
import Skeleton from '@/components/basics/Skeleton';
import { classNames } from '@/lib/shared/classNames';
import type { PersonProps as PersonSchemaProps, PersonStatus } from '@/lib/site/content/schema/components/person';

type PersonProps = PersonSchemaProps;

const STATUS_LABEL: Record<PersonStatus, string> = {
	online: 'Online',
	busy: 'Bezet',
	away: 'Afwezig',
	offline: 'Offline',
};

const Person = ({
	name,
	role,
	avatarUrl,
	initials,
	status,
	trailing,
	href,
	onClick,
	chevron,
	loading = false,
	className,
}: PersonProps) => {
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
			{chevron && !loading && <Icon name="chevron-right" className="person-chevron" />}
		</>
	);

	if (loading) {
		return (
			<div className={classNames('person', 'is-loading', className)} aria-hidden="true">
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
		<div className={classNames('person', className)}>
			{body}
		</div>
	);
};

export default Person;
