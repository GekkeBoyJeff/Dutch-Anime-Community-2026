import { draftMode } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

import { env } from '@/lib/shared/env';

// Nothing calls this yet: it is the seam a CMS "preview" button links to, so routes that read
// draftMode() (the content inspector) serve draft content.
export const GET = async (request: NextRequest) => {
	const secret = request.headers.get('x-debug-secret') ?? request.nextUrl.searchParams.get('secret');
	const allowed = env.NODE_ENV !== 'production' || (env.DEBUG_SECRET && secret === env.DEBUG_SECRET);
	if (!allowed) {
		return new NextResponse('Not found', { status: 404 });
	}

	const draft = await draftMode();
	const enable = request.nextUrl.searchParams.get('enable') === '1';
	if (enable) {
		draft.enable();
	} else {
		draft.disable();
	}

	return NextResponse.json({ draftMode: enable });
};
