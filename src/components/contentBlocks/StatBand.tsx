import Container from '@/components/basics/Container';
import CountUp from '@/components/basics/CountUp';
import HeadingGroup from '@/components/basics/HeadingGroup';
import Section from '@/components/basics/Section';
import type { StatBandProps as StatBandSchemaProps } from '@/lib/site/content/schema/blocks/statBand';

type StatBandProps = StatBandSchemaProps;

const StatBand = ({
	heading,
	items = [],
	colorset,
}: StatBandProps) => {
	return (
		<Section colorset={colorset} className="stat-band is-band">
			<Container>
				{heading && <HeadingGroup {...heading} element="header" className="stat-band-header" />}

				<dl className="stat-band-stats">
					{items.map((item) => {
						return (
							<div key={item.id} className="stat-band-stat">
								<dt className="stat-band-stat-label">{item.label}</dt>
								<dd className="stat-band-stat-number">
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
