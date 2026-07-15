import { revalidatePath } from 'next/cache';
import { type NextRequest, NextResponse } from 'next/server';

import { env } from '@/lib/env';

// On-demand revalidation seam for a future CMS. The CMS calls this webhook after content changes; it
// revalidates the affected path (?path=/about). Gated by REVALIDATE_SECRET so only the CMS can
// trigger it. Until a CMS is wired up nothing calls this route — it's the prepared seam.
//
// Tag-based revalidation (revalidateTag) is intentionally NOT wired here yet: in Next 16 it requires a
// Cache Components cacheLife profile, and the caching strategy (previous model vs Cache Components) is
// deferred to ADR-0010, decided when the CMS lands. Path-based revalidation works under both models.
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
