import { draftMode } from 'next/headers';

import { env } from '@/lib/shared/env';
import { getPageByPath } from '@/lib/site/content';

export const dynamic = 'force-dynamic'; // never cache a debug endpoint

export const GET = async (request: Request) => {
	const { searchParams } = new URL(request.url);
	const draft = await draftMode();
	const secret = request.headers.get('x-debug-secret') ?? searchParams.get('secret');

	const allowed =
		env.NODE_ENV !== 'production' ||
		draft.isEnabled ||
		(env.DEBUG_SECRET && secret === env.DEBUG_SECRET);

	// Respond with 404 (not 401/403) so the endpoint's existence isn't advertised in production.
	if (!allowed) {
		return new Response('Not found', { status: 404 });
	}

	const data = await getPageByPath(searchParams.get('path') ?? '/');
	if (!data) {
		return new Response('Not found', { status: 404 });
	}

	return Response.json(data);
};
