import Avatar from '@/components/basics/Avatar';
import Badge from '@/components/basics/Badge';
import Content from '@/components/basics/Content';
import Media from '@/components/basics/Media';
import Title from '@/components/basics/Title';
import { classNames } from '@/lib/shared/classNames';
import { formatDate } from '@/lib/shared/formatDate';
import type { ArticleCardProps as ArticleCardSchemaProps } from '@/lib/site/content/schema/components/articleCard';

type ArticleCardProps = ArticleCardSchemaProps;

const ArticleCard = ({
	title,
	value,
	media,
	tag,
	author,
	readTime,
	publishedAt,
	href,
	layout = 'vertical',
	className,
}: ArticleCardProps) => {
	const published = publishedAt ? formatDate(publishedAt, { day: 'numeric', month: 'long', year: 'numeric' }) : undefined;
	const titleSize = layout === 'feature' ? 3 : 4;

	return (
		<article
			className={classNames('card', 'article-card', `is-${layout}`, href && 'is-clickable', className)}
		>
			{media && (
				<div className="article-card-media">
					<Media {...media} ratio={media.ratio ?? '16/9'} />
				</div>
			)}

			<div className="article-card-body">
				{tag && <Badge variant="primary" value={tag} />}

				<Title
					element="h3"
					size={titleSize}
					className="article-card-headline"
					value={title}
					href={href}
					linkClassName="article-card-link"
				/>

				{value && <Content size="small" className="article-card-excerpt" value={value} />}

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

							<span className="content article-card-meta">
								{published && <time dateTime={publishedAt}>{published}</time>}
								{published && readTime ? <span aria-hidden="true"> · </span> : null}
								{readTime ? <span className="content">{readTime} min</span> : null}
							</span>
						</div>
					</div>
				)}
			</div>
		</article>
	);
};

export default ArticleCard;
