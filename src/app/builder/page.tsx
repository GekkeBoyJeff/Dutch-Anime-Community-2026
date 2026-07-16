import type { Metadata } from 'next';

import PuckEditor from '@/app/builder/_components/PuckEditor';

import '@puckeditor/core/puck.css';
import '@puckeditor/plugin-heading-analyzer/dist/index.css';
import '@/app/builder/editor.scss';

export const metadata: Metadata = {
	title: 'Builder',
	robots: { index: false, follow: false },
};

// The visual builder ships in the static export now; access is gated client-side by the `pages.edit`
// permission (PuckEditor) with RLS as the real boundary.
const BuilderPage = () => <PuckEditor />;

export default BuilderPage;
