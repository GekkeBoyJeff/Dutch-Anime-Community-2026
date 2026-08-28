import type { Metadata } from 'next';

import PageView from '@/app/_components/PageView';
import { getAllPagePaths } from '@/lib/site/content';
import { pageMetadata } from '@/lib/site/seo';

type SlugProps = { params: Promise<{ slug: string[] }> };

export const generateStaticParams = async () => {
	const paths = await getAllPagePaths();
	// Home ('/') is served by app/page.tsx; a required catch-all only matches paths with ≥1 segment.
	return paths.filter((path) => path !== '/').map((path) => ({ slug: path.replace(/^\//, '').split('/') }));
}

export const dynamicParams = false;

const pathFromSlug = (slug: string[]): string => {
	return `/${slug.join('/')}`;
};

export const generateMetadata = async ({ params }: SlugProps): Promise<Metadata> => {
	const { slug } = await params;
	return pageMetadata(pathFromSlug(slug));
};

const Page = async ({ params }: SlugProps) => {
	const { slug } = await params;
	return <PageView path={pathFromSlug(slug)} />;
};

export default Page;
