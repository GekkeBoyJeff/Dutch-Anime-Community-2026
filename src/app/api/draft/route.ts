import { draftMode } from 'next/headers';
import { type NextRequest, NextResponse } from 'next/server';

import { env } from '@/lib/env';

// Toggle Next.js Draft Mode for content preview. ?enable=1 turns it on, anything else turns it off.
// Gated by the same DEBUG_SECRET the content-inspector route uses. A future CMS "preview" button links
// here; routes that read draftMode() (e.g. the content inspector) then serve draft content.
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
