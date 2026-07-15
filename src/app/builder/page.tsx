import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import PuckEditor from '@/app/builder/_components/PuckEditor';

import '@puckeditor/core/puck.css';
import '@puckeditor/plugin-heading-analyzer/dist/index.css';
import '@/app/builder/editor.scss';

export const metadata: Metadata = {
	title: 'Builder',
	robots: { index: false, follow: false },
};

// The visual builder is developer tooling: development only. Production servers 404 the route at the
// routing layer (next.config rewrite) before this ever renders; the guard below is defence in depth,
// so even a misconfigured server renders the not-found boundary instead of shipping the editor.
const BuilderPage = () => {
	if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_ENABLE_BUILDER) {
		notFound();
	}

	return <PuckEditor />;
};

export default BuilderPage;
