import type { ReactNode, Ref } from 'react';

import Content from '@/components/basics/Content';
import Interactive from '@/components/basics/Interactive';
import { classNames } from '@/lib/classNames';
import type { CardProps as CardSchemaProps } from '@/lib/content/schema/components/card';

type CardProps = CardSchemaProps & {
	/** Media slot rendered at the top (a Media element, an image, …) */
	image?: ReactNode;
	/** Header slot rendered above the body (a title, a row of badges, …) */
	header?: ReactNode;
	/** Footer slot rendered at the bottom (actions, byline, …) */
	footer?: ReactNode;
	/** The card body */
	children?: ReactNode;
};

// Generic surface container every card grid composes. Renders a plain <article>, or — when `href`
// is set — adds an Interactive stretched link so the whole card is one click target while the
// footer stays separately clickable. Stays a Server Component; the click island lives in Interactive.
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
	ref,
}: CardProps & { ref?: Ref<HTMLElement> }) => {
	// A clickable card's stretched link carries no text, so it needs an explicit accessible name.
	// Warn in dev when one is missing, otherwise the whole card is an unnamed link to assistive tech.
	if (process.env.NODE_ENV !== 'production' && href && !linkLabel) {
		console.warn('Card: a clickable card (href) needs a linkLabel for the stretched link’s accessible name.');
	}

	return (
		<article
			ref={ref}
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

			{href && (
				// A real, focusable, named link covering the card — so a keyboard user can reach it and the
				// :focus-within ring fires. Footer controls sit above it via their own stacking context.
				<Interactive url={href} className="card-link" aria-label={linkLabel} />
			)}
		</article>
	);
};

export default Card;
