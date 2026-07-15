import Container from '@/components/basics/Container';
import { Blocks } from '@/components/contentBlocks';
import SiteChrome from '@/components/structures/SiteChrome';
import { getNotFoundPage, getSiteStructures } from '@/lib/content';
import { resolveChrome } from '@/lib/site';

// Custom 404: Next renders this for an unknown route (the [...slug] catch-all 404s with
// dynamicParams=false) or a called notFound(). It's an async Server Component, so it loads its copy from
// the content layer and renders the same <Blocks> pipeline as a normal page — edit the 404 in
// src/content/pages/notFound.ts, not here. It lives at the root (outside the (website) group), so it
// wraps itself in SiteChrome to get the same announcement bar, navigation and footer as every other page.
const NotFound = async () => {
	const [page, structures] = await Promise.all([getNotFoundPage(), getSiteStructures()]);

	return (
		<SiteChrome structures={resolveChrome(structures)}>
			<main className="not-found">
				<Container className='is-full'>
					<Blocks blocks={page.blocks} />
				</Container>
			</main>
		</SiteChrome>
	);
};

export default NotFound;
