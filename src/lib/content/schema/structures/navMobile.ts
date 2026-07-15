import { z } from 'zod';

import { NavCta, NavItem } from '@/lib/content/schema/structures/navigation';

// The mobile sheet repeats the desktop navigation's data — one owner (navigation.ts), no re-declared shapes.
export const NavMobileProps = z
	.object({
		items: z.array(NavItem).optional().describe('The links repeated inside the mobile panel'),
		cta: NavCta.optional().describe('The call-to-action repeated at the foot of the panel'),
	})
	.meta({ title: 'NavMobile' });
export type NavMobileProps = z.infer<typeof NavMobileProps>;
