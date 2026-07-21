import type { ComponentType } from 'react';

import { emphasisRole, type AppRole, type Permission } from '@/lib/auth/permissions';

import AccessChangesWidget from './AccessChangesWidget';
import AuditFlagsWidget from './AuditFlagsWidget';
import EntryTicketWidget from './EntryTicketWidget';
import EventsTimelineWidget from './EventsTimelineWidget';
import MyExpensesWidget from './MyExpensesWidget';
import NextShiftWidget from './NextShiftWidget';
import OpenSurveysWidget from './OpenSurveysWidget';
import PackingListWidget from './PackingListWidget';
import PendingReviewsWidget from './PendingReviewsWidget';
import PublishStatusWidget from './PublishStatusWidget';
import RecentMediaWidget from './RecentMediaWidget';
import TeamStatusWidget from './TeamStatusWidget';
import type { WidgetProps } from './types';
import UpcomingConventionWidget from './UpcomingConventionWidget';

// A home widget is data: a permission gate, the zone it belongs to, and the component to render. The
// home composes the visible set from the user's permissions — action-first personal widgets ('personal')
// beside ambient org context ('ambient'), with management widgets ('org') below — so the landing page
// reflects the role, not one flat grid for everyone.
type WidgetZone = 'personal' | 'ambient' | 'org';

// How prominent a widget is FOR A GIVEN ROLE — 'lead' floats to the top of its zone, 'quiet' sinks to the
// bottom, 'normal' keeps registry order. Visibility never depends on this (the permission gate owns that);
// weight only tilts the order so the same permission set reads differently per role (blueprint §1b:
// "nadruk volgt permissie, nooit rol" — the gate decides presence, the role decides emphasis).
type WidgetWeight = 'lead' | 'normal' | 'quiet';

// Sub-domain of an 'org' widget, used only by the admin Beheer-zone to fold its widgets into collapsible
// Operatie/Content/Systeem groups (blueprint §1b: admin's Beheer is grouped + collapsed, not one flat pile).
export type OrgDomain = 'operatie' | 'content' | 'systeem';

export interface WidgetDef {
	key: string;
	/** The permission that unlocks it */
	requiredPermission: Permission;
	zone: WidgetZone;
	/** Per-role emphasis; absent roles (and any unlisted) fall back to 'normal'. */
	weight?: Partial<Record<AppRole, WidgetWeight>>;
	/** For 'org' widgets only: the Beheer-zone group it collapses into for admins. */
	domain?: OrgDomain;
	component: ComponentType<WidgetProps>;
}

// Registry order is the tie-breaker within a weight band, so it doubles as the default reading order.
export const WIDGETS: WidgetDef[] = [
	{ key: 'next-shift', requiredPermission: 'inventory.view', zone: 'personal', weight: { 'stand-staff': 'lead', yakuza: 'lead' }, component: NextShiftWidget },
	{ key: 'packing-list', requiredPermission: 'inventory.view', zone: 'personal', weight: { 'stand-staff': 'lead' }, component: PackingListWidget },
	{ key: 'entry-ticket-info', requiredPermission: 'inventory.view', zone: 'personal', weight: { 'stand-staff': 'lead' }, component: EntryTicketWidget },
	{ key: 'my-expenses', requiredPermission: 'expenses.view', zone: 'personal', component: MyExpensesWidget },
	{ key: 'events-timeline', requiredPermission: 'inventory.view', zone: 'ambient', component: EventsTimelineWidget },
	{ key: 'upcoming-convention', requiredPermission: 'inventory.manage', zone: 'org', domain: 'operatie', weight: { yakuza: 'lead' }, component: UpcomingConventionWidget },
	{ key: 'pending-reviews', requiredPermission: 'expenses.manage', zone: 'org', domain: 'operatie', weight: { yakuza: 'lead' }, component: PendingReviewsWidget },
	{ key: 'team-status', requiredPermission: 'staff.manage', zone: 'org', domain: 'operatie', weight: { yakuza: 'lead' }, component: TeamStatusWidget },
	{ key: 'recent-media', requiredPermission: 'media.manage', zone: 'org', domain: 'content', weight: { author: 'lead', admin: 'quiet' }, component: RecentMediaWidget },
	{ key: 'open-surveys-manage', requiredPermission: 'surveys.manage', zone: 'org', domain: 'content', weight: { author: 'lead' }, component: OpenSurveysWidget },
	{ key: 'publish-status', requiredPermission: 'pages.edit', zone: 'org', domain: 'content', weight: { author: 'lead', admin: 'quiet' }, component: PublishStatusWidget },
	{ key: 'access-changes', requiredPermission: 'roles.manage', zone: 'org', domain: 'systeem', component: AccessChangesWidget },
	{ key: 'audit-flags', requiredPermission: 'logs.view', zone: 'org', domain: 'systeem', component: AuditFlagsWidget },
];

// The widgets a user may see, in registry order.
export const visibleWidgets = (permissions: ReadonlySet<Permission>): WidgetDef[] =>
	WIDGETS.filter((widget) => permissions.has(widget.requiredPermission));

export { emphasisRole };

const WEIGHT_RANK: Record<WidgetWeight, number> = { lead: 0, normal: 1, quiet: 2 };
const weightFor = (widget: WidgetDef, role: AppRole): WidgetWeight => widget.weight?.[role] ?? 'normal';

// Visible widgets ordered for the emphasis role: within each zone, 'lead' floats up and 'quiet' sinks,
// ties broken by registry order (a stable sort over the registry-ordered list). Callers still split by zone.
export const orderedWidgets = (permissions: ReadonlySet<Permission>, role: AppRole): WidgetDef[] =>
	visibleWidgets(permissions)
		.map((widget, index) => ({ widget, index }))
		.sort((a, b) => WEIGHT_RANK[weightFor(a.widget, role)] - WEIGHT_RANK[weightFor(b.widget, role)] || a.index - b.index)
		.map(({ widget }) => widget);
