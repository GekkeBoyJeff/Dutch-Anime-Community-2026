import Container from '@/components/basics/Container';
import Content from '@/components/basics/Content';
import HeadingGroup from '@/components/basics/HeadingGroup';
import Icon from '@/components/basics/Icon';
import Interactive from '@/components/basics/Interactive';
import Section from '@/components/basics/Section';
import Title from '@/components/basics/Title';
import { classNames } from '@/lib/shared/classNames';
import type { IntroGridProps as IntroGridSchemaProps } from '@/lib/site/content/schema/blocks/introGrid';

type IntroGridProps = IntroGridSchemaProps;

const IntroGrid = ({
	heading,
	panels = [],
	colorset,
}: IntroGridProps) => {
	return (
		<Section colorset={colorset} className="intro-grid">
			<Container>
				{heading && <HeadingGroup {...heading} className="intro-grid-heading" />}

				<ul className={classNames('intro-grid-list', `is-count-${Math.min(panels.length, 4)}`)}>
					{panels.map((panel) => {
						const inner = (
							<>
								{panel.tagline && <Content element="p" className="intro-grid-tagline" value={panel.tagline} />}
								{panel.title && <Title element="h3" size={4} value={panel.title} />}
								{panel.subtitle && <Content size="small" value={panel.subtitle} />}

								{panel.action && (
									<span className="intro-grid-action">
										{panel.action.icon && <Icon name={panel.action.icon} />}
										{panel.action.label}
									</span>
								)}
							</>
						);

						return (
							<li key={panel.id} className={classNames('intro-grid-panel', `is-${panel.accent ?? 'intro-grid-primary'}`)}>
								{panel.action ? (
									<Interactive className="intro-grid-link" url={panel.action.href}>
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
