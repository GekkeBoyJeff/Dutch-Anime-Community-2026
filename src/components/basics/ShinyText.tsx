import type { CSSProperties, ReactNode, Ref } from 'react';

import Content from '@/components/basics/Content';
import { classNames } from '@/lib/classNames';
import type { ShinyTextProps } from '@/lib/content/schema/basics/shinyText';

// A sweeping highlight across text, done purely in CSS (background-clip: text + an animated gradient
// position). The sweep is gated by prefers-reduced-motion in the stylesheet; `disabled` opts out.
const ShinyText = ({
	value,
	speed = 3,
	disabled = false,
	className,
	children,
	ref,
}: ShinyTextProps & { children?: ReactNode; ref?: Ref<HTMLElement> }) => {
	const style = { '--shiny-duration': `${speed}s` } as CSSProperties;

	return (
		<Content element="span" ref={ref} className={classNames('shiny-text', disabled && 'is-disabled', className)} style={style} value={value}>
			{children}
		</Content>
	);
};

export default ShinyText;
