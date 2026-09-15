import Content from '@/components/basics/Content/Content';
import Interactive from '@/components/basics/Interactive/Interactive';
import { classNames } from '@/lib/shared/classNames';

import type { CardProps as CardSchemaProps } from './Card.schema';

import './Card.scss';

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
