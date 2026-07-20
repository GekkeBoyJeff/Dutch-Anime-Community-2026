import Avatar from '@/components/basics/Avatar';
import StatusBadge from '@/components/basics/StatusBadge';
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
				{discordId && <span className="con-note">Discord-ID {discordId}</span>}
				{role && <StatusBadge domain="request" status="active" label={role} />}
			</span>
		</div>
	</div>
);

export default ProfileHeader;
