import type { Metadata } from 'next';

import PageView from '@/app/_components/PageView';
import { pageMetadata } from '@/lib/site/seo';

export const generateMetadata = (): Promise<Metadata> => {
	return pageMetadata('/');
};

const Home = () => {
	return <PageView path="/" />;
};

export default Home;
