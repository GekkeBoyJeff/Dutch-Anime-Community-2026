import type { Metadata } from 'next';
import { Suspense } from 'react';

import SurveyFill from '@/app/enquete/_components/SurveyFill';

import '@/app/enquete/enquete.scss';

export const metadata: Metadata = { title: 'Enquête', robots: { index: false, follow: false } };

// SurveyFill leest ?id via useSearchParams → binnen een Suspense-grens bij static export.
const EnquetePage = () => (
	<Suspense>
		<SurveyFill />
	</Suspense>
);

export default EnquetePage;
