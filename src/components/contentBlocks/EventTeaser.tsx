import type { Ref } from 'react';

import Container from '@/components/basics/Container';
import Content from '@/components/basics/Content';
import HeadingGroup from '@/components/basics/HeadingGroup';
import Interactive from '@/components/basics/Interactive';
import Section from '@/components/basics/Section';
import EventCard from '@/components/components/EventCard';
import type { EventTeaserProps } from '@/lib/content';

// A single-column teaser list: a heading cluster, an optional intro, a dense stack of compact event
// cards and an optional "view all" link. A presentational section — every event arrives via props.
const EventTeaser = ({
	heading,
	description,
	events = [],
	viewAllUrl,
	viewAllLabel = 'View all',
	colorset,
	ref,
}: EventTeaserProps & { ref?: Ref<HTMLElement> }) => {
	return (
		<Section ref={ref} colorset={colorset} className="event-teaser">
			<Container className="event-teaser-inner">
				{(heading || description) && (
					<header className="header">
						<HeadingGroup
							tagline={heading?.tagline}
							title={heading?.value}
							size={heading?.size}
							intro={heading?.intro}
						/>
						{description && <Content className="description" value={description} />}
					</header>
				)}

				<ul className="list">
					{events.map((event) => (
						<li key={event.id} className="item">
							<EventCard {...event} className="is-compact" />
						</li>
					))}
				</ul>

				{viewAllUrl && (
					<footer className="event-teaser-footer">
						<Interactive url={viewAllUrl} className="view-all">
							{viewAllLabel}
						</Interactive>
					</footer>
				)}
			</Container>
		</Section>
	);
};

export default EventTeaser;
