import { notFound } from 'next/navigation';

import JsonLd from '@/components/basics/JsonLd';
import { Blocks } from '@/components/contentBlocks';
import { getPageByPath } from '@/lib/site/content';
import { pageJsonLd } from '@/lib/site/seo';

type PageViewProps = { path: string };

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
