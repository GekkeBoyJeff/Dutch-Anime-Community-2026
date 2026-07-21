'use client';

import Panel from '@/components/components/Panel';
import BadgeGallery from '@/components/dashboard/components/BadgeGallery';
import { useWidgetData } from '@/components/dashboard/home/useWidgetData';
import { getBrowserClient } from '@/lib/supabase/client';

interface MyBadge {
	title: string;
	description: string;
	image_path: string;
	awarded_on: string;
}

// A small personal flourish: the badges I have earned (my_badges RPC). Thumbnails from the public
// `badges` bucket. Purely celebratory — hidden until they arrive rather than nagging.
const Badges = () => {
	const { error, data } = useWidgetData(async (db) => {
		const { data: rows, error: queryError } = await db.rpc('my_badges');
		if (queryError) throw queryError;
		const badges = (rows ?? []) as MyBadge[];
		return badges.length > 0 ? badges.slice(0, 6) : null;
	});

	const badgeUrl = (path: string): string => getBrowserClient().storage.from('badges').getPublicUrl(path).data.publicUrl;

	return (
		<Panel title="Mijn badges" error={error} isEmpty={!data} hideWhenEmpty>
			{data && <BadgeGallery badges={data.map((badge) => ({ title: badge.title, imageUrl: badge.image_path ? badgeUrl(badge.image_path) : undefined }))} />}
		</Panel>
	);
};

export default Badges;
