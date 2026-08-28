import Actions from '@/components/basics/Actions';
import Container from '@/components/basics/Container';
import HeadingGroup from '@/components/basics/HeadingGroup';
import Media from '@/components/basics/Media';
import Section from '@/components/basics/Section';
import { classNames } from '@/lib/shared/classNames';
import type { CTABannerProps as CTABannerSchemaProps } from '@/lib/site/content/schema/blocks/ctaBanner';

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
