'use client';

import imageCompression from 'browser-image-compression';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import Alert from '@/components/basics/Alert';
import Container from '@/components/basics/Container';
import Spinner from '@/components/basics/Spinner';
import Title from '@/components/basics/Title';
import FileUpload from '@/components/components/FileUpload';
import { usePermissions } from '@/lib/auth/permissions';
import { getBrowserClient } from '@/lib/supabase/client';

// Media manager: browser-compress an image to webp, upload it to the public `media` bucket, and list
// the bucket so authors can copy public URLs (which become Media.src in the builder). Gated on
// media.manage; RLS enforces the same on the storage side.
const Uploader = () => {
	const router = useRouter();
	const { permissions, loading, session } = usePermissions();
	const canManage = permissions.has('media.manage');
	const [items, setItems] = useState<{ name: string; url: string }[]>([]);
	const [refreshKey, setRefreshKey] = useState(0);
	const [status, setStatus] = useState<{ variant: 'info' | 'success' | 'error'; text: string } | null>(null);

	useEffect(() => {
		if (loading) return;
		if (!session) {
			router.replace('/login?next=/upload');
			return;
		}
		if (!canManage) {
			router.replace('/dashboard');
			return;
		}
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
						.map((object) => ({ name: object.name, url: db.storage.from('media').getPublicUrl(object.name).data.publicUrl })),
				);
			});
		return () => {
			active = false;
		};
	}, [loading, session, canManage, router, refreshKey]);

	const onFiles = async (files: File[]) => {
		const file = files[0];
		if (!file) return;
		try {
			const compressed = await imageCompression(file, {
				maxWidthOrHeight: 2000,
				maxSizeMB: 0.5,
				useWebWorker: true,
				fileType: 'image/webp',
			});
			const name = `${Date.now()}-${file.name.replace(/\.[^.]+$/, '')}.webp`;
			const db = getBrowserClient();
			const { error } = await db.storage.from('media').upload(name, compressed, { contentType: 'image/webp', upsert: false });
			if (error) {
				setStatus({ variant: 'error', text: `Upload mislukt: ${error.message}` });
				return;
			}
			await navigator.clipboard.writeText(db.storage.from('media').getPublicUrl(name).data.publicUrl).catch(() => {});
			setStatus({ variant: 'success', text: 'Geüpload — de publieke URL staat op je klembord.' });
			setRefreshKey((key) => key + 1);
		} catch (error) {
			setStatus({ variant: 'error', text: `Upload mislukt: ${(error as Error).message}` });
		}
	};

	const copyUrl = async (url: string) => {
		await navigator.clipboard.writeText(url).catch(() => {});
		setStatus({ variant: 'info', text: 'URL gekopieerd.' });
	};

	if (loading || !session || !canManage) {
		return (
			<Container element="main" className="dashboard">
				<Spinner label="Media laden" />
			</Container>
		);
	}

	return (
		<Container element="main" className="dashboard">
			<Title size={2}>Media</Title>
			<FileUpload
				accept="image/*"
				label="Sleep een afbeelding hierheen of klik om te bladeren"
				hint="Wordt gecomprimeerd naar webp (max 2000px)."
				onFilesChange={onFiles}
			/>
			{status && <Alert variant={status.variant}>{status.text}</Alert>}
			<div className="media-grid">
				{items.map((item) => (
					<button key={item.name} type="button" className="media-thumb" onClick={() => copyUrl(item.url)} title="Kopieer URL">
						{/* eslint-disable-next-line @next/next/no-img-element -- remote bucket thumbnail, not a content image */}
						<img src={item.url} alt={item.name} loading="lazy" />
					</button>
				))}
			</div>
		</Container>
	);
};

export default Uploader;
