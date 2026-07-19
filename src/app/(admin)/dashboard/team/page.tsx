import type { Metadata } from 'next';

import TeamManager from '@/app/(admin)/dashboard/team/_components/TeamManager';

import '@/app/(admin)/dashboard/inventory.scss';
import '@/app/(admin)/dashboard/team/team.scss';

export const metadata: Metadata = { title: 'Team', robots: { index: false, follow: false } };

const TeamPage = () => <TeamManager />;

export default TeamPage;
