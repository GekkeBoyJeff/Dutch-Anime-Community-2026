import Container from '@/components/basics/Container/Container';
import Section from '@/components/basics/Section/Section';
import HeadingGroup from '@/components/components/HeadingGroup/HeadingGroup';
import Swiper from '@/components/components/Swiper/Swiper';

import type { ShowreelProps as ShowreelSchemaProps } from './Showreel.schema';

import './Showreel.scss';

type ShowreelProps = ShowreelSchemaProps;

const Showreel = ({
	heading,
	slides = [],
	ratio = '16 / 9',
	loop = true,
	showCounter = true,
	colorset,
}: ShowreelProps) => {
	return (
		<Section colorset={colorset} className="showreel">
			<Container>
				{heading && <HeadingGroup {...heading} element="header" className="showreel-header" />}

				<Swiper
					slides={slides}
					ratio={ratio}
					rounded="xl"
					loop={loop}
					showCounter={showCounter}
					ariaLabel={heading?.title ?? 'Showreel'}
				/>
			</Container>
		</Section>
	);
};

export default Showreel;
