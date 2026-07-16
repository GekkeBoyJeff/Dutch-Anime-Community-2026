import type { Metadata } from 'next';

import Uploader from '@/app/(admin)/upload/_components/Uploader';

import '@/app/(admin)/dashboard/dashboard.scss';

export const metadata: Metadata = { title: 'Media', robots: { index: false, follow: false } };

const UploadPage = () => <Uploader />;

export default UploadPage;
