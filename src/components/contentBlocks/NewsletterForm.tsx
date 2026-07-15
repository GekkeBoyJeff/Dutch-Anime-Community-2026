'use client';

import { useId, useState } from 'react';

import Button from '@/components/basics/Button';
import Content from '@/components/basics/Content';
import Form from '@/components/components/Form';
import FieldLabel from '@/components/forms/FieldLabel';
import TextInput from '@/components/forms/TextInput';
// Deep import, deliberately NOT the schema barrel: this is a client component, and a VALUE import
// of the barrel would ship the entire content contract (109 schema modules + zod) in every page's bundle.
import { NewsletterSignup } from '@/lib/content/schema/blocks/subscribeNewsletter';
import type { NewsletterSignup as NewsletterSignupValues } from '@/lib/content/schema/blocks/subscribeNewsletter';

interface NewsletterFormProps {
	/** Field placeholder. */
	placeholder?: string;
	/** Submit button label. */
	ctaLabel?: string;
	/** Note under the field; may contain HTML (a privacy-policy link) */
	privacyText?: string;
	/** Copy shown after a successful signup. */
	successText?: string;
	/** Where to POST the { email } payload; omit to no-op (e.g. in Storybook) */
	endpoint?: string;
}

type Status = 'idle' | 'submitting' | 'success' | 'error';

// The interactive island for SubscribeToNewsletter. It composes the shared Form shell (which owns the
// react-hook-form + zod plumbing — same NewsletterSignup schema the server handler uses) and the
// TextInput primitive, instead of re-implementing useForm and a raw <input>. Only the submit-status
// swap (success/error copy) is local. Kept small so the surrounding section stays a Server Component.
const NewsletterForm = ({
	placeholder = 'you@example.com',
	ctaLabel = 'Subscribe',
	privacyText,
	successText = 'Thanks for subscribing!',
	endpoint,
}: NewsletterFormProps) => {
	const fieldId = useId();
	const [status, setStatus] = useState<Status>('idle');

	const submit = async (values: NewsletterSignupValues) => {
		setStatus('submitting');

		// No endpoint configured (e.g. in Storybook): treat as a successful no-op so the success state
		// is still demonstrable.
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

	const errorId = `${fieldId}-error`;

	return (
		<div className="newsletter-form">
			{status === 'success' ? (
				<Content element="p" className="success" role="status" value={successText} />
			) : (
				<Form<NewsletterSignupValues, NewsletterSignupValues> schema={NewsletterSignup} onSubmit={submit} validateOn="blur">
					{(form) => {
						const { props, error, invalid } = form.field('email');

						return (
							<>
								<div className="field">
									{/* Visually hidden (the placeholder carries the visual); .sr-only keeps it out of flow. */}
									<FieldLabel htmlFor={fieldId} className="sr-only">
										Email address
									</FieldLabel>
									<div className="row">
										<TextInput
											id={fieldId}
											type="email"
											autoComplete="email"
											placeholder={placeholder}
											aria-invalid={invalid || undefined}
											aria-describedby={error ? errorId : undefined}
											{...props}
										/>
										<Button type="submit" disabled={status === 'submitting'}>
											{ctaLabel}
										</Button>
									</div>

									{error && <Content element="p" id={errorId} className="error" role="alert" value={error} />}
								</div>

								{status === 'error' && (
									<Content element="p" className="error" role="alert">
										Something went wrong. Please try again.
									</Content>
								)}

								{privacyText && <Content element="p" className="privacy" value={privacyText} />}
							</>
						);
					}}
				</Form>
			)}
		</div>
	);
};

export default NewsletterForm;
