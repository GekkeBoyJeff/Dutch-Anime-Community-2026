import { draftMode } from 'next/headers';

import { getPageByPath } from '@/lib/content';
import { env } from '@/lib/env';

// Dev/preview-only content inspector: resolves a path to its raw page content as JSON. 404s in
// production unless draft mode is on or the x-debug-secret header matches DEBUG_SECRET, so production
// never leaks content. Safe to delete this route if you don't need it.
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

	// Content here is already validated by the lib/content accessors. When this fetches from a CMS,
	// validate at that boundary with Page.safeParse(...) and return the prettified error — see Validation.mdx.
	return Response.json(data);
};
