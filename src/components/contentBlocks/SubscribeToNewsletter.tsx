import Container from '@/components/basics/Container';
import HeadingGroup from '@/components/basics/HeadingGroup';
import Section from '@/components/basics/Section';
import NewsletterForm from '@/components/components/NewsletterForm';
import type { SubscribeToNewsletterProps as SubscribeToNewsletterSchemaProps } from '@/lib/site/content/schema/blocks/subscribeToNewsletter';

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
