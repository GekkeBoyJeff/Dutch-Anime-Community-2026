'use client';

import { Checkbox } from '@base-ui/react/checkbox';
import { useState, useSyncExternalStore } from 'react';

import Button from '@/components/basics/Button';
import Content from '@/components/basics/Content';
import Icon from '@/components/basics/Icon';
import Interactive from '@/components/basics/Interactive';
import { classNames } from '@/lib/shared/classNames';
import type { CookieConsentProps as CookieConsentSchemaProps } from '@/lib/site/content/schema/components/cookieConsent';

type ConsentChoices = Record<string, boolean>;

type CookieConsentProps = CookieConsentSchemaProps;

const makeConsentStore = (storageKey: string) => {
	const subscribers = new Set<() => void>();

	const read = (): string | null => {
		try {
			return window.localStorage.getItem(storageKey);
		} catch {
			return null;
		}
	};

	const notify = () => subscribers.forEach((listener) => listener());

	return {
		subscribe(listener: () => void) {
			subscribers.add(listener);
			const onStorage = (event: StorageEvent) => {
				if (event.key === storageKey) {
					notify();
				}
			};
			window.addEventListener('storage', onStorage);

			return () => {
				subscribers.delete(listener);
				window.removeEventListener('storage', onStorage);
			};
		},
		getSnapshot: read,
		// Undecided on the server, so the markup matches a fresh visitor and hydrates without a mismatch.
		getServerSnapshot: () => null,
		write(choices: ConsentChoices) {
			try {
				window.localStorage.setItem(storageKey, JSON.stringify(choices));
			} catch {}
			notify();
		},
	};
};

const CookieConsent = ({
	title = 'We use cookies',
	description = 'We use cookies to keep the site working and to understand how it is used. You choose what to allow.',
	categories = [],
	acceptLabel = 'Accept all',
	rejectLabel = 'Reject all',
	preferencesLabel = 'Preferences',
	saveLabel = 'Save choices',
	storageKey = 'cookie-consent',
	className,
}: CookieConsentProps) => {
	const [store] = useState(() => makeConsentStore(storageKey));
	const stored = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);

	const [showPreferences, setShowPreferences] = useState(false);
	const [selection, setSelection] = useState<ConsentChoices>(() =>
		Object.fromEntries(categories.map((category) => [category.id, category.defaultOn ?? false])),
	);

	const decide = (choices: ConsentChoices) => {
		store.write(choices);
		setShowPreferences(false);
	};

	const acceptAll = () => decide(Object.fromEntries(categories.map((category) => [category.id, true])));
	const rejectAll = () => decide(Object.fromEntries(categories.map((category) => [category.id, false])));
	const saveSelection = () => decide(selection);

	const toggle = (id: string) => setSelection((current) => ({ ...current, [id]: !current[id] }));

	if (stored) {
		return null;
	}

	return (
		<div
			role="dialog"
			aria-modal="false"
			aria-label={title}
			className={classNames('cookie-consent', showPreferences && 'has-preferences', className)}
		>
			<div className="cookie-consent-panel">
				<div className="cookie-consent-body">
					<Content element="p" className="cookie-consent-cookie-title" value={title} />
					<Content element="p" className="cookie-consent-cookie-text" value={description} />
				</div>

				{showPreferences && categories.length > 0 && (
					<ul className="cookie-consent-categories">
						<li className="cookie-consent-category is-locked">
							<span className="cookie-consent-category-control">
								<Checkbox.Root className="cookie-consent-control" checked disabled aria-label="Essential cookies (always on)">
									<Checkbox.Indicator className="cookie-consent-indicator">
										<Icon name="check" />
									</Checkbox.Indicator>
								</Checkbox.Root>
								<Content element="span" className="cookie-consent-category-label" value="Essential" />
							</span>
							<Content element="span" className="cookie-consent-category-description" value="Required for the site to work; always on." />
						</li>
						{categories.map((category) => (
							<li className="cookie-consent-category" key={category.id}>
								<label className="cookie-consent-category-control">
									<Checkbox.Root
										className="cookie-consent-control"
										checked={selection[category.id] ?? false}
										onCheckedChange={() => toggle(category.id)}
									>
										<Checkbox.Indicator className="cookie-consent-indicator">
											<Icon name="check" />
										</Checkbox.Indicator>
									</Checkbox.Root>
									<Content element="span" className="cookie-consent-category-label" value={category.label} />
								</label>
								{category.description && <Content element="span" className="cookie-consent-category-description" value={category.description} />}
							</li>
						))}
					</ul>
				)}

				<div className="cookie-consent-actions">
					{categories.length > 0 &&
						(showPreferences ? (
							<Button variant="secondary" value={saveLabel} onClick={saveSelection} />
						) : (
							<Interactive className="cookie-consent-link" onClick={() => setShowPreferences(true)}>
								{preferencesLabel}
							</Interactive>
						))}
					<Button variant="secondary" value={rejectLabel} onClick={rejectAll} />
					<Button variant="secondary" value={acceptLabel} onClick={acceptAll} />
				</div>
			</div>
		</div>
	);
};

export default CookieConsent;
