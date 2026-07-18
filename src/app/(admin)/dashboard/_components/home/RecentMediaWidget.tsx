'use client';

import type { WidgetProps } from './types';
import { useWidgetData } from './useWidgetData';
import WidgetShell from './WidgetShell';

// A strip of the most recently uploaded images, for media managers. Reuses the Uploader's storage
// idiom: list the public `media` bucket, newest first, and resolve public URLs for the thumbnails.
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
		<WidgetShell title="Recente media" href="/upload" linkLabel="Naar media" loading={loading} error={error} isEmpty={!data} hideWhenEmpty>
			{data && (
				<div className="widget-media-grid">
					{data.map((image) => (
						// eslint-disable-next-line @next/next/no-img-element -- remote bucket thumbnail, no next/image on a static export
						<img key={image.name} src={image.url} alt={image.name} loading="lazy" className="widget-media-thumb" />
					))}
				</div>
			)}
		</WidgetShell>
	);
};

export default RecentMediaWidget;
