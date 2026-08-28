'use client';

import { useState } from 'react';

import Button from '@/components/basics/Button';
import Content from '@/components/basics/Content';
import Field from '@/components/forms/Field';
import Form from '@/components/forms/Form';
import TextInput from '@/components/forms/TextInput';
// Deep import, deliberately NOT the schema barrel: this is a client component, and a VALUE import
// of the barrel would ship the entire content contract (109 schema modules + zod) in every page's bundle.
import { NewsletterSignup } from '@/lib/site/content/schema/blocks/subscribeToNewsletter';
import type { NewsletterSignup as NewsletterSignupValues } from '@/lib/site/content/schema/blocks/subscribeToNewsletter';
import type { NewsletterFormProps as NewsletterFormSchemaProps } from '@/lib/site/content/schema/components/newsletterForm';

type NewsletterFormProps = NewsletterFormSchemaProps;

type Status = 'idle' | 'submitting' | 'success' | 'error';

const NewsletterForm = ({
	placeholder = 'you@example.com',
	ctaLabel = 'Subscribe',
	privacyText,
	successText = 'Thanks for subscribing!',
	endpoint,
}: NewsletterFormProps) => {
	const [status, setStatus] = useState<Status>('idle');

	const submit = async (values: NewsletterSignupValues) => {
		setStatus('submitting');

		if (!endpoint) {
			setStatus('success');
			return;
		}

		try {
			const response = await fetch(endpoint, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(values),
			});
			setStatus(response.ok ? 'success' : 'error');
		} catch {
			setStatus('error');
		}
	};

	return (
		<div className="newsletter-form">
			{status === 'success' ? (
				<Content element="p" className="newsletter-form-success" role="status" value={successText} />
			) : (
				<Form<NewsletterSignupValues, NewsletterSignupValues> schema={NewsletterSignup} onSubmit={submit} validateOn="blur">
					{(form) => {
						const { props, error, invalid } = form.field('email');

						return (
							<>
								<Field name="email" invalid={invalid} className="newsletter-form-field">
									<Field.Label className="sr-only">Email address</Field.Label>
									<div className="newsletter-form-row">
										<TextInput type="email" autoComplete="email" placeholder={placeholder} {...props} />
										<Button type="submit" value={ctaLabel} disabled={status === 'submitting'} />
									</div>

									{error && (
										<Field.Error match className="newsletter-form-error">
											{error}
										</Field.Error>
									)}
								</Field>

								{status === 'error' && (
									<Content element="p" className="newsletter-form-error" role="alert" value="Something went wrong. Please try again." />
								)}

								{privacyText && <Content element="p" className="newsletter-form-privacy" value={privacyText} />}
							</>
						);
					}}
				</Form>
			)}
		</div>
	);
};

export default NewsletterForm;
