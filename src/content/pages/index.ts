import { communityPage } from '@/content/pages/community';
import { evenementenPage } from '@/content/pages/evenementen';
import { homePage } from '@/content/pages/home';
import { wordLidPage } from '@/content/pages/word-lid';
import type { Page } from '@/lib/content';

// Registry: path → page data. One place that maps a route to content; the home and [...slug] routes render these.
export const pages: Record<string, Page> = {
	'/': homePage,
	'/community': communityPage,
	'/evenementen': evenementenPage,
	'/word-lid': wordLidPage,
};
