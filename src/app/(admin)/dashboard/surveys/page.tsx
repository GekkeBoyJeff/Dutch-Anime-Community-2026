import type { Metadata } from 'next';

import SurveysManager from '@/components/dashboard/surveys/SurveysManager';

export const metadata: Metadata = { title: 'Enquêtes & polls', robots: { index: false, follow: false } };

const SurveysPage = () => <SurveysManager />;

export default SurveysPage;
