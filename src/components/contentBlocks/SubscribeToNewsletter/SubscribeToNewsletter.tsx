import Container from '@/components/basics/Container/Container';
import HeadingGroup from '@/components/basics/HeadingGroup/HeadingGroup';
import Section from '@/components/basics/Section/Section';
import NewsletterForm from '@/components/components/NewsletterForm/NewsletterForm';

import type { SubscribeToNewsletterProps as SubscribeToNewsletterSchemaProps } from './SubscribeToNewsletter.schema';

import './SubscribeToNewsletter.scss';

type SubscribeToNewsletterProps = SubscribeToNewsletterSchemaProps;

const SubscribeToNewsletter = ({
	heading,
	placeholder,
	ctaLabel,
	privacyText,
	successText,
	endpoint,
	colorset,
}: SubscribeToNewsletterProps) => {
	return (
		<Section colorset={colorset} className="subscribe-to-newsletter">
			<Container className="subscribe-to-newsletter-panel">
				<HeadingGroup {...heading} className="subscribe-to-newsletter-copy" />

				<NewsletterForm
					placeholder={placeholder}
					ctaLabel={ctaLabel}
					privacyText={privacyText}
					successText={successText}
					endpoint={endpoint}
				/>
			</Container>
		</Section>
	);
};

export default SubscribeToNewsletter;
