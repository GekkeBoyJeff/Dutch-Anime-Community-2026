import type { Metadata } from 'next';

import SurveysManager from '@/app/(admin)/dashboard/surveys/_components/SurveysManager';

import '@/app/(admin)/dashboard/surveys.scss';

export const metadata: Metadata = { title: 'Enquêtes & polls', robots: { index: false, follow: false } };

const SurveysPage = () => <SurveysManager />;

export default SurveysPage;
