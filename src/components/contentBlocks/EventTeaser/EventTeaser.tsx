import Container from '@/components/basics/Container/Container';
import Content from '@/components/basics/Content/Content';
import HeadingGroup from '@/components/basics/HeadingGroup/HeadingGroup';
import Interactive from '@/components/basics/Interactive/Interactive';
import Section from '@/components/basics/Section/Section';
import EventCard from '@/components/components/EventCard/EventCard';

import type { EventTeaserProps as EventTeaserSchemaProps } from './EventTeaser.schema';

import './EventTeaser.scss';

type EventTeaserProps = EventTeaserSchemaProps;

const EventTeaser = ({
	heading,
	value,
	events = [],
	viewAllUrl,
	viewAllLabel = 'View all',
	colorset,
}: EventTeaserProps) => {
	return (
		<Section colorset={colorset} className="event-teaser">
			<Container className="event-teaser-inner">
				{(heading || value) && (
					<header className="event-teaser-header">
						<HeadingGroup {...heading} />
						{value && <Content className="event-teaser-description" value={value} />}
					</header>
				)}

				<ul className="event-teaser-list">
					{events.map((event) => (
						<li key={event.id} className="event-teaser-item">
							<EventCard {...event} className="is-compact" />
						</li>
					))}
				</ul>

				{viewAllUrl && (
					<footer className="event-teaser-footer">
						<Interactive url={viewAllUrl} className="event-teaser-view-all" value={viewAllLabel} />
					</footer>
				)}
			</Container>
		</Section>
	);
};

export default EventTeaser;
