import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import CookieConsent from '@/components/components/CookieConsent';
import { CookieConsentProps } from '@/lib/content/schema/components/cookieConsent';

const meta: Meta<typeof CookieConsent> = {
	title: 'Components/CookieConsent',
	component: CookieConsent,
	parameters: {
		layout: 'fullscreen',
		docs: { description: { component: 'GDPR/EU consent bar: accept all, reject all, or open a preferences panel to toggle each category. The decision persists in localStorage, so it stays hidden on return visits. High legal and UX value for a Dutch site; self-contained client island, no dependency.' } },
		jsonSchema: { schema: CookieConsentProps },
	},
	// Each story render clears its own decision so the bar always shows in Storybook.
	decorators: [
		(Story, context) => {
			const key = `sb-cookie-consent-${context.name}`;
			if (typeof window !== 'undefined') {
				window.localStorage.removeItem(key);
			}
			return <Story args={{ ...context.args, storageKey: key }} />;
		},
	],
};

export default meta;

type Story = StoryObj<typeof CookieConsent>;

export const Default: Story = {
	args: {
		title: 'We use cookies',
		description: 'We use cookies to keep the site working and to understand how it is used. You choose what to allow.',
		categories: [
			{ id: 'analytics', label: 'Analytics', description: 'Helps us understand which pages are popular.' },
			{ id: 'marketing', label: 'Marketing', description: 'Lets us show relevant event promotions.' },
		],
	},
};

export const NoPreferences: Story = {
	...Default,
	args: { ...Default.args, categories: [] },
	parameters: {
		docs: { description: { story: 'With no toggleable categories the bar offers a plain accept/reject choice and hides the preferences trigger.' } },
	},
};
