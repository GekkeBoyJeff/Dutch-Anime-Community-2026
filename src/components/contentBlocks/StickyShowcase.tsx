'use client';

import { useEffect, useRef, useState } from 'react';
import type { Ref } from 'react';

import Container from '@/components/basics/Container';
import Content from '@/components/basics/Content';
import HeadingGroup from '@/components/basics/HeadingGroup';
import Media from '@/components/basics/Media';
import Section from '@/components/basics/Section';
import Title from '@/components/basics/Title';
import { classNames } from '@/lib/classNames';
import type { StickyShowcaseProps } from '@/lib/content';

// Apple-style scroll showcase: the media stage pins while the steps scroll past; the stage
// crossfades to the active step's image. A client island — the active step comes from an
// IntersectionObserver watching the middle band of the viewport. On small screens the stage is
// hidden and each step simply shows its own media.
const StickyShowcase = ({ heading, steps = [], colorset, ref }: StickyShowcaseProps & { ref?: Ref<HTMLElement> }) => {
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
			// https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserver/rootMargin
				{ rootMargin: '-45% 0px -45% 0px' },
		);

		stepRefs.current.forEach((element) => element && observer.observe(element));
		return () => observer.disconnect();
	}, [steps.length]);

	return (
		<Section ref={ref} colorset={colorset} className="sticky-showcase">
			<Container>
				{heading && (
					<HeadingGroup
						tagline={heading.tagline}
						title={heading.value}
						size={heading.size}
						intro={heading.intro}
						element="header"
						className="header"
					/>
				)}

				<div className="scene">
					<div className="stage" aria-hidden="true">
						{steps.map((step, index) => {
							return (
								<div key={step.id} className={classNames('stage-media', index === active && 'is-active')}>
									<Media {...step.media} />
								</div>
							);
						})}
					</div>

					<ol className="rail">
						{steps.map((step, index) => {
							return (
								<li
									key={step.id}
									data-index={index}
									ref={(element) => {
										stepRefs.current[index] = element;
									}}
									className={classNames('step', index === active && 'is-active')}
								>
									<span className="step-index" aria-hidden="true">
										{String(index + 1).padStart(2, '0')}
									</span>
									<Title element="h3" size={3} value={step.title} className="step-title" />
									{step.body && <Content value={step.body} className="step-body" />}
									<div className="step-media">
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
