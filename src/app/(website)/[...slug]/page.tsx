import type { Metadata } from 'next';

import PageView from '@/app/_components/PageView';
import { getAllPagePaths } from '@/lib/content';
import { pageMetadata } from '@/lib/seo';

// Renders every non-home page from the content registry: one route for all of them, statically
// prerendered at build. dynamicParams=false → a path that isn't registered 404s (renders not-found.tsx).
export const generateStaticParams = async () => {
	const paths = await getAllPagePaths();
	// Home ('/') is served by app/page.tsx; a required catch-all only matches paths with ≥1 segment.
	return paths.filter((path) => path !== '/').map((path) => ({ slug: path.replace(/^\//, '').split('/') }));
}

export const dynamicParams = false;

const pathFromSlug = (slug: string[]): string => {
	return `/${slug.join('/')}`;
};

export const generateMetadata = async ({ params }: { params: Promise<{ slug: string[] }> }): Promise<Metadata> => {
	const { slug } = await params;
	return pageMetadata(pathFromSlug(slug));
};

const Page = async ({ params }: { params: Promise<{ slug: string[] }> }) => {
	const { slug } = await params;
	return <PageView path={pathFromSlug(slug)} />;
};

export default Page;
