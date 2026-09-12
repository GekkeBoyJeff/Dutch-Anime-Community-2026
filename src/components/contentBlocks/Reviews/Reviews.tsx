import Container from '@/components/basics/Container/Container';
import Content from '@/components/basics/Content/Content';
import HeadingGroup from '@/components/basics/HeadingGroup/HeadingGroup';
import Rating from '@/components/basics/Rating/Rating';
import Section from '@/components/basics/Section/Section';
import Card from '@/components/components/Card/Card';

import type { ReviewsProps as ReviewsSchemaProps } from './Reviews.schema';

import './Reviews.scss';

type ReviewsProps = ReviewsSchemaProps;

const Reviews = ({
	title,
	intro,
	items = [],
	colorset,
}: ReviewsProps) => {
	return (
		<Section colorset={colorset} className="reviews">
			<Container>
				<HeadingGroup element="header" title={title} intro={intro} />

				<ul className="reviews-grid">
					{items.map((review) => (
						<li key={review.id}>
							<Card className="reviews-card">
								<Rating value={review.rating} ariaLabel={`${review.rating} van 5`} />
								<Content value={review.value} />
								<Content size="small" className="reviews-author" value={review.author} />
							</Card>
						</li>
					))}
				</ul>
			</Container>
		</Section>
	);
};

export default Reviews;
