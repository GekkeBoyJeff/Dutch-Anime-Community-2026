import { ScrollArea as BaseScrollArea } from '@base-ui/react/scroll-area';
import type { ReactNode, Ref } from 'react';

import { classNames } from '@/lib/classNames';
import type { ScrollAreaProps as ScrollAreaSchemaProps } from '@/lib/content/schema/components/scrollArea';

type ScrollAreaProps = ScrollAreaSchemaProps & {
	/** The overflowing content */
	children?: ReactNode;
};

// A styled, cross-browser scrollbar for an overflow region (menu, dialog, code block, sidebar). The
// viewport stays natively scrollable and keyboard-accessible — this only replaces the cosmetic
// scrollbar. Stays a Server Component: it just composes the Base UI parts (which ship their own
// 'use client') and adds no state of its own.
const ScrollArea = ({ orientation = 'vertical', className, children, ref }: ScrollAreaProps & { ref?: Ref<HTMLDivElement> }) => {
	const showVertical = orientation === 'vertical' || orientation === 'both';
	const showHorizontal = orientation === 'horizontal' || orientation === 'both';

	return (
		<BaseScrollArea.Root ref={ref} className={classNames('scroll-area', className)}>
			<BaseScrollArea.Viewport className="viewport">{children}</BaseScrollArea.Viewport>

			{showVertical && (
				<BaseScrollArea.Scrollbar className="scrollbar" orientation="vertical">
					<BaseScrollArea.Thumb className="thumb" />
				</BaseScrollArea.Scrollbar>
			)}

			{showHorizontal && (
				<BaseScrollArea.Scrollbar className="scrollbar" orientation="horizontal">
					<BaseScrollArea.Thumb className="thumb" />
				</BaseScrollArea.Scrollbar>
			)}

			{orientation === 'both' && <BaseScrollArea.Corner className="corner" />}
		</BaseScrollArea.Root>
	);
};

export default ScrollArea;
