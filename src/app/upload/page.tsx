import type { Metadata } from 'next';

import Uploader from '@/app/upload/_components/Uploader';

import '@/app/dashboard/dashboard.scss';

export const metadata: Metadata = { title: 'Media', robots: { index: false, follow: false } };

const UploadPage = () => <Uploader />;

export default UploadPage;
