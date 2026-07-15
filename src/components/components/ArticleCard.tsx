import type { Ref } from 'react';

import Avatar from '@/components/basics/Avatar';
import Badge from '@/components/basics/Badge';
import Content from '@/components/basics/Content';
import Interactive from '@/components/basics/Interactive';
import Media from '@/components/basics/Media';
import Title from '@/components/basics/Title';
import { classNames } from '@/lib/classNames';
import type { ArticleCardProps } from '@/lib/content';
import { formatDate } from '@/lib/formatDate';

// Editorial card for blog/news: lead media, a topic tag, headline, excerpt and a byline with
// avatar, date and read time. A Server Component; whole-card-clickable via a stretched link, like
// Card. The 'N min' read-time label is left locale-neutral on purpose.
const ArticleCard = ({
	title,
	excerpt,
	media,
	tag,
	author,
	readTime,
	publishedAt,
	href,
	layout = 'vertical',
	className,
	ref,
}: ArticleCardProps & { ref?: Ref<HTMLElement> }) => {
	const published = publishedAt ? formatDate(publishedAt, { day: 'numeric', month: 'long', year: 'numeric' }) : undefined;
	const titleSize = layout === 'feature' ? 3 : 4;

	return (
		<article
			ref={ref}
			className={classNames('card', 'article-card', `is-${layout}`, href && 'is-clickable', className)}
		>
			{media && (
				<div className="article-card-media">
					<Media {...media} ratio={media.ratio ?? '16/9'} />
				</div>
			)}

			<div className="article-card-body">
				{tag && <Badge variant="primary">{tag}</Badge>}

				{href ? (
					<Title element="h3" size={titleSize} className="article-card-headline">
						<Interactive url={href} className="article-card-link">
							{title}
						</Interactive>
					</Title>
				) : (
					<Title element="h3" size={titleSize} value={title} className="article-card-headline" />
				)}

				{excerpt && <Content size="small" className="article-card-excerpt" value={excerpt} />}

				{(author || published || readTime) && (
					<div className="article-card-byline">
						{author && (
							<Avatar
								size="s"
								src={author.avatar}
								alt={author.name}
								initials={author.name.slice(0, 2)}
							/>
						)}

						<div className="article-card-byline-text">
							{author && <Content element="span" className="article-card-author" value={author.name} />}

							<Content element="span" className="article-card-meta">
								{published && <time dateTime={publishedAt}>{published}</time>}
								{published && readTime ? <span aria-hidden="true"> · </span> : null}
								{readTime ? <Content element="span">{readTime} min</Content> : null}
							</Content>
						</div>
					</div>
				)}
			</div>
		</article>
	);
};

export default ArticleCard;
