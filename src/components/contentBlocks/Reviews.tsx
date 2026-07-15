import type { Ref } from 'react';

import Container from '@/components/basics/Container';
import Content from '@/components/basics/Content';
import Rating from '@/components/basics/Rating';
import Section from '@/components/basics/Section';
import Card from '@/components/components/Card';
import SectionHeader from '@/components/contentBlocks/SectionHeader';
import type { ReviewsProps } from '@/lib/content';

// Grid of reviews: each one a Card with a Rating, the quote and the author. The matching JSON-LD
// (rich snippets) comes from the same data via the builder in lib/seo — this component only renders
// the UI.
const Reviews = ({
	title,
	intro,
	items = [],
	colorset,
	ref,
}: ReviewsProps & { ref?: Ref<HTMLElement> }) => {
	return (
		<Section ref={ref} colorset={colorset} className="reviews">
			<Container>
				<SectionHeader title={title} intro={intro} />

				<ul className="grid">
					{items.map((review) => (
						<li key={review.id}>
							<Card className="reviews-card">
								<Rating value={review.rating} label={`${review.rating} van 5`} />
								<Content value={review.body} />
								<Content size="small" className="author" value={review.author} />
							</Card>
						</li>
					))}
				</ul>
			</Container>
		</Section>
	);
};

export default Reviews;
