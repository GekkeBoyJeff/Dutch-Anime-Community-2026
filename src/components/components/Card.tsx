import Content from '@/components/basics/Content';
import Interactive from '@/components/basics/Interactive';
import { classNames } from '@/lib/shared/classNames';
import type { CardProps as CardSchemaProps } from '@/lib/site/content/schema/components/card';

type CardProps = CardSchemaProps;

const Card = ({
	variant,
	tagline,
	meta,
	href,
	linkLabel,
	image,
	header,
	footer,
	className,
	children,
}: CardProps) => {
	if (process.env.NODE_ENV !== 'production' && href && !linkLabel) {
		console.warn('Card: a clickable card (href) needs a linkLabel for the stretched link’s accessible name.');
	}

	return (
		<article
			className={classNames('card', variant && `is-${variant}`, !!image && 'has-media', href && 'is-clickable', className)}
		>
			{image && <div className="card-media">{image}</div>}

			{(tagline || header || children || meta) && (
				<div className="card-body">
					{tagline && <Content element="p" className="card-tagline" value={tagline} />}
					{header && <div className="card-header">{header}</div>}
					{children && <div className="card-content">{children}</div>}
					{meta && <Content element="p" className="card-meta" value={meta} />}
				</div>
			)}

			{footer && <div className="card-footer">{footer}</div>}

			{href && <Interactive url={href} className="card-link" ariaLabel={linkLabel} />}
		</article>
	);
};

export default Card;
