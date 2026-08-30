'use client';

import { useEffect, useRef, useState } from 'react';

import Container from '@/components/basics/Container';
import Content from '@/components/basics/Content';
import HeadingGroup from '@/components/basics/HeadingGroup';
import Media from '@/components/basics/Media';
import Section from '@/components/basics/Section';
import Title from '@/components/basics/Title';
import { classNames } from '@/lib/shared/classNames';
import type { StickyShowcaseProps as StickyShowcaseSchemaProps } from '@/lib/site/content/schema/blocks/stickyShowcase';

type StickyShowcaseProps = StickyShowcaseSchemaProps;

const StickyShowcase = ({
	heading,
	steps = [],
	colorset,
}: StickyShowcaseProps) => {
	const [active, setActive] = useState(0);
	const stepRefs = useRef<(HTMLLIElement | null)[]>([]);

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						setActive(Number((entry.target as HTMLElement).dataset.index));
					}
				}
			},
			// Only the middle band of the viewport counts, so exactly one step is active at a time.
				{ rootMargin: '-45% 0px -45% 0px' },
		);

		stepRefs.current.forEach((element) => element && observer.observe(element));
		return () => observer.disconnect();
	}, [steps.length]);

	return (
		<Section colorset={colorset} className="sticky-showcase">
			<Container>
				{heading && <HeadingGroup {...heading} element="header" className="sticky-showcase-header" />}

				<div className="sticky-showcase-scene">
					<div className="sticky-showcase-stage" aria-hidden="true">
						{steps.map((step, index) => {
							return (
								<div key={step.id} className={classNames('sticky-showcase-stage-media', index === active && 'is-active')}>
									<Media {...step.media} />
								</div>
							);
						})}
					</div>

					<ol className="sticky-showcase-rail">
						{steps.map((step, index) => {
							return (
								<li
									key={step.id}
									data-index={index}
									ref={(element) => {
										stepRefs.current[index] = element;
									}}
									className={classNames('sticky-showcase-step', index === active && 'is-active')}
								>
									<span className="sticky-showcase-step-index" aria-hidden="true">
										{String(index + 1).padStart(2, '0')}
									</span>
									<Title element="h3" size={3} value={step.title} className="sticky-showcase-step-title" />
									{step.value && <Content value={step.value} className="sticky-showcase-step-body" />}
									<div className="sticky-showcase-step-media">
										<Media {...step.media} />
									</div>
								</li>
							);
						})}
					</ol>
				</div>
			</Container>
		</Section>
	);
};

export default StickyShowcase;
