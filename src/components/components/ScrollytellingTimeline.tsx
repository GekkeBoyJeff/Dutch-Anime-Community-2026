'use client';

import { useEffect, useRef, useState } from 'react';
import type { Ref } from 'react';

import Content from '@/components/basics/Content';
import Media from '@/components/basics/Media';
import Title from '@/components/basics/Title';
import { classNames } from '@/lib/classNames';
import type { ScrollytellingTimelineProps } from '@/lib/content/schema/components/scrollytellingTimeline';

// A scroll-driven story: a sticky media frame on one side cross-fades between images as the
// milestone cards scroll past on the other. An IntersectionObserver marks the card nearest the
// viewport centre as active and the matching frame fades in — this works in every browser, unlike a
// pure scroll-timeline cross-fade, and avoids pulling in a scrubbing library. With reduced motion
// (or no JS) every frame is shown stacked, so the content is never trapped behind the animation.
const ScrollytellingTimeline = ({
	milestones,
	ariaLabel = 'Story timeline',
	headingLevel = 3,
	className,
	ref,
}: ScrollytellingTimelineProps & { ref?: Ref<HTMLDivElement> }) => {
	const [activeIndex, setActiveIndex] = useState(0);
	const cardsRef = useRef<Array<HTMLLIElement | null>>([]);

	useEffect(() => {
		const cards = cardsRef.current.filter((card): card is HTMLLIElement => card !== null);
		if (cards.length === 0) {
			return;
		}

		// A card counts as active while its centre sits in the middle band of the viewport.
		// https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/rootMargin
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
		<div ref={ref} className={classNames('scrollytelling-timeline', className)} aria-label={ariaLabel} role="group">
			<div className="frame" aria-hidden="true">
				{milestones.map((milestone, index) => {
					if (!milestone.media) {
						return null;
					}

					return (
						<div className={classNames('frame-media', index === activeIndex && 'is-active')} key={index}>
							<Media {...milestone.media} />
						</div>
					);
				})}
			</div>

			<ol className="cards">
				{milestones.map((milestone, index) => {
					return (
						<li
							className={classNames('scrollytelling-card', index === activeIndex && 'is-active')}
							key={index}
							data-index={index}
							ref={(node) => {
								cardsRef.current[index] = node;
							}}
						>
							{milestone.tagline && <Content element="p" className="tagline" value={milestone.tagline} />}
							{milestone.year && <Content element="p" className="year" value={milestone.year} />}
							<Title element={`h${headingLevel}`} size={headingLevel} value={milestone.title} />
							{milestone.date && <Content element="p" className="date" value={milestone.date} />}
							{milestone.description && <Content value={milestone.description} />}
						</li>
					);
				})}
			</ol>
		</div>
	);
};

export default ScrollytellingTimeline;
