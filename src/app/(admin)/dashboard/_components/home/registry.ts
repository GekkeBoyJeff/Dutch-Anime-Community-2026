import type { ComponentType } from 'react';

import type { Permission } from '@/lib/auth/permissions';

import AccessChangesWidget from './AccessChangesWidget';
import AuditFlagsWidget from './AuditFlagsWidget';
import MyExpensesWidget from './MyExpensesWidget';
import NextShiftWidget from './NextShiftWidget';
import OpenSurveysWidget from './OpenSurveysWidget';
import PackingListWidget from './PackingListWidget';
import PendingReviewsWidget from './PendingReviewsWidget';
import RecentMediaWidget from './RecentMediaWidget';
import type { WidgetProps } from './types';
import UpcomingConventionWidget from './UpcomingConventionWidget';

// A home widget is data: a permission gate, the zone it belongs to, and the component to render. The
// home composes the visible set from the user's permissions — action-first personal widgets on top,
// org/management widgets below — so the landing page reflects the role, not one flat grid for everyone.
type WidgetZone = 'personal' | 'org';

export interface WidgetDef {
	key: string;
	/** The permission that unlocks it, or 'always' for one every signed-in member sees */
	requiredPermission: Permission | 'always';
	zone: WidgetZone;
	component: ComponentType<WidgetProps>;
}

export const WIDGETS: WidgetDef[] = [
	{ key: 'next-shift', requiredPermission: 'inventory.view', zone: 'personal', component: NextShiftWidget },
	{ key: 'packing-list', requiredPermission: 'inventory.view', zone: 'personal', component: PackingListWidget },
	{ key: 'my-expenses', requiredPermission: 'expenses.view', zone: 'personal', component: MyExpensesWidget },
	{ key: 'upcoming-convention', requiredPermission: 'inventory.manage', zone: 'org', component: UpcomingConventionWidget },
	{ key: 'pending-reviews', requiredPermission: 'expenses.manage', zone: 'org', component: PendingReviewsWidget },
	{ key: 'open-surveys', requiredPermission: 'surveys.manage', zone: 'org', component: OpenSurveysWidget },
	{ key: 'recent-media', requiredPermission: 'media.manage', zone: 'org', component: RecentMediaWidget },
	{ key: 'access-changes', requiredPermission: 'roles.manage', zone: 'org', component: AccessChangesWidget },
	{ key: 'audit-flags', requiredPermission: 'logs.view', zone: 'org', component: AuditFlagsWidget },
];

// The widgets a user may see, in registry order. 'always' widgets show for everyone signed in.
export const visibleWidgets = (permissions: ReadonlySet<Permission>): WidgetDef[] =>
	WIDGETS.filter((widget) => widget.requiredPermission === 'always' || permissions.has(widget.requiredPermission));
