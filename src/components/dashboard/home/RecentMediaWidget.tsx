'use client';

import ImageList from '@/components/components/ImageList';
import AsyncCard from '@/components/dashboard/structures/AsyncCard';

import type { WidgetProps } from './types';
import { useWidgetData } from './useWidgetData';

// A strip of the most recently uploaded images, for media managers. Reuses the Uploader's storage
// idiom: list the public `media` bucket, newest first, and resolve public URLs for the thumbnails.
// Renders through the tier ImageList component.
const RecentMediaWidget = ({ session: _session }: WidgetProps) => {
	const { loading, error, data } = useWidgetData(async (db) => {
		const { data: objects, error: listError } = await db.storage.from('media').list('', { limit: 8, sortBy: { column: 'created_at', order: 'desc' } });
		if (listError) throw listError;

		const images = (objects ?? [])
			.filter((object) => object.id && (object.metadata?.mimetype as string | undefined)?.startsWith('image/'))
			.slice(0, 6)
			.map((object) => ({ name: object.name, url: db.storage.from('media').getPublicUrl(object.name).data.publicUrl }));
		return images.length > 0 ? images : null;
	});

	return (
		<AsyncCard title="Recente media" href="/upload" linkLabel="Naar media" loading={loading} error={error} isEmpty={!data} hideWhenEmpty>
			{data && <ImageList items={data.map((image) => ({ type: 'image', src: image.url, alt: image.name }))} columns={3} layout="grid" />}
		</AsyncCard>
	);
};

export default RecentMediaWidget;
