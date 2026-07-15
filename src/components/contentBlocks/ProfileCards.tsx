import type { Ref } from 'react';

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

// A wall of profile cards: a 4:5 portrait, a name and role, an optional bio and a row of social
// links. Composes the Card shell (variant 'bare' — these cards deliberately carry no surface).
// Generic by design — no domain coupling, so it suits a team page, contributors, speakers …
const ProfileCards = ({
	heading,
	columns = 3,
	items = [],
	colorset,
	ref,
}: ProfileCardsProps & { ref?: Ref<HTMLElement> }) => {
	return (
		<Section ref={ref} colorset={colorset} className="profile-cards">
			<Container>
				<HeadingGroup
					tagline={heading?.tagline}
					title={heading?.value}
					size={heading?.size}
					intro={heading?.intro}
					element="header"
					className="header"
				/>

				<ul className="grid" style={{ '--columns': columns } as React.CSSProperties}>
					{items.map((item) => (
						<li key={item.id}>
							<Card
								variant="bare"
								className="profile-card"
								image={<Media type="image" src={item.image} alt={item.name} ratio="4 / 5" className="portrait" />}
								header={<Title element="h3" size={5} value={item.name} />}
							>
								{item.role && <Content element="p" className="role" value={item.role} />}
								{item.text && <Content size="small" value={item.text} />}

								{item.socials && item.socials.length > 0 && (
									<ul className="socials">
										{item.socials.map((social, index) => (
											<li key={`${social.label}-${index}`}>
												<Interactive url={social.url} target="_blank" className="social">
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
