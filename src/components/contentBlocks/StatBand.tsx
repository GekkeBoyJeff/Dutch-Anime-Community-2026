import type { Ref } from 'react';

import Container from '@/components/basics/Container';
import CountUp from '@/components/basics/CountUp';
import HeadingGroup from '@/components/basics/HeadingGroup';
import Section from '@/components/basics/Section';
import type { StatBandProps } from '@/lib/content';

// A band of key figures that count up when scrolled into view. The band renders as an inset
// rounded panel, so it reads as a warm accent between white sections.
const StatBand = ({ heading, items = [], colorset, ref }: StatBandProps & { ref?: Ref<HTMLElement> }) => {
	return (
		<Section ref={ref} colorset={colorset} className="stat-band is-band">
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

				<dl className="stats">
					{items.map((item) => {
						return (
							<div key={item.id} className="stat">
								<dt className="stat-label">{item.label}</dt>
								<dd className="stat-number">
									<CountUp value={item.value} prefix={item.prefix} suffix={item.suffix} decimals={item.decimals} />
								</dd>
							</div>
						);
					})}
				</dl>
			</Container>
		</Section>
	);
};

export default StatBand;
