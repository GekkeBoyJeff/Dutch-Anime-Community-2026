import type { Metadata } from 'next';

import Uploader from '@/components/dashboard/upload/Uploader';

export const metadata: Metadata = { title: 'Media', robots: { index: false, follow: false } };

const UploadPage = () => <Uploader />;

export default UploadPage;
