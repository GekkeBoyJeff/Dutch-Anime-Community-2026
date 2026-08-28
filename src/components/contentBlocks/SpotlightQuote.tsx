import Container from '@/components/basics/Container';
import Content from '@/components/basics/Content';
import Media from '@/components/basics/Media';
import Section from '@/components/basics/Section';
import type { SpotlightQuoteProps as SpotlightQuoteSchemaProps } from '@/lib/site/content/schema/blocks/spotlightQuote';

type SpotlightQuoteProps = SpotlightQuoteSchemaProps;

const SpotlightQuote = ({
	quote,
	author,
	role,
	mascot,
	colorset,
}: SpotlightQuoteProps) => {
	return (
		<Section colorset={colorset ?? 'dark'} className="spotlight-quote is-band">
			<Container className="spotlight-quote-inner">
				<figure className="spotlight-quote-spotlight">
					<blockquote className="spotlight-quote-body">
						<Content value={quote} />
					</blockquote>
					<figcaption className="spotlight-quote-author">
						<Content element="span" className="spotlight-quote-name" value={author} />
						{role && <Content element="span" className="spotlight-quote-role" value={role} />}
					</figcaption>
				</figure>

				{mascot && (
					<div className="spotlight-quote-mascot" aria-hidden="true">
						<Media {...mascot} ratio={mascot.ratio ?? '1 / 1'} />
					</div>
				)}
			</Container>
		</Section>
	);
};

export default SpotlightQuote;
