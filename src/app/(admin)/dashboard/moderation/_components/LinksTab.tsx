'use client';

import { Toast } from '@base-ui/react/toast';
import { useEffect, useMemo, useState } from 'react';

import EvidenceDrawer from '@/app/(admin)/dashboard/moderation/_components/EvidenceDrawer';
import Button from '@/components/basics/Button';
import StatusBadge from '@/components/basics/StatusBadge';
import ConfirmDialog from '@/components/components/ConfirmDialog';
import Drawer from '@/components/components/Drawer';
import Field from '@/components/forms/Field';
import Select from '@/components/forms/Select';
import TextArea from '@/components/forms/TextArea';
import { LINK_STATUS_LABELS, LINK_STATUS_OPTIONS, type LinkStatus, type Subject, type SubjectLink } from '@/lib/moderation/types';
import { getBrowserClient } from '@/lib/supabase/client';

type Props = { subjectId: string; sessionUserId: string; canManage: boolean; canDelete: boolean };
const STATUS_VARIANT: Record<LinkStatus, string> = { suspected: 'requested', confirmed: 'active', rejected: 'cancelled' };

// Alt-account-links (mod_subject_links): koppelen, status zetten, bewijs, en bevestigde dubbelen samenvoegen
// (merge_subjects — rijen blijven staan, resolutie via canonical_subject_id).
const LinksTab = ({ subjectId, sessionUserId, canManage, canDelete }: Props) => {
	const toast = Toast.useToastManager();
	const [links, setLinks] = useState<SubjectLink[]>([]);
	const [names, setNames] = useState<Map<string, string>>(new Map());
	const [others, setOthers] = useState<{ value: string; label: string }[]>([]);
	const [refreshKey, setRefreshKey] = useState(0);
	const [form, setForm] = useState<{ other: string; reason: string } | null>(null);
	const [evidenceFor, setEvidenceFor] = useState<string | null>(null);
	const [toMerge, setToMerge] = useState<{ other: string; label: string } | null>(null);

	useEffect(() => {
		let active = true;
		const db = getBrowserClient();
		Promise.all([
			db.from('mod_subject_links').select('id, subject_low, subject_high, status, reason, created_at').or(`subject_low.eq.${subjectId},subject_high.eq.${subjectId}`),
			db.from('mod_subjects').select('id, discord_id, discord_name, user_id, merged_into, created_at'),
			db.from('subject_names').select('id, display_name'),
		]).then((res) => {
			if (!active) return;
			const failed = res.find((r) => r.error)?.error;
			if (failed) {
				toast.add({ title: 'Kon links niet laden', description: failed.message, type: 'error' });
				return;
			}
			const [{ data: linkRows }, { data: subjects }, { data: nameRows }] = res;
			const nameMap = new Map((nameRows ?? []).map((n) => [n.id as string, n.display_name as string]));
			const resolved = new Map<string, string>();
			for (const s of (subjects ?? []) as Subject[]) resolved.set(s.id, nameMap.get(s.id) ?? s.discord_name ?? s.discord_id ?? s.id.slice(0, 8));
			setNames(resolved);
			setLinks((linkRows ?? []) as SubjectLink[]);
			setOthers(
				((subjects ?? []) as Subject[])
					.filter((s) => s.id !== subjectId)
					.map((s) => ({ value: s.id, label: resolved.get(s.id) ?? s.id.slice(0, 8) }))
					.sort((a, b) => a.label.localeCompare(b.label)),
			);
		});
		return () => {
			active = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [subjectId, refreshKey]);

	const otherOf = (l: SubjectLink): string => (l.subject_low === subjectId ? l.subject_high : l.subject_low);
	const nameOf = (id: string): string => names.get(id) ?? id.slice(0, 8);

	const addLink = async () => {
		if (!form || !form.other) {
			toast.add({ title: 'Kies een profiel.', type: 'error' });
			return;
		}
		const [low, high] = [subjectId, form.other].sort() as [string, string];
		const { error } = await getBrowserClient()
			.from('mod_subject_links')
			.insert({ subject_low: low, subject_high: high, reason: form.reason.trim() || null, created_by: sessionUserId });
		if (error) {
			toast.add({ title: 'Er ging iets mis', description: error.message, type: 'error' });
			return;
		}
		setForm(null);
		setRefreshKey((k) => k + 1);
		toast.add({ title: 'Link toegevoegd', type: 'success' });
	};

	const setStatus = async (id: string, status: LinkStatus) => {
		const { error } = await getBrowserClient()
			.from('mod_subject_links')
			.update({ status, reviewed_by: sessionUserId, reviewed_at: new Date().toISOString() })
			.eq('id', id);
		if (error) {
			toast.add({ title: 'Er ging iets mis', description: error.message, type: 'error' });
			return;
		}
		setRefreshKey((k) => k + 1);
		toast.add({ title: 'Status bijgewerkt', type: 'success' });
	};

	const merge = async (otherId: string) => {
		const { error } = await getBrowserClient().rpc('merge_subjects', { p_from: otherId, p_into: subjectId });
		if (error) {
			toast.add({ title: 'Samenvoegen mislukt', description: error.message, type: 'error' });
			return;
		}
		setRefreshKey((k) => k + 1);
		toast.add({ title: 'Profiel samengevoegd in dit profiel', type: 'success' });
	};

	return (
		<div className="inventory-tab">
			{canManage && (
				<div className="inventory-toolbar">
					<Button variant="primary" icon="plus" onClick={() => setForm({ other: '', reason: '' })}>
						Link toevoegen
					</Button>
				</div>
			)}
			<ul className="con-list">
				{links.length === 0 && <li className="con-note">Nog geen gekoppelde profielen.</li>}
				{links.map((l) => {
					const other = otherOf(l);
					return (
						<li key={l.id} className="con-line">
							<div className="con-line-info">
								<span className="con-line-main">{nameOf(other)}</span>
								{l.reason && <span className="con-note">{l.reason}</span>}
							</div>
							<div className="con-line-actions">
								<StatusBadge domain="request" status={STATUS_VARIANT[l.status]} label={LINK_STATUS_LABELS[l.status]} />
								{canManage && (
									<Select
										native
										aria-label="Status"
										value={l.status}
										options={LINK_STATUS_OPTIONS}
										onValueChange={(v) => setStatus(l.id, ((v as string) ?? 'suspected') as LinkStatus)}
									/>
								)}
								<Button variant="secondary" onClick={() => setEvidenceFor(l.id)}>
									Bewijs
								</Button>
								{canManage && l.status === 'confirmed' && (
									<Button variant="ghost" onClick={() => setToMerge({ other, label: nameOf(other) })}>
										Samenvoegen
									</Button>
								)}
							</div>
						</li>
					);
				})}
			</ul>

			<Drawer
				open={form !== null}
				onOpenChange={(o) => !o && setForm(null)}
				title="Link toevoegen"
				size="30rem"
				footer={
					<>
						<Button variant="secondary" onClick={() => setForm(null)}>
							Annuleren
						</Button>
						<Button variant="primary" onClick={addLink}>
							Toevoegen
						</Button>
					</>
				}
			>
				{form && (
					<div className="inventory-form">
						<Field name="other">
							<Field.Label>Gekoppeld profiel</Field.Label>
							<Select native value={form.other} onValueChange={(v) => setForm({ ...form, other: (v as string) ?? '' })} options={[{ value: '', label: 'Kies profiel…' }, ...others]} />
						</Field>
						<Field name="reason">
							<Field.Label>Reden / vermoeden</Field.Label>
							<TextArea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.currentTarget.value })} />
						</Field>
					</div>
				)}
			</Drawer>

			<EvidenceDrawer
				table="mod_link_evidence"
				fkColumn="link_id"
				fkValue={evidenceFor}
				title="Bewijs bij link"
				canManage={canManage}
				canDelete={canDelete}
				onClose={() => setEvidenceFor(null)}
			/>

			<ConfirmDialog
				open={toMerge !== null}
				onOpenChange={(o) => !o && setToMerge(null)}
				title="Profielen samenvoegen?"
				description={toMerge ? `"${toMerge.label}" wordt in dit profiel samengevoegd. De rijen blijven bestaan; je kunt het later loskoppelen.` : undefined}
				confirmLabel="Samenvoegen"
				onConfirm={() => {
					if (toMerge) merge(toMerge.other);
					setToMerge(null);
				}}
			/>
		</div>
	);
};

export default LinksTab;
