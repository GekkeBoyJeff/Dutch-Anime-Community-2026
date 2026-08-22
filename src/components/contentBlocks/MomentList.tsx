import type { Ref } from 'react';

import Container from '@/components/basics/Container';
import HeadingGroup from '@/components/basics/HeadingGroup';
import Section from '@/components/basics/Section';
import Moment from '@/components/components/Moment';
import type { MomentListItem, MomentListProps } from '@/lib/content';
import { formatDate } from '@/lib/formatDate';

// Decided once, when the site is built: a static export cannot learn that a date has passed since.
// An entry that has slipped by therefore keeps reading as upcoming until the next publish, which
// makes a neglected agenda visible instead of quietly correct.
const stateOf = (item: MomentListItem, today: string): 'past' | 'now' | 'upcoming' => {
	if ((item.endDate ?? item.date).slice(0, 10) < today) return 'past';
	if (item.date.slice(0, 10) > today) return 'upcoming';

	return 'now';
};

// A chronology on a rail. Where eventTeaser announces what is coming, this shows the rhythm around
// it — what has been is the evidence that there is one. Server Component; no JS.
const MomentList = ({ heading, items = [], colorset, ref }: MomentListProps & { ref?: Ref<HTMLElement> }) => {
	const today = new Date().toISOString().slice(0, 10);

	return (
		<Section ref={ref} colorset={colorset} className="moment-list-block">
			<Container>
				{heading && (
					<HeadingGroup
						tagline={heading.tagline}
						title={heading.value}
						size={heading.size}
						intro={heading.intro}
						element="header"
						className="moment-list-block-header"
					/>
				)}

				<Moment.List>
					{items.map((item) => (
						<Moment
							key={item.id}
							marker={formatDate(item.date, { day: 'numeric', month: 'short' }) ?? item.date}
							title={item.title}
							meta={item.meta}
							href={item.href}
							state={stateOf(item, today)}
						/>
					))}
				</Moment.List>
			</Container>
		</Section>
	);
};

export default MomentList;
