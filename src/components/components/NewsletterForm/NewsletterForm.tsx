'use client';

import { useState } from 'react';

import Button from '@/components/basics/Button/Button';
import Content from '@/components/basics/Content/Content';
import { NewsletterSignup } from '@/components/contentBlocks/SubscribeToNewsletter/SubscribeToNewsletter.schema';
import type { NewsletterSignup as NewsletterSignupValues } from '@/components/contentBlocks/SubscribeToNewsletter/SubscribeToNewsletter.schema';
import Field from '@/components/forms/Field/Field';
import Form from '@/components/forms/Form/Form';
import TextInput from '@/components/forms/TextInput/TextInput';
// Deep import, deliberately NOT the schema barrel: this is a client component, and a VALUE import
// of the barrel would ship the entire content contract (109 schema modules + zod) in every page's bundle.

import type { NewsletterFormProps as NewsletterFormSchemaProps } from './NewsletterForm.schema';

import './NewsletterForm.scss';

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
