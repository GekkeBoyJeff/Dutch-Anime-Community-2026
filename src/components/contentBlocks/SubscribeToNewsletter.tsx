import type { Ref } from 'react';

import Container from '@/components/basics/Container';
import HeadingGroup from '@/components/basics/HeadingGroup';
import Section from '@/components/basics/Section';
import NewsletterForm from '@/components/contentBlocks/NewsletterForm';
import type { SubscribeToNewsletterProps } from '@/lib/content';

// A newsletter signup section: a heading cluster and description with the signup form beside/under
// it. A Server Component — only the form (inline validation, submit, success state) is a client
// island (NewsletterForm), so the surrounding copy stays static.
const SubscribeToNewsletter = ({
	heading,
	description,
	placeholder,
	ctaLabel,
	privacyText,
	successText,
	endpoint,
	colorset,
	ref,
}: SubscribeToNewsletterProps & { ref?: Ref<HTMLElement> }) => {
	return (
		<Section ref={ref} colorset={colorset} className="subscribe-newsletter">
			<Container className="panel">
				<HeadingGroup
					tagline={heading?.tagline}
					title={heading?.value}
					size={heading?.size}
					intro={heading?.intro ?? description}
					className="copy"
				/>

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
