import type { Metadata } from 'next';

import Container from '@/components/basics/Container';
import Title from '@/components/basics/Title';

export const metadata: Metadata = { title: 'Media', robots: { index: false, follow: false } };

const UploadPage = () => (
	<Container>
		<Title size={1} value="Media" />
	</Container>
);

export default UploadPage;
