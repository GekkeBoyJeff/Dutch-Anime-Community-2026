import type { Ref } from 'react';

import Avatar from '@/components/basics/Avatar';
import Container from '@/components/basics/Container';
import Content from '@/components/basics/Content';
import HeadingGroup from '@/components/basics/HeadingGroup';
import Icon from '@/components/basics/Icon';
import Interactive from '@/components/basics/Interactive';
import Media from '@/components/basics/Media';
import Section from '@/components/basics/Section';
import Title from '@/components/basics/Title';
import VisuallyHidden from '@/components/basics/VisuallyHidden';
import Card from '@/components/components/Card';
import type { ProfileCardsProps } from '@/lib/content';

// First and last word's initial: 'Jeffrey de Vries' → 'JV', 'Pejowo' → 'P'.
const initials = (name: string): string => {
	const words = name.trim().split(/\s+/);
	const first = words[0]?.[0] ?? '';
	const last = words.length > 1 ? (words[words.length - 1]?.[0] ?? '') : '';
	return `${first}${last}`.toUpperCase();
};

// A wall of profile cards: a 4:5 portrait, a name and role, an optional bio and a row of social
// links. Composes the Card shell (variant 'bare' — these cards deliberately carry no surface).
// Generic by design — no domain coupling, so it suits a team page, contributors, speakers …
const ProfileCards = ({
	heading,
	columns = 3,
	items = [],
	anonymousLabel,
	colorset,
	ref,
}: ProfileCardsProps & { ref?: Ref<HTMLElement> }) => {
	// The anonymous card rides along as an ordinary card, always last: same weight as every named one,
	// which is the point — a footnote would rank it below them.
	const cards = anonymousLabel ? [...items, { id: 'anonymous', name: anonymousLabel, initials: '+' }] : items;
	return (
		<Section ref={ref} colorset={colorset} className="profile-cards">
			<Container>
				<HeadingGroup
					tagline={heading?.tagline}
					title={heading?.value}
					size={heading?.size}
					intro={heading?.intro}
					element="header"
					className="profile-cards-header"
				/>

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
								{item.text && <Content size="small" value={item.text} />}

								{item.socials && item.socials.length > 0 && (
									<ul className="profile-cards-socials">
										{item.socials.map((social, index) => (
											<li key={`${social.label}-${index}`}>
												<Interactive url={social.url} target="_blank" className="profile-cards-social">
													{social.icon ? (
														<>
															<Icon name={social.icon} />
															<VisuallyHidden>{social.label}</VisuallyHidden>
														</>
													) : (
														social.label
													)}
												</Interactive>
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
