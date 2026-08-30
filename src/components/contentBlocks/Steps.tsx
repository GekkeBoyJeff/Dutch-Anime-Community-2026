import Container from '@/components/basics/Container';
import Content from '@/components/basics/Content';
import HeadingGroup from '@/components/basics/HeadingGroup';
import Icon from '@/components/basics/Icon';
import Section from '@/components/basics/Section';
import type { StepsProps as StepsSchemaProps } from '@/lib/site/content/schema/blocks/steps';

type StepsProps = StepsSchemaProps;

const Steps = ({
	heading,
	items = [],
	variant = 'process',
	current,
	colorset,
}: StepsProps) => {
	const stateFor = (index: number): 'done' | 'active' | 'upcoming' | undefined => {
		if (current === undefined) {
			return undefined;
		}

		if (index < current) {
			return 'done';
		}

		return index === current ? 'active' : 'upcoming';
	};

	return (
		<Section colorset={colorset} className="steps">
			<Container>
				{heading && <HeadingGroup {...heading} />}

				<ol className="steps-list" data-variant={variant}>
					{items.map((item, index) => {
						const state = stateFor(index);

						return (
							<li
								key={item.id}
								className="steps-step"
								data-state={state}
								aria-current={state === 'active' ? 'step' : undefined}
							>
								<span className="steps-marker" aria-hidden="true">
									{item.icon ? <Icon name={item.icon} className='steps-icon' /> : index + 1}
								</span>

								<div className="steps-body">
									{/* A real heading per step; the body role (not Title) because the visual is body text. */}
									<Content element="h3" className="steps-step-title" value={item.title} />
									{item.value && <Content element="p" className="steps-step-body" value={item.value} />}
								</div>
							</li>
						);
					})}
				</ol>
			</Container>
		</Section>
	);
};

export default Steps;
