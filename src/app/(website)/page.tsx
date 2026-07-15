import type { Metadata } from 'next';

import PageView from '@/app/_components/PageView';
import { pageMetadata } from '@/lib/seo';

// The home route ('/'). A required catch-all can't match the root, so home gets its own route file;
// every other path is rendered by app/[...slug]. Both delegate to the shared PageView/pageMetadata.
export const generateMetadata = (): Promise<Metadata> => {
	return pageMetadata('/');
};

const Home = () => {
	return <PageView path="/" />;
};

export default Home;
