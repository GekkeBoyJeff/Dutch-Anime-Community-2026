import type { Ref } from 'react';

import Icon from '@/components/basics/Icon';
import Interactive from '@/components/basics/Interactive';
import type { InteractiveProps, InteractiveRef } from '@/components/basics/Interactive';
import { classNames } from '@/lib/classNames';
import type { ButtonProps as ButtonSchemaProps } from '@/lib/content/schema/basics/button';

// The one CTA face of the system: every button and button-styled link renders through here.
// Interactive keeps the element honest — no `url` is a real <button>, an internal path is next/link,
// an external URL a safe <a> — and Button adds the visual variant plus the optional trailing icon:
// inline ('plain') or the circular badge that nudges its glyph on hover ('badge'). Stays a Server
// Component (the interactive island lives inside Interactive).
// Intersect with Interactive's TS type so the non-serializable extras (onClick, children, HTML
// passthrough) keep flowing through the ...rest spread; the schema owns only the data props.
type ButtonProps = ButtonSchemaProps & InteractiveProps;

const Button = ({
	variant = 'primary',
	icon,
	iconStyle = 'plain',
	className,
	children,
	ref,
	...rest
}: ButtonProps & { ref?: Ref<InteractiveRef> }) => {
	return (
		<Interactive
			ref={ref}
			className={classNames('button', `is-${variant}`, icon && (iconStyle === 'badge' ? 'has-badge' : 'has-icon'), className)}
			{...rest}
		>
			{children}
			{icon &&
				(iconStyle === 'badge' ? (
					<span className="button-badge" aria-hidden="true">
						<Icon name={icon} />
					</span>
				) : (
					<Icon name={icon} />
				))}
		</Interactive>
	);
};

export default Button;
