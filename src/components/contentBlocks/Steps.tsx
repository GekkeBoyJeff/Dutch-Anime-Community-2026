import type { Ref } from 'react';

import Container from '@/components/basics/Container';
import Content from '@/components/basics/Content';
import HeadingGroup from '@/components/basics/HeadingGroup';
import Icon from '@/components/basics/Icon';
import Section from '@/components/basics/Section';
import type { StepsProps } from '@/lib/content';

// A numbered process / progress block. As `process` it reads like a marketing "how it works" row; as
// `progress` it is a compact strip for a multi-step form or checkout, where `current` marks the active
// step (aria-current) and earlier steps as done. State lives in [data-state] so the whole block stays
// a Server Component — distinct from the vertical Timeline in both layout and semantics.
const Steps = ({
	heading,
	items = [],
	variant = 'process',
	current,
	colorset,
	ref,
}: StepsProps & { ref?: Ref<HTMLElement> }) => {
	// Step state is only meaningful for the progress variant (undefined `current` = none).
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
		<Section ref={ref} colorset={colorset} className="steps">
			<Container>
				{heading && (
					<HeadingGroup
						tagline={heading.tagline}
						title={heading.value}
						size={heading.size}
						intro={heading.intro}
					/>
				)}

				<ol className="list" data-variant={variant}>
					{items.map((item, index) => {
						const state = stateFor(index);

						return (
							<li
								key={item.id}
								className="step"
								data-state={state}
								aria-current={state === 'active' ? 'step' : undefined}
							>
								<span className="marker" aria-hidden="true">
									{item.icon ? <Icon name={item.icon} className='steps-icon' /> : index + 1}
								</span>

								<div className="body">
									{/* A real heading per step; the body role (not Title) because the visual is body text. */}
									<Content element="h3" className="step-title" value={item.title} />
									{item.body && <Content element="p" className="step-body" value={item.body} />}
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
