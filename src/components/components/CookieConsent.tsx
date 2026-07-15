'use client';

import { Checkbox } from '@base-ui/react/checkbox';
import { useEffect, useState, useSyncExternalStore } from 'react';
import type { Ref } from 'react';

import Button from '@/components/basics/Button';
import Content from '@/components/basics/Content';
import Icon from '@/components/basics/Icon';
import Interactive from '@/components/basics/Interactive';
import { classNames } from '@/lib/classNames';
import type { CookieConsentProps as CookieConsentSchemaProps } from '@/lib/content/schema/components/cookieConsent';

// The persisted shape: every non-essential category maps to a boolean. Essential cookies are always
// on and are not listed, since the user can't opt out of them.
type ConsentChoices = Record<string, boolean>;

type CookieConsentProps = CookieConsentSchemaProps & {
	/** Fires with the saved choices whenever the user decides (and once on mount if already decided) */
	onConsent?: (choices: ConsentChoices) => void;
};

// A tiny external store over the persisted consent record, read with useSyncExternalStore. This is
// the repo's pattern for reading a mutable browser store (see useReducedMotion): no setState in an
// effect, and the server snapshot keeps the first client render in sync, so the bar never flashes.
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
			} catch {
				// Persistence is best-effort; the decision still applies for this session via notify().
			}
			notify();
		},
	};
};

// GDPR/EU consent bar: accept all, reject all, or open a preferences panel to toggle each category.
// The decision (plus per-category booleans) persists in localStorage, so the bar stays hidden on
// return visits. Distinct from AnnouncementBar — it carries consent state and a preferences panel.
// Self-contained (no dependency); a small client island that reads/writes localStorage.
const CookieConsent = ({
	title = 'We use cookies',
	description = 'We use cookies to keep the site working and to understand how it is used. You choose what to allow.',
	categories = [],
	acceptLabel = 'Accept all',
	rejectLabel = 'Reject all',
	preferencesLabel = 'Preferences',
	saveLabel = 'Save choices',
	storageKey = 'cookie-consent',
	onConsent,
	className,
	ref,
}: CookieConsentProps & { ref?: Ref<HTMLDivElement> }) => {
	// One store per key for this mount. The key is stable for a given placement, so this is built once.
	const [store] = useState(() => makeConsentStore(storageKey));
	const stored = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getServerSnapshot);

	const [showPreferences, setShowPreferences] = useState(false);
	const [selection, setSelection] = useState<ConsentChoices>(() =>
		Object.fromEntries(categories.map((category) => [category.id, category.defaultOn ?? false])),
	);

	// Replay an existing decision to the host once on mount, so listeners (analytics loaders) see it.
	useEffect(() => {
		const existing = store.getSnapshot();
		if (existing) {
			onConsent?.(JSON.parse(existing) as ConsentChoices);
		}
		// Mount-only: later decisions are reported from `decide`.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// One place to persist (which re-renders via the store), notify the host, and close.
	const decide = (choices: ConsentChoices) => {
		store.write(choices);
		onConsent?.(choices);
		setShowPreferences(false);
	};

	const acceptAll = () => decide(Object.fromEntries(categories.map((category) => [category.id, true])));
	const rejectAll = () => decide(Object.fromEntries(categories.map((category) => [category.id, false])));
	const saveSelection = () => decide(selection);

	const toggle = (id: string) => setSelection((current) => ({ ...current, [id]: !current[id] }));

	// A stored snapshot means the visitor has already decided — stay hidden.
	if (stored) {
		return null;
	}

	return (
		<div
			ref={ref}
			role="dialog"
			aria-modal="false"
			aria-label={title}
			className={classNames('cookie-consent', showPreferences && 'has-preferences', className)}
		>
			<div className="panel">
				<div className="body">
					<Content element="p" className="cookie-title" value={title} />
					<Content element="p" className="cookie-text" value={description} />
				</div>

				{showPreferences && categories.length > 0 && (
					<ul className="categories">
						<li className="category is-locked">
							<span className="category-control">
								<Checkbox.Root className="control" checked disabled aria-label="Essential cookies (always on)">
									<Checkbox.Indicator className="indicator">
										<Icon name="check" />
									</Checkbox.Indicator>
								</Checkbox.Root>
								<Content element="span" className="category-label">Essential</Content>
							</span>
							<Content element="span" className="category-description">Required for the site to work; always on.</Content>
						</li>
						{categories.map((category) => (
							<li className="category" key={category.id}>
								<label className="category-control">
									<Checkbox.Root
										className="control"
										checked={selection[category.id] ?? false}
										onCheckedChange={() => toggle(category.id)}
									>
										<Checkbox.Indicator className="indicator">
											<Icon name="check" />
										</Checkbox.Indicator>
									</Checkbox.Root>
									<Content element="span" className="category-label" value={category.label} />
								</label>
								{category.description && <Content element="span" className="category-description" value={category.description} />}
							</li>
						))}
					</ul>
				)}

				<div className="actions">
					{categories.length > 0 &&
						(showPreferences ? (
							<Button variant="primary" onClick={saveSelection}>
								{saveLabel}
							</Button>
						) : (
							<Interactive className="cookie-consent-link" onClick={() => setShowPreferences(true)}>
								{preferencesLabel}
							</Interactive>
						))}
					<Button variant="secondary" onClick={rejectAll}>
						{rejectLabel}
					</Button>
					<Button variant="primary" onClick={acceptAll}>
						{acceptLabel}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default CookieConsent;
