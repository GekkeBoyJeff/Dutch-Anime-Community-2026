'use client';

import { Toast } from '@base-ui/react/toast';
import { type SupabaseClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

import Button from '@/components/basics/Button';
import Icon from '@/components/basics/Icon';
import Drawer from '@/components/components/Drawer';
import Entry from '@/components/components/Entry';
import Field from '@/components/forms/Field';
import Select from '@/components/forms/Select';
import TextArea from '@/components/forms/TextArea';
import TextInput from '@/components/forms/TextInput';
import { type Evidence } from '@/lib/moderation/types';
import { prepareReceipt } from '@/lib/receipts/prepareReceipt';
import { getBrowserClient } from '@/lib/supabase/client';

type EvidKind = 'image' | 'link' | 'text';

// Marker glyph per evidence kind, so the sort is visible instead of read. The icon set has no
// picture glyph, so an uploaded image/PDF shares the file glyph and a free note gets the pencil.
const EVIDENCE_ICON: Record<string, string> = { image: 'file', link: 'link', text: 'edit' };

type Props = {
	table: 'mod_evidence' | 'mod_link_evidence';
	fkColumn: 'warning_id' | 'link_id';
	fkValue: string | null; // null = drawer dicht
	title: string;
	canManage: boolean;
	canDelete: boolean;
	onClose: () => void;
};

// Gedeeld bewijs-beheer voor warnings (mod_evidence/warning_id) én links (mod_link_evidence/link_id):
// afbeelding/PDF uploaden naar de privé mod-evidence-bucket (pad <fk>/<bestand>), link of vrije notitie,
// downloaden via signed URL, verwijderen (records.delete). Bewijs is moderatie-only.
const EvidenceDrawer = ({ table, fkColumn, fkValue, title, canManage, canDelete, onClose }: Props) => {
	const toast = Toast.useToastManager();
	const [items, setItems] = useState<Evidence[]>([]);
	const [refreshKey, setRefreshKey] = useState(0);
	const [kind, setKind] = useState<EvidKind>('image');
	const [file, setFile] = useState<File | null>(null);
	const [url, setUrl] = useState('');
	const [body, setBody] = useState('');
	const [busy, setBusy] = useState(false);

	// Reset lijst + composer zodra we naar een ander record (of dicht) wisselen: de drawer is één vaste
	// instance, dus anders draagt bewijs/invoer van het vórige record over. Aanpassen-tijdens-render i.p.v.
	// een effect (geen setState-in-effect).
	const [shownFk, setShownFk] = useState<string | null>(fkValue);
	if (fkValue !== shownFk) {
		setShownFk(fkValue);
		setItems([]);
		setKind('image');
		setFile(null);
		setUrl('');
		setBody('');
	}

	useEffect(() => {
		if (!fkValue) return;
		let active = true;
		getBrowserClient()
			.from(table)
			.select('id, kind, storage_path, url, body')
			.eq(fkColumn as never, fkValue)
			.order('created_at', { ascending: false })
			.then(({ data, error }) => {
				if (!active) return;
				if (error) {
					toast.add({ title: 'Kon bewijs niet laden', description: error.message, type: 'error' });
					return;
				}
				setItems((data ?? []) as Evidence[]);
			});
		return () => {
			active = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [table, fkColumn, fkValue, refreshKey]);

	const add = async () => {
		if (!fkValue) return;
		setBusy(true);
		try {
			const db = getBrowserClient();
			let storagePath: string | null = null;
			if (kind === 'image') {
				if (!file) {
					toast.add({ title: 'Kies een bestand.', type: 'error' });
					return;
				}
				let prepared: File;
				try {
					prepared = await prepareReceipt(file);
				} catch (e) {
					toast.add({ title: 'Bestand niet verwerkt', description: e instanceof Error ? e.message : undefined, type: 'error' });
					return;
				}
				storagePath = `${fkValue}/${prepared.name}`;
				const up = await db.storage.from('mod-evidence').upload(storagePath, prepared, { contentType: prepared.type, upsert: false });
				if (up.error) {
					toast.add({ title: 'Upload mislukt', description: up.error.message, type: 'error' });
					return;
				}
			}
			const { error } = await (db as unknown as SupabaseClient).from(table).insert({
				[fkColumn]: fkValue,
				kind,
				storage_path: storagePath,
				url: kind === 'link' ? url.trim() || null : null,
				body: kind === 'text' ? body.trim() || null : null,
			});
			if (error) {
				if (storagePath) await db.storage.from('mod-evidence').remove([storagePath]);
				toast.add({ title: 'Er ging iets mis', description: error.message, type: 'error' });
				return;
			}
			setFile(null);
			setUrl('');
			setBody('');
			setRefreshKey((k) => k + 1);
			toast.add({ title: 'Bewijs toegevoegd', type: 'success' });
		} finally {
			setBusy(false);
		}
	};

	const download = async (path: string) => {
		const { data, error } = await getBrowserClient().storage.from('mod-evidence').createSignedUrl(path, 120);
		if (error || !data) {
			toast.add({ title: 'Kon bewijs niet openen', description: error?.message, type: 'error' });
			return;
		}
		window.open(data.signedUrl, '_blank', 'noopener');
	};

	const remove = async (item: Evidence) => {
		const db = getBrowserClient();
		// .select() zodat een RLS-no-op (verwijderen vereist records.delete) niet als succes wordt gemeld.
		const { data, error } = await db.from(table).delete().eq('id', item.id).select();
		if (error) {
			toast.add({ title: 'Er ging iets mis', description: error.message, type: 'error' });
			return;
		}
		if (!data || data.length === 0) {
			toast.add({ title: 'Verwijderen niet gelukt', description: 'Je hebt geen rechten om bewijs te verwijderen.', type: 'error' });
			return;
		}
		if (item.storage_path) await db.storage.from('mod-evidence').remove([item.storage_path]);
		setRefreshKey((k) => k + 1);
		toast.add({ title: 'Bewijs verwijderd', type: 'success' });
	};

	return (
		<Drawer
			open={fkValue !== null}
			onOpenChange={(o) => !o && onClose()}
			title={title}
			size="30rem"
			footer={
				<Button variant="secondary" onClick={onClose}>
					Sluiten
				</Button>
			}
		>
			{fkValue && (
				<div className="inventory-form">
					<Entry.List>
						{items.length === 0 && <li className="con-note">Nog geen bewijs.</li>}
						{items.map((it) => (
							<Entry
								key={it.id}
								marker={<Icon name={EVIDENCE_ICON[it.kind] ?? 'file'} />}
								main={it.kind === 'image' ? 'Afbeelding/PDF' : it.kind === 'link' ? it.url ?? 'Link' : it.body ?? 'Notitie'}
								trailing={
									<span className="inventory-row-actions">
										{it.storage_path && (
											<Button variant="secondary" icon="download" onClick={() => download(it.storage_path as string)}>
												Open
											</Button>
										)}
										{it.url && (
											<Button variant="secondary" url={it.url}>
												Link
											</Button>
										)}
										{canDelete && (
											<Button variant="ghost" icon="trash" onClick={() => remove(it)}>
												Verwijder
											</Button>
										)}
									</span>
								}
							/>
						))}
					</Entry.List>
					{canManage && (
						<>
							<Field name="kind">
								<Field.Label>Soort bewijs</Field.Label>
								<Select
									native
									value={kind}
									onValueChange={(v) => setKind(((v as string) ?? 'image') as EvidKind)}
									options={[
										{ value: 'image', label: 'Afbeelding/PDF' },
										{ value: 'link', label: 'Link' },
										{ value: 'text', label: 'Notitie' },
									]}
								/>
							</Field>
							{kind === 'image' && (
								<Field name="file">
									<Field.Label>Bestand</Field.Label>
									<TextInput type="file" accept="image/*,application/pdf" onChange={(e) => setFile(e.currentTarget.files?.[0] ?? null)} />
								</Field>
							)}
							{kind === 'link' && (
								<Field name="url">
									<Field.Label>URL</Field.Label>
									<TextInput value={url} onChange={(e) => setUrl(e.currentTarget.value)} />
								</Field>
							)}
							{kind === 'text' && (
								<Field name="body">
									<Field.Label>Notitie</Field.Label>
									<TextArea value={body} onChange={(e) => setBody(e.currentTarget.value)} />
								</Field>
							)}
							<Button variant="primary" onClick={add} disabled={busy}>
								{busy ? 'Bezig…' : 'Bewijs toevoegen'}
							</Button>
						</>
					)}
				</div>
			)}
		</Drawer>
	);
};

export default EvidenceDrawer;
