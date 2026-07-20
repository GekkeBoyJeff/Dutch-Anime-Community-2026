import type { Metadata } from 'next';

import TeamManager from '@/components/dashboard/team/TeamManager';

export const metadata: Metadata = { title: 'Team', robots: { index: false, follow: false } };

const TeamPage = () => <TeamManager />;

export default TeamPage;
