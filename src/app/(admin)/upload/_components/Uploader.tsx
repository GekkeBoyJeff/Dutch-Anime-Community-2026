'use client';

import imageCompression from 'browser-image-compression';
import { useEffect, useState } from 'react';

import Alert from '@/components/basics/Alert';
import Button from '@/components/basics/Button';
import Container from '@/components/basics/Container';
import Content from '@/components/basics/Content';
import Title from '@/components/basics/Title';
import FileUpload from '@/components/components/FileUpload';
import Modal from '@/components/components/Modal';
import { useDashboardGuard } from '@/hooks/useDashboardGuard';
import { compressPdf } from '@/lib/pdf/compressPdf';
import { getBrowserClient } from '@/lib/supabase/client';

interface MediaItem {
	name: string;
	url: string;
	createdAt: string | null;
	size: number | null;
	mimetype: string | null;
}

// Any raster image → converted to webp on upload. PDFs are accepted as-is (client-side PDF compression
// needs a server step — see notes). Everything else (incl. video) is rejected.
const IMAGE_TYPES = /^image\/(png|jpe?g|gif|avif|webp|bmp|tiff)$/i;

const formatBytes = (bytes: number | null): string => {
	if (bytes === null || bytes === undefined) return '—';
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const formatDate = (iso: string | null): string =>
	iso ? new Date(iso).toLocaleString('nl-NL', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

// Media manager: browser-compress images to webp, upload to the public `media` bucket, browse the
// bucket, and inspect/copy/delete each file. Gated on media.manage; RLS enforces the same server-side.
const Uploader = () => {
	const { ready, fallback } = useDashboardGuard('media.manage', { className: 'dashboard', label: 'Media laden' });
	const [items, setItems] = useState<MediaItem[]>([]);
	const [refreshKey, setRefreshKey] = useState(0);
	const [status, setStatus] = useState<{ variant: 'info' | 'success' | 'error'; text: string } | null>(null);
	const [selected, setSelected] = useState<MediaItem | null>(null);

	useEffect(() => {
		if (!ready) return;
		let active = true;
		const db = getBrowserClient();
		db.storage
			.from('media')
			.list('', { limit: 1000, sortBy: { column: 'created_at', order: 'desc' } })
			.then(({ data }) => {
				if (!active) return;
				setItems(
					(data ?? [])
						.filter((object) => object.id)
						.map((object) => ({
							name: object.name,
							url: db.storage.from('media').getPublicUrl(object.name).data.publicUrl,
							createdAt: object.created_at ?? null,
							size: (object.metadata?.size as number | undefined) ?? null,
							mimetype: (object.metadata?.mimetype as string | undefined) ?? null,
						})),
				);
			});
		return () => {
			active = false;
		};
	}, [ready, refreshKey]);

	const copyUrl = async (url: string) => {
		await navigator.clipboard.writeText(url).catch(() => {});
		setStatus({ variant: 'info', text: 'URL gekopieerd.' });
	};

	const onFiles = async (files: File[]) => {
		const file = files[0];
		if (!file) return;
		const db = getBrowserClient();
		try {
			if (IMAGE_TYPES.test(file.type)) {
				const compressed = await imageCompression(file, {
					maxWidthOrHeight: 2000,
					maxSizeMB: 0.5,
					useWebWorker: true,
					fileType: 'image/webp',
				});
				const name = `${Date.now()}-${file.name.replace(/\.[^.]+$/, '')}.webp`;
				const { error } = await db.storage.from('media').upload(name, compressed, { contentType: 'image/webp', upsert: false });
				if (error) {
					setStatus({ variant: 'error', text: `Upload mislukt: ${error.message}` });
					return;
				}
				await navigator.clipboard.writeText(db.storage.from('media').getPublicUrl(name).data.publicUrl).catch(() => {});
				setStatus({
					variant: 'success',
					text: `Afbeelding → webp (${formatBytes(file.size)} → ${formatBytes(compressed.size)}). URL gekopieerd.`,
				});
			} else if (file.type === 'application/pdf') {
				const pdf = await compressPdf(file); // best-effort; returns the original on any failure
				const name = `${Date.now()}-${pdf.name}`;
				const { error } = await db.storage.from('media').upload(name, pdf, { contentType: 'application/pdf', upsert: false });
				if (error) {
					setStatus({ variant: 'error', text: `Upload mislukt: ${error.message}` });
					return;
				}
				await navigator.clipboard.writeText(db.storage.from('media').getPublicUrl(name).data.publicUrl).catch(() => {});
				const shrunk = pdf.size < file.size;
				setStatus({
					variant: 'success',
					text: shrunk
						? `PDF gecomprimeerd (${formatBytes(file.size)} → ${formatBytes(pdf.size)}). URL gekopieerd.`
						: `PDF geüpload (${formatBytes(file.size)}). URL gekopieerd.`,
				});
			} else {
				setStatus({ variant: 'error', text: `Type niet toegestaan: ${file.type || 'onbekend'}. Alleen afbeeldingen en PDF.` });
				return;
			}
			setRefreshKey((key) => key + 1);
		} catch (error) {
			setStatus({ variant: 'error', text: `Upload mislukt: ${(error as Error).message}` });
		}
	};

	const removeItem = async (name: string) => {
		const { error } = await getBrowserClient().storage.from('media').remove([name]);
		if (error) {
			setStatus({ variant: 'error', text: `Verwijderen mislukt: ${error.message}` });
			return;
		}
		setSelected(null);
		setStatus({ variant: 'info', text: 'Bestand verwijderd.' });
		setRefreshKey((key) => key + 1);
	};

	if (!ready) return fallback;

	return (
		<Container className="dashboard">
			<Title size={2}>Media</Title>
			<FileUpload
				accept="image/*,application/pdf"
				label="Sleep een afbeelding of PDF hierheen of klik om te bladeren"
				hint="Afbeeldingen worden naar webp gecomprimeerd (max 2000px). Video's zijn niet toegestaan."
				onFilesChange={onFiles}
			/>
			{status && <Alert variant={status.variant}>{status.text}</Alert>}
			<div className="media-grid">
				{items.map((item) => (
					<button key={item.name} type="button" className="media-thumb" onClick={() => setSelected(item)} title={item.name}>
						{item.mimetype === 'application/pdf' ? (
							<span className="media-thumb-pdf">PDF</span>
						) : (
							// eslint-disable-next-line @next/next/no-img-element -- remote bucket thumbnail
							<img src={item.url} alt={item.name} loading="lazy" />
						)}
					</button>
				))}
			</div>

			<Modal
				open={selected !== null}
				onOpenChange={(open) => {
					if (!open) setSelected(null);
				}}
				title={selected?.name ?? ''}
				size="m"
				footer={
					<>
						<Button variant="secondary" onClick={() => selected && copyUrl(selected.url)}>
							URL kopiëren
						</Button>
						<Button variant="ghost" icon="trash" onClick={() => selected && removeItem(selected.name)}>
							Verwijderen
						</Button>
					</>
				}
			>
				{selected && (
					<div className="media-detail">
						{selected.mimetype !== 'application/pdf' && (
							// eslint-disable-next-line @next/next/no-img-element -- remote preview
							<img src={selected.url} alt={selected.name} className="media-detail-preview" />
						)}
						<dl>
							<dt>Geüpload</dt>
							<dd>{formatDate(selected.createdAt)}</dd>
							<dt>Grootte</dt>
							<dd>{formatBytes(selected.size)}</dd>
							<dt>Type</dt>
							<dd>{selected.mimetype ?? '—'}</dd>
							<dt>URL</dt>
							<dd>
								<Content element="span">{selected.url}</Content>
							</dd>
						</dl>
					</div>
				)}
			</Modal>
		</Container>
	);
};

export default Uploader;
