import type { ReactNode } from 'react';

import Avatar from '@/components/basics/Avatar';
import Icon from '@/components/basics/Icon';

export interface AvatarRowProps {
	initials: string;
	avatarUrl?: string | null;
	title: ReactNode;
	subtitle?: ReactNode;
	badges?: ReactNode;
	warnings?: ReactNode;
	onClick: () => void;
	chevron?: boolean;
}

/**
 * A tappable roster row: an avatar, a title over an optional subtitle, optional badge and warning slots,
 * and a trailing chevron. Presentational — the caller supplies the slot content and the click handler.
 */
const AvatarRow = ({ initials, avatarUrl, title, subtitle, badges, warnings, onClick, chevron = true }: AvatarRowProps) => (
	<button type="button" className="avatar-row" onClick={onClick}>
		<Avatar size="m" initials={initials} src={avatarUrl ?? undefined} />
		<span className="ident">
			<span className="name">{title}</span>
			{subtitle !== undefined && <span className="sub">{subtitle}</span>}
		</span>
		{badges !== undefined && <span className="badges">{badges}</span>}
		{warnings !== undefined && <span className="warnings">{warnings}</span>}
		{chevron && <Icon name="chevron-right" className="chevron" aria-hidden="true" />}
	</button>
);

export default AvatarRow;
