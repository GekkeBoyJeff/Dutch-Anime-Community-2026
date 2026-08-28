import Container from '@/components/basics/Container';
import HeadingGroup from '@/components/basics/HeadingGroup';
import Section from '@/components/basics/Section';
import Moment from '@/components/components/Moment';
import { formatDate } from '@/lib/shared/formatDate';
import type { MomentListItem, MomentListProps as MomentListSchemaProps } from '@/lib/site/content/schema/blocks/momentList';

type MomentListProps = MomentListSchemaProps;

// Decided once, when the site is built: a static export cannot learn that a date has passed since.
// An entry that has slipped by therefore keeps reading as upcoming until the next publish.
const stateOf = (item: MomentListItem, today: string): 'past' | 'now' | 'upcoming' => {
	if ((item.endDate ?? item.date).slice(0, 10) < today) return 'past';
	if (item.date.slice(0, 10) > today) return 'upcoming';

	return 'now';
};

const MomentList = ({
	heading,
	items = [],
	colorset,
}: MomentListProps) => {
	const today = new Date().toISOString().slice(0, 10);

	return (
		<Section colorset={colorset} className="moment-list-block">
			<Container>
				{heading && <HeadingGroup {...heading} element="header" className="moment-list-block-header" />}

				<Moment.List
					items={items.map((item) => ({
						marker: formatDate(item.date, { day: 'numeric', month: 'short' }) ?? item.date,
						title: item.title,
						meta: item.meta,
						href: item.href,
						state: stateOf(item, today),
					}))}
				/>
			</Container>
		</Section>
	);
};

export default MomentList;
