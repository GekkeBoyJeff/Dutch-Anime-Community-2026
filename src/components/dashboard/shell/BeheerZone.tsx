'use client';

import type { Session } from '@supabase/supabase-js';
import { useState } from 'react';

import Collapsible from '@/components/basics/Collapsible';
import Icon from '@/components/basics/Icon';
import Title from '@/components/basics/Title';

import type { OrgDomain, WidgetDef } from '../home/registry';

// The admin Beheer-zone (blueprint §1b): the org widgets folded into collapsible Operatie/Content/Systeem
// groups instead of one flat pile, with per-group open state persisted to localStorage and Systeem dimmed
// and collapsed by default. A "toon alles" toggle flips every group at once. Only the admin home mounts
// this — yakuza/author keep the flat grid (they hold few org widgets and want them at hand).

const DOMAIN_ORDER: OrgDomain[] = ['operatie', 'content', 'systeem'];
const DOMAIN_LABEL: Record<OrgDomain, string> = { operatie: 'Operatie', content: 'Content', systeem: 'Systeem' };
// Systeem starts collapsed — toezicht, geen dagelijkse taak (blueprint §1c).
const DOMAIN_DEFAULT_OPEN: Record<OrgDomain, boolean> = { operatie: true, content: true, systeem: false };
const STORAGE_PREFIX = 'dac:beheer:';

const readOpen = (domain: OrgDomain): boolean => {
	if (typeof window === 'undefined') return DOMAIN_DEFAULT_OPEN[domain];
	const stored = window.localStorage.getItem(`${STORAGE_PREFIX}${domain}`);
	return stored === null ? DOMAIN_DEFAULT_OPEN[domain] : stored === '1';
};

interface BeheerZoneProps {
	widgets: WidgetDef[];
	session: Session;
}

const BeheerZone = ({ widgets, session }: BeheerZoneProps) => {
	const groups = DOMAIN_ORDER.map((domain) => ({ domain, items: widgets.filter((widget) => widget.domain === domain) })).filter((group) => group.items.length > 0);
	const [open, setOpen] = useState<Record<string, boolean>>(() => Object.fromEntries(groups.map((group) => [group.domain, readOpen(group.domain)])));

	const setGroup = (domain: OrgDomain, next: boolean) => {
		setOpen((prev) => ({ ...prev, [domain]: next }));
		if (typeof window !== 'undefined') window.localStorage.setItem(`${STORAGE_PREFIX}${domain}`, next ? '1' : '0');
	};

	const allOpen = groups.every((group) => open[group.domain]);
	const toggleAll = () => {
		const next = !allOpen;
		for (const group of groups) setGroup(group.domain, next);
	};

	if (groups.length === 0) return null;

	return (
		<section className="widget-zone beheer-zone">
			<header className="beheer-head">
				<Title element="h2" size={5} value="Beheer" />
				<button type="button" className="beheer-toggle-all" onClick={toggleAll}>
					{allOpen ? 'Alles inklappen' : 'Toon alles'}
				</button>
			</header>

			{groups.map((group) => (
				<Collapsible
					key={group.domain}
					className={`beheer-group${group.domain === 'systeem' ? ' is-muted' : ''}`}
					open={open[group.domain]}
					onOpenChange={(next) => setGroup(group.domain, next)}
					trigger={
						<>
							<span className="label beheer-group-label">
								{DOMAIN_LABEL[group.domain]}
								<span className="beheer-group-count">{group.items.length}</span>
							</span>
							<Icon name="chevron-down" className="chevron" />
						</>
					}
				>
					<div className="widget-grid">
						{group.items.map(({ key, component: Widget }) => (
							<Widget key={key} session={session} />
						))}
					</div>
					{/* Every widget in this group self-hides when it has no data; the calm line then shows via
					    the `:empty` sibling rule, so an open group is never a blank void. */}
					<p className="beheer-empty">Niets wacht nu op je.</p>
				</Collapsible>
			))}
		</section>
	);
};

export default BeheerZone;
