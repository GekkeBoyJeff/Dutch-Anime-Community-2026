import type { Ref } from 'react';

import Actions from '@/components/basics/Actions';
import Content from '@/components/basics/Content';
import Media from '@/components/basics/Media';
import Title from '@/components/basics/Title';
import { classNames } from '@/lib/classNames';
import type { TimelineProps } from '@/lib/content/schema/components/timeline';

// A vertical milestone timeline as a semantic ordered list: a rail with a dot per milestone, a year
// block and a card. Cards fade up as they enter the viewport using CSS scroll-driven animation
// (animation-timeline: view()), which degrades to simply visible where unsupported — no
// IntersectionObserver, so it stays a Server Component. `alternating` flips each card to the
// opposite side of the rail on wide screens; on narrow screens everything stacks on one side.
const Timeline = ({
	items,
	align = 'alternating',
	headingLevel = 3,
	className,
	ref,
}: TimelineProps & { ref?: Ref<HTMLOListElement> }) => {
	return (
		<ol ref={ref} className={classNames('timeline', `is-${align}`, className)}>
			{items.map((item, index) => {
				return (
					<li
						className={classNames('milestone', index % 2 === 1 && 'is-odd')}
						key={`${item.year}-${index}`}
						>
							<div className="marker" aria-hidden="true">
								<span className="dot" />
							</div>

							<div className="entry">
								<Content element="p" className="year" value={item.year} />

								<div className="timeline-card">
									{item.tagline && <Content element="p" className="tagline" value={item.tagline} />}
									<Title element={`h${headingLevel}`} size={headingLevel} value={item.title} />
									{item.date && <Content element="p" className="date" value={item.date} />}
									{item.text && <Content size="small" value={item.text} />}
									{item.media && <Media {...item.media} className="thumb" />}

									<Actions actions={item.actions} defaultVariant="primary" />
								</div>
							</div>
						</li>
					);
				})}
			</ol>
	);
};

export default Timeline;
