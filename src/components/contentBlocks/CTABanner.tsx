import type { Ref } from 'react';

import Actions from '@/components/basics/Actions';
import Container from '@/components/basics/Container';
import HeadingGroup from '@/components/basics/HeadingGroup';
import Media from '@/components/basics/Media';
import Section from '@/components/basics/Section';
import { classNames } from '@/lib/classNames';
import type { CTABannerProps } from '@/lib/content';

// A conversion banner: a heading cluster with one or two call-to-action buttons, optionally beside
// media. `tone` tints the panel, `align` decides left vs centred copy. Server Component — the
// clickable island lives inside Button/Interactive.
const CTABanner = ({
	tagline,
	headline,
	subline,
	primaryCta,
	secondaryCta,
	tone = 'neutral',
	align = 'start',
	media,
	colorset,
	ref,
}: CTABannerProps & { ref?: Ref<HTMLElement> }) => {
	return (
		<Section ref={ref} colorset={colorset} className="cta-banner">
			<Container className={classNames('panel', `is-${tone}`, `is-${align}`, media && 'has-media')}>
				<div className="body">
					<HeadingGroup align={align} tagline={tagline} title={headline} intro={subline} />

					{/* Slot defaults differ (primary vs secondary), so resolve them here before mapping. */}
					<Actions
						actions={[
							...(primaryCta ? [{ ...primaryCta, variant: primaryCta.variant ?? 'primary' }] : []),
							...(secondaryCta ? [{ ...secondaryCta, variant: secondaryCta.variant ?? 'secondary' }] : []),
						]}
					/>
				</div>

				{media && <Media className="figure" {...media} />}
			</Container>
		</Section>
	);
};

export default CTABanner;
