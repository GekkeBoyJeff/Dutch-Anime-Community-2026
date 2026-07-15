import { notFound } from 'next/navigation';

import JsonLd from '@/components/basics/JsonLd';
import { Blocks } from '@/components/contentBlocks';
import { getPageByPath } from '@/lib/content';
import { pageJsonLd } from '@/lib/seo';

interface PageViewProps {
	/** The route path to render ('/', '/about'); looked up in the content layer */
	path: string;
}

// Renders a content page — its blocks plus any JSON-LD — for a given path. The home route
// (app/page.tsx) and the catch-all (app/[...slug]) both delegate here, so the two route files stay thin
// and identical apart from how they derive the path. A path with no page calls notFound(), which renders
// not-found.tsx inside the layout. It lives in a private `_components` folder (the leading underscore
// opts it out of routing): this is route-rendering plumbing, not a reusable UI tier like basics/structures.
const PageView = async ({ path }: PageViewProps) => {
	const page = await getPageByPath(path);
	if (!page) {
		notFound();
	}

	const graph = pageJsonLd(page.blocks, page.meta.structuredData);

	return (
		<main id="main" tabIndex={-1}>
			<Blocks blocks={page.blocks} />
			{graph && <JsonLd data={graph} />}
		</main>
	);
};

export default PageView;
