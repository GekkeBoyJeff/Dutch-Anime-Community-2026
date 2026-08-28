import type { Metadata, Viewport } from 'next';
import { Manrope, Poppins } from 'next/font/google';
import type { ReactNode } from 'react';

import JsonLd from '@/components/basics/JsonLd';
import ServiceWorker from '@/components/basics/ServiceWorker';
import { classNames } from '@/lib/shared/classNames';
import { env } from '@/lib/shared/env';
import { organizationJsonLd } from '@/lib/site/seo';
import { site, brand } from '@/lib/site/site';
import '@/styles';

const sans = Manrope({
	subsets: ['latin'],
	variable: '--font-sans',
	display: 'swap',
});

const displayFont = Poppins({
	subsets: ['latin'],
	weight: ['500', '600', '700'],
	variable: '--font-display',
	display: 'swap',
});

export const metadata: Metadata = {
	metadataBase: new URL(site.url),
	title: {
		default: site.name,
		template: `%s — ${site.name}`,
	},
	description: site.description,
	// `apple` reuses the 192px PNG: iOS "Add to Home Screen" ignores the manifest icons and SVG
	// favicons, so without it the home-screen icon falls back to a page screenshot.
	icons: { icon: '/icon.svg', apple: '/icon-192.png' },
	openGraph: {
		type: 'website',
		siteName: site.name,
		locale: 'nl_NL',
	},
	twitter: {
		card: 'summary_large_image',
		title: site.name,
		description: site.description,
	},
	appleWebApp: {
		capable: true,
		title: site.name,
		statusBarStyle: 'default',
	},
};

export const viewport: Viewport = {
	themeColor: brand.warm,
};

type RootLayoutProps = { children: ReactNode };

const RootLayout = ({ children }: RootLayoutProps) => {
	return (
		<html lang="nl" dir="ltr" data-theme="dac" className={classNames(sans.variable, displayFont.variable)}>
			<body data-colorset="light">
				{children}

				<JsonLd data={organizationJsonLd()} />

				{/* Rendered unconditionally: when the PWA build is off this unregisters stale workers,
				so old caches can't serve a broken site. */}
				<ServiceWorker enabled={env.ENABLE_PWA} />
			</body>
		</html>
	);
};

export default RootLayout;
