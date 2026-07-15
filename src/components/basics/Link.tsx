import type { Ref } from 'react';

import Interactive from '@/components/basics/Interactive';
import type { InteractiveProps } from '@/components/basics/Interactive';
import { classNames } from '@/lib/classNames';
import type { LinkProps as LinkSchemaProps } from '@/lib/content/schema/basics/link';

// A thin wrapper over Interactive that adds the canonical `.link` styling; stays a Server Component
// (the interactive island lives inside Interactive). For an action use Button; for a link that *looks*
// like a button, skip Link and put the `button` class on Interactive instead.
// Intersect with Interactive's TS type so the non-serializable extras (onClick, children, HTML
// passthrough) keep flowing through the ...rest spread; the schema owns only the data props.
type LinkProps = LinkSchemaProps & Omit<InteractiveProps, 'type' | 'name' | 'value' | 'form'>;

const Link = ({ className, children, ref, ...rest }: LinkProps & { ref?: Ref<HTMLAnchorElement> }) => {
	return (
		<Interactive ref={ref} className={classNames('content', 'link', className)} {...rest}>
			{children}
		</Interactive>
	);
};

export default Link;
