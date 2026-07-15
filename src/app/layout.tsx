import type { Metadata, Viewport } from 'next';
import { Manrope, Poppins } from 'next/font/google';
import type { ReactNode } from 'react';

import JsonLd from '@/components/basics/JsonLd';
import ServiceWorker from '@/components/basics/ServiceWorker';
import { classNames } from '@/lib/classNames';
import { env } from '@/lib/env';
import { organizationJsonLd } from '@/lib/seo';
import { site, brand } from '@/lib/site';
import '@/styles';

// next/font self-host: loads the font without a flash of unstyled text and exposes it as a CSS
// variable that the SCSS reset reads (var(--font-sans)).
const sans = Manrope({
	subsets: ['latin'],
	variable: '--font-sans',
	display: 'swap',
});

// Display face for headings (var(--font-display), read by the heading rule in base.scss). Poppins is
// the face DAC already uses on its socials and old site, so headings stay on-brand.
const displayFont = Poppins({
	subsets: ['latin'],
	weight: ['500', '600', '700'],
	variable: '--font-display',
	display: 'swap',
});

// metadataBase lets Next resolve relative OG/canonical URLs to absolute ones; the template appends
// the site name to every page title.
export const metadata: Metadata = {
	metadataBase: new URL(site.url),
	title: {
		default: site.name,
		template: `%s — ${site.name}`,
	},
	description: site.description,
	// Favicon: the scalable SVG renders crisp at any tab size. Next injects the <link rel="icon">.
	// `apple` reuses the 192px PNG: iOS "Add to Home Screen" ignores the manifest icons and SVG
	// favicons, so without it the home-screen icon falls back to a page screenshot.
	icons: { icon: '/icon.svg', apple: '/icon-192.png' },
	openGraph: {
		type: 'website',
		siteName: site.name,
		locale: 'nl_NL',
	},
	// X/Twitter share card. `summary_large_image` makes the generated 1200×630 OG image render large;
	// without it the platform only falls back to og:image heuristically. Per-route images flow through
	// the OG fallback automatically.
	twitter: {
		card: 'summary_large_image',
		title: site.name,
		description: site.description,
	},
	// iOS standalone (Add to Home Screen) hints; pairs with the web manifest for installability.
	appleWebApp: {
		capable: true,
		title: site.name,
		statusBarStyle: 'default',
	},
};

// Colours the mobile browser chrome to match the brand; pair with the manifest's theme_color (both
// read the same `brand` constant, so they can't drift).
export const viewport: Viewport = {
	themeColor: brand.warm,
};

interface RootLayoutProps {
	/** The rendered route content */
	children?: ReactNode;
}

const RootLayout = ({ children }: RootLayoutProps) => {
	// PWA is opt-in (see next.config): only register the service worker when it was built in.
	const pwaEnabled = env.ENABLE_PWA;

	return (
		// dir defaults to ltr; switch to "rtl" for a right-to-left language. The styling uses logical
		// properties (margin-inline, inset-inline, text-align: start…), so the layout mirrors on its own.
		<html lang="nl" dir="ltr" data-theme="dac" className={classNames(sans.variable, displayFont.variable)}>
			{/* Base colorset on the body, so individual section colorsets can override it within. */}
			<body data-colorset="light">
				{children}

				{/* Organization structured data; search engines read the site as a rich result. */}
				<JsonLd data={organizationJsonLd()} />

				{/* Registers the Serwist service worker when the PWA build is enabled — and, crucially,
				unregisters stale workers when it isn't, so old caches can't serve a broken site. */}
				<ServiceWorker enabled={pwaEnabled} />
			</body>
		</html>
	);
};

export default RootLayout;
