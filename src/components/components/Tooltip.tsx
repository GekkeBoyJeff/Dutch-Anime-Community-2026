'use client';

import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import parse from 'html-react-parser';
import type { ReactNode, Ref } from 'react';

import { classNames } from '@/lib/classNames';
import type { TooltipProps as TooltipSchemaProps } from '@/lib/content/schema/components/tooltip';

interface TooltipProviderProps {
	/** Milliseconds before a tooltip opens on hover. @default 600 */
	delay?: number;
	/** Milliseconds before a tooltip closes after the pointer leaves. @default 0 */
	closeDelay?: number;
	/** Window in which the next tooltip opens instantly after one closes (Base UI `timeout`). */
	skipDelayMs?: number;
	/** The subtree whose tooltips share this delay window */
	children?: ReactNode;
}

// Groups tooltips so they share one delay window: once one opens, neighbours open instantly within
// `skipDelayMs`. Mount once near the app root (a client shell). Renders no DOM of its own.
export const TooltipProvider = ({ delay, closeDelay, skipDelayMs = 400, children }: TooltipProviderProps) => {
	return (
		<BaseTooltip.Provider delay={delay} closeDelay={closeDelay} timeout={skipDelayMs}>
			{children}
		</BaseTooltip.Provider>
	);
};

type TooltipProps = TooltipSchemaProps & {
	/** The trigger element the tooltip describes (must stay focusable) */
	children?: ReactNode;
};

// Assembles the common case in one tag: Root > Trigger > Portal > Positioner > Popup(+Arrow). The
// trigger keeps focus (no trap, no scroll-lock) and gets aria-describedby; a tooltip must hold only
// non-interactive content. `children` is the trigger; `label` is the bubble text.
const Tooltip = ({
	label,
	side = 'top',
	align = 'center',
	sideOffset = 8,
	arrow = false,
	delay,
	disabled = false,
	className,
	children,
	ref,
}: TooltipProps & { ref?: Ref<HTMLDivElement> }) => {
	if (!label) {
		return children;
	}

	return (
		<BaseTooltip.Root disabled={disabled}>
			<BaseTooltip.Trigger delay={delay} render={children as React.ReactElement} />

			<BaseTooltip.Portal>
				<BaseTooltip.Positioner side={side} align={align} sideOffset={sideOffset} className="tooltip-positioner">
					<BaseTooltip.Popup ref={ref} className={classNames('tooltip', className)}>
						{arrow && (
							<BaseTooltip.Arrow className="tooltip-arrow">
								<span className="tooltip-arrow-glyph" aria-hidden="true" />
							</BaseTooltip.Arrow>
						)}
						{parse(label)}
					</BaseTooltip.Popup>
				</BaseTooltip.Positioner>
			</BaseTooltip.Portal>
		</BaseTooltip.Root>
	);
};

export default Tooltip;
