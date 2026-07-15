import type { Ref } from 'react';

import Container from '@/components/basics/Container';
import Content from '@/components/basics/Content';
import Media from '@/components/basics/Media';
import Section from '@/components/basics/Section';
import type { SpotlightQuoteProps } from '@/lib/content';

// One oversized quote on a tinted band, with an optional mascot that pops in at the edge as the
// band scrolls into view — the page's single playful reward moment.
const SpotlightQuote = ({ quote, author, role, mascot, colorset, ref }: SpotlightQuoteProps & { ref?: Ref<HTMLElement> }) => {
	return (
		<Section ref={ref} colorset={colorset ?? 'dark'} className="spotlight-quote is-band">
			<Container className="inner">
				<figure className="spotlight">
					<blockquote className="quote">
						<Content value={quote} />
					</blockquote>
					<figcaption className="author">
						<Content element="span" className="name" value={author} />
						{role && <Content element="span" className="role" value={role} />}
					</figcaption>
				</figure>

				{mascot && (
					<div className="mascot" aria-hidden="true">
						<Media {...mascot} ratio={mascot.ratio ?? '1 / 1'} />
					</div>
				)}
			</Container>
		</Section>
	);
};

export default SpotlightQuote;
