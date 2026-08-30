import Avatar from '@/components/basics/Avatar';
import Container from '@/components/basics/Container';
import Content from '@/components/basics/Content';
import HeadingGroup from '@/components/basics/HeadingGroup';
import Interactive from '@/components/basics/Interactive';
import Media from '@/components/basics/Media';
import Section from '@/components/basics/Section';
import Title from '@/components/basics/Title';
import Card from '@/components/components/Card';
import type { ProfileCardsProps as ProfileCardsSchemaProps } from '@/lib/site/content/schema/blocks/profileCards';

type ProfileCardsProps = ProfileCardsSchemaProps;

const initials = (name: string): string => {
	const words = name.trim().split(/\s+/);
	const first = words[0]?.[0] ?? '';
	const last = words.length > 1 ? (words[words.length - 1]?.[0] ?? '') : '';
	return `${first}${last}`.toUpperCase();
};

const ProfileCards = ({
	heading,
	columns = 3,
	items = [],
	anonymousLabel,
	colorset,
}: ProfileCardsProps) => {
	const cards = anonymousLabel ? [...items, { id: 'anonymous', name: anonymousLabel, initials: '+' }] : items;
	return (
		<Section colorset={colorset} className="profile-cards">
			<Container>
				<HeadingGroup {...heading} element="header" className="profile-cards-header" />

				<ul className="profile-cards-grid" style={{ '--columns': columns } as React.CSSProperties}>
					{cards.map((item) => (
						<li key={item.id}>
							<Card
								variant="bare"
								className="profile-cards-profile-card"
								image={
									item.image ? (
										<Media type="image" src={item.image} alt={item.name} ratio="4 / 5" className="profile-cards-portrait" />
									) : (
										<Avatar size="l" initials={item.initials || initials(item.name)} />
									)
								}
								header={<Title element="h3" size={5} value={item.name} />}
							>
								{item.role && <Content element="p" className="profile-cards-role" value={item.role} />}
								{item.value && <Content size="small" value={item.value} />}

								{item.socials && item.socials.length > 0 && (
									<ul className="profile-cards-socials">
										{item.socials.map((social, index) => (
											<li key={`${social.label}-${index}`}>
												<Interactive
													url={social.url}
													target="_blank"
													className="profile-cards-social"
													icon={social.icon}
													value={social.label}
												/>
											</li>
										))}
									</ul>
								)}
							</Card>
						</li>
					))}
				</ul>
			</Container>
		</Section>
	);
};

export default ProfileCards;
