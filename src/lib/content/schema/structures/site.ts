import { z } from 'zod';

import { CookieConsentProps } from '@/lib/content/schema/components/cookieConsent';
import { ScrollProgressProps } from '@/lib/content/schema/components/scrollProgress';
import { SearchPaletteProps } from '@/lib/content/schema/components/searchPalette';
import { AnnouncementBarProps } from '@/lib/content/schema/structures/announcementBar';
import { FooterProps } from '@/lib/content/schema/structures/footer';
import { NavigationProps } from '@/lib/content/schema/structures/navigation';

// The site-wide chrome document: the announcement bar, navigation and footer rendered around every
// page. One validated document (src/content/structures.ts) — the chrome is data, editable in the
// builder and swappable for a CMS, exactly like pages.
export const SiteStructures = z
	.object({
		announcementBar: AnnouncementBarProps.optional().describe('Optional site-wide announcement banner'),
		navigation: NavigationProps.describe('The site header navigation'),
		footer: FooterProps.describe('The site footer'),
		scrollProgress: ScrollProgressProps.optional().describe('Optional reading-progress bar pinned to the viewport'),
		searchPalette: SearchPaletteProps.optional().describe('Optional Cmd/Ctrl+K command palette'),
		cookieConsent: CookieConsentProps.optional().describe('Optional site-wide cookie consent bar'),
	})
	.meta({ title: 'SiteStructures' });
export type SiteStructures = z.infer<typeof SiteStructures>;
