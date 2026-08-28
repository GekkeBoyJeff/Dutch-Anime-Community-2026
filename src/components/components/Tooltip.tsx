'use client';

import { Tooltip as BaseTooltip } from '@base-ui/react/tooltip';
import parse from 'html-react-parser';

import { classNames } from '@/lib/shared/classNames';
import type { TooltipProviderProps as TooltipProviderSchemaProps, TooltipProps as TooltipSchemaProps } from '@/lib/site/content/schema/components/tooltip';

type TooltipProviderProps = TooltipProviderSchemaProps;

export const TooltipProvider = ({
	delay,
	closeDelay,
	skipDelayMs = 400,
	children,
}: TooltipProviderProps) => {
	return (
		<BaseTooltip.Provider delay={delay} closeDelay={closeDelay} timeout={skipDelayMs}>
			{children}
		</BaseTooltip.Provider>
	);
};

type TooltipProps = TooltipSchemaProps;

// The trigger keeps focus (no trap, no scroll-lock) and gets aria-describedby; a tooltip must hold
// only non-interactive content.
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
}: TooltipProps) => {
	if (!label) {
		return children;
	}

	return (
		<BaseTooltip.Root disabled={disabled}>
			<BaseTooltip.Trigger delay={delay} render={children as React.ReactElement} />

			<BaseTooltip.Portal>
				<BaseTooltip.Positioner side={side} align={align} sideOffset={sideOffset} className="tooltip-positioner">
					<BaseTooltip.Popup className={classNames('tooltip', className)}>
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
