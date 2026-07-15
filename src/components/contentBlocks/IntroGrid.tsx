import type { Ref } from 'react';

import Container from '@/components/basics/Container';
import Content from '@/components/basics/Content';
import HeadingGroup from '@/components/basics/HeadingGroup';
import Icon from '@/components/basics/Icon';
import Interactive from '@/components/basics/Interactive';
import Section from '@/components/basics/Section';
import Title from '@/components/basics/Title';
import { classNames } from '@/lib/classNames';
import type { IntroGridProps } from '@/lib/content';

// A 2–4 panel intro grid of accent-tinted cards. The panel count drives the column layout
// (is-count-{n}); a panel with an action surfaces the whole card as a link. Server Component —
// the clickable island lives inside Interactive.
const IntroGrid = ({
	heading,
	panels = [],
	colorset,
	ref,
}: IntroGridProps & { ref?: Ref<HTMLElement> }) => {
	return (
		<Section ref={ref} colorset={colorset} className="intro-grid">
			<Container>
				{heading && (
					<HeadingGroup
						tagline={heading.tagline}
						title={heading.value}
						size={heading.size}
						intro={heading.intro}
						className="intro-grid-heading"
					/>
				)}

				<ul className={classNames('grid', `is-count-${Math.min(panels.length, 4)}`)}>
					{panels.map((panel) => {
						const inner = (
							<>
								{panel.tagline && <Content element="p" className="tagline" value={panel.tagline} />}
								{panel.title && <Title element="h3" size={4} value={panel.title} />}
								{panel.subtitle && <Content size="small" value={panel.subtitle} />}

								{panel.action && (
									<span className="action">
										{panel.action.icon && <Icon name={panel.action.icon} />}
										{panel.action.label}
									</span>
								)}
							</>
						);

						return (
							<li key={panel.id} className={classNames('panel', `is-${panel.accent ?? 'primary'}`)}>
								{panel.action ? (
									<Interactive className="intro-grid-link" url={panel.action.url}>
										{inner}
									</Interactive>
								) : (
									inner
								)}
							</li>
						);
					})}
				</ul>
			</Container>
		</Section>
	);
};

export default IntroGrid;
