import { z } from 'zod';

import { CookieConsentProps } from '@/lib/site/content/schema/components/cookieConsent';
import { ScrollProgressProps } from '@/lib/site/content/schema/components/scrollProgress';
import { SearchPaletteProps } from '@/lib/site/content/schema/components/searchPalette';
import { AnnouncementBarProps } from '@/lib/site/content/schema/structures/announcementBar';
import { FooterProps } from '@/lib/site/content/schema/structures/footer';
import { NavigationProps } from '@/lib/site/content/schema/structures/navigation';

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
