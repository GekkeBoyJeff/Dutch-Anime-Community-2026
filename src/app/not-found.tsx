import Container from '@/components/basics/Container/Container';
import Blocks from '@/components/contentBlocks/Blocks/Blocks';
import SiteChrome from '@/components/structures/SiteChrome/SiteChrome';
import { getNotFoundPage, getSiteStructures } from '@/lib/site/content/load';
import { resolveChrome } from '@/lib/site/site';

// This file lives at the root, outside the (website) group, so it has to wrap itself in SiteChrome
// to get the same announcement bar, navigation and footer as every other page.
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
