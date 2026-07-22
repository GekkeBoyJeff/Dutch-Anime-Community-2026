import Avatar from '@/components/basics/Avatar';
import Badge from '@/components/basics/Badge';
import Title from '@/components/basics/Title';

export interface ProfileHeaderProps {
	name: string;
	avatarUrl?: string;
	role?: string;
	discordId?: string;
}

// The account page's identity strip: avatar, display name, and a small meta row (Discord id + role
// badge). A Server Component — nothing here needs a client boundary.
const ProfileHeader = ({ name, avatarUrl, role, discordId }: ProfileHeaderProps) => (
	<div className="profile-head">
		<Avatar src={avatarUrl} initials={name.slice(0, 2).toUpperCase()} size="l" alt="" />
		<div>
			<Title size={2}>{name}</Title>
			<span className="mod-meta">
				{discordId && <span className="field-note">Discord-ID {discordId}</span>}
				{/* The one branded chip on a profile page: this is whose page it is. Not a StatusBadge —
				    a role is an identity, and borrowing another domain's status would colour it like a
				    live request. */}
				{role && <Badge variant="primary">{role}</Badge>}
			</span>
		</div>
	</div>
);

export default ProfileHeader;
