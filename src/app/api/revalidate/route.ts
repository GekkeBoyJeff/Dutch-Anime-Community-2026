import { revalidatePath } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';

import { env } from '@/lib/shared/env';

// Nothing calls this yet: it is the prepared webhook a CMS hits after a content change, so the
// affected path (?path=/about) is revalidated.
export const POST = async (request: NextRequest) => {
	const secret = request.headers.get('x-revalidate-secret') ?? request.nextUrl.searchParams.get('secret');
	if (!env.REVALIDATE_SECRET || secret !== env.REVALIDATE_SECRET) {
		// 404 (not 401) so the endpoint's existence isn't advertised.
		return new NextResponse('Not found', { status: 404 });
	}

	const path = request.nextUrl.searchParams.get('path');
	if (path) {
		revalidatePath(path);
	}

	return NextResponse.json({ revalidated: Boolean(path), path });
};
