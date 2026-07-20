'use client';

import BadgeGallery from '@/components/dashboard/components/BadgeGallery';
import AsyncCard from '@/components/dashboard/structures/AsyncCard';
import { getBrowserClient } from '@/lib/supabase/client';

import type { WidgetProps } from './types';
import { useWidgetData } from './useWidgetData';

interface MyBadge {
	title: string;
	description: string;
	image_path: string;
	awarded_on: string;
}

// A small personal flourish: the badges I have earned (my_badges RPC, same as /account). Thumbnails from
// the public `badges` bucket. Purely celebratory — hidden when I have none rather than nagging.
const BadgesShowcase = ({ session: _session }: WidgetProps) => {
	const { loading, error, data } = useWidgetData(async (db) => {
		const { data: rows, error: queryError } = await db.rpc('my_badges');
		if (queryError) throw queryError;
		const badges = (rows ?? []) as MyBadge[];
		return badges.length > 0 ? badges.slice(0, 6) : null;
	});

	const badgeUrl = (path: string): string => getBrowserClient().storage.from('badges').getPublicUrl(path).data.publicUrl;

	return (
		<AsyncCard title="Mijn badges" href="/account" linkLabel="Naar mijn profiel" loading={loading} error={error} isEmpty={!data} hideWhenEmpty>
			{data && <BadgeGallery badges={data.map((badge) => ({ title: badge.title, imageUrl: badge.image_path ? badgeUrl(badge.image_path) : undefined }))} />}
		</AsyncCard>
	);
};

export default BadgesShowcase;
