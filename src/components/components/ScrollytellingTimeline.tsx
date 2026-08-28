'use client';

import { useEffect, useRef, useState } from 'react';

import Content from '@/components/basics/Content';
import Media from '@/components/basics/Media';
import Title from '@/components/basics/Title';
import { classNames } from '@/lib/shared/classNames';
import type { ScrollytellingTimelineProps as ScrollytellingTimelineSchemaProps } from '@/lib/site/content/schema/components/scrollytellingTimeline';

type ScrollytellingTimelineProps = ScrollytellingTimelineSchemaProps;

const ScrollytellingTimeline = ({
	milestones,
	ariaLabel = 'Story timeline',
	headingLevel = 3,
	className,
}: ScrollytellingTimelineProps) => {
	const [activeIndex, setActiveIndex] = useState(0);
	const cardsRef = useRef<Array<HTMLLIElement | null>>([]);

	useEffect(() => {
		const cards = cardsRef.current.filter((card): card is HTMLLIElement => card !== null);
		if (cards.length === 0) {
			return;
		}

		// A card counts as active while its centre sits in the middle band of the viewport.
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						const index = Number((entry.target as HTMLElement).dataset.index);
						setActiveIndex(index);
					}
				}
			},
			{ rootMargin: '-45% 0px -45% 0px', threshold: 0 },
		);

		cards.forEach((card) => observer.observe(card));

		return () => observer.disconnect();
	}, [milestones.length]);

	return (
		<div className={classNames('scrollytelling-timeline', className)} aria-label={ariaLabel} role="group">
			<div className="scrollytelling-timeline-frame" aria-hidden="true">
				{milestones.map((milestone, index) => {
					if (!milestone.media) {
						return null;
					}

					return (
						<div className={classNames('scrollytelling-timeline-frame-media', index === activeIndex && 'is-active')} key={index}>
							<Media {...milestone.media} />
						</div>
					);
				})}
			</div>

			<ol className="scrollytelling-timeline-cards">
				{milestones.map((milestone, index) => {
					return (
						<li
							className={classNames('scrollytelling-timeline-scrollytelling-card', index === activeIndex && 'is-active')}
							key={index}
							data-index={index}
							ref={(node) => {
								cardsRef.current[index] = node;
							}}
						>
							{milestone.tagline && <Content element="p" className="scrollytelling-timeline-tagline" value={milestone.tagline} />}
							{milestone.year && <Content element="p" className="scrollytelling-timeline-year" value={milestone.year} />}
							<Title element={`h${headingLevel}`} size={headingLevel} value={milestone.title} />
							{milestone.date && <Content element="p" className="scrollytelling-timeline-date" value={milestone.date} />}
							{milestone.description && <Content value={milestone.description} />}
						</li>
					);
				})}
			</ol>
		</div>
	);
};

export default ScrollytellingTimeline;
