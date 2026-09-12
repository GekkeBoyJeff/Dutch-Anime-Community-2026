import Actions from '@/components/basics/Actions/Actions';
import Container from '@/components/basics/Container/Container';
import HeadingGroup from '@/components/basics/HeadingGroup/HeadingGroup';
import Media from '@/components/basics/Media/Media';
import Section from '@/components/basics/Section/Section';
import { classNames } from '@/lib/shared/classNames';

import type { CTABannerProps as CTABannerSchemaProps } from './CTABanner.schema';

import './CTABanner.scss';

// `eager` is a render hint Blocks derives from a block's position, not content, so it stays out of the content schema.
type CTABannerProps = CTABannerSchemaProps & { eager?: boolean };

const CTABanner = ({
	heading,
	primaryCta,
	secondaryCta,
	tone = 'neutral',
	align = 'start',
	media,
	colorset,
	eager,
}: CTABannerProps) => {
	return (
		<Section colorset={colorset} className="cta-banner">
			<Container className={classNames('cta-banner-panel', `is-${tone}`, `is-${align}`, media && 'has-media')}>
				<div className="cta-banner-body">
					{heading && <HeadingGroup {...heading} align={align} />}

					{/* Slot defaults differ (primary vs secondary), so resolve them here before mapping. */}
					<Actions
						actions={[
							...(primaryCta ? [{ ...primaryCta, variant: primaryCta.variant ?? 'primary' }] : []),
							...(secondaryCta ? [{ ...secondaryCta, variant: secondaryCta.variant ?? 'secondary' }] : []),
						]}
					/>
				</div>

				{media && <Media className="cta-banner-figure" {...media} eager={eager} />}
			</Container>
		</Section>
	);
};

export default CTABanner;
