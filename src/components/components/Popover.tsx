'use client';

import { Popover as BasePopover } from '@base-ui/react/popover';
import type { ReactNode, Ref, RefObject } from 'react';

import Title from '@/components/basics/Title';
import { classNames } from '@/lib/classNames';
import type { PopoverProps as PopoverSchemaProps } from '@/lib/content/schema/components/popover';

type PopoverProps = PopoverSchemaProps & {
	/** The floating content (passed to the popup) */
	children?: ReactNode;
	/** Element that opens it; rendered as the Base UI trigger. Omit when using `anchor`. */
	trigger?: ReactNode;
	/** Fires on every open/close */
	onOpenChange?: (open: boolean) => void;
	/** Position against a custom element instead of the trigger (Combobox/Select hook-point) */
	anchor?: Element | RefObject<Element | null> | null;
};

// The foundational anchored, dismissable floating panel that Menu/Combobox/Select build on. A single
// flattened wrapper over Base UI Root > Trigger > Portal > Positioner > Popup — collision-aware
// positioning, focus management and the Dialog ARIA pattern come free. Style only via data-attributes.
const Popover = ({
	children,
	trigger,
	open,
	defaultOpen,
	onOpenChange,
	title,
	label,
	side = 'bottom',
	align = 'center',
	sideOffset = 8,
	alignOffset = 0,
	collisionPadding = 8,
	anchor,
	modal = false,
	showArrow = false,
	className,
	ref,
}: PopoverProps & { ref?: Ref<HTMLDivElement> }) => {
	return (
		<BasePopover.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} modal={modal}>
			{trigger && <BasePopover.Trigger render={trigger as React.ReactElement} />}

			<BasePopover.Portal>
				<BasePopover.Positioner
					className="popover-positioner"
					side={side}
					align={align}
					sideOffset={sideOffset}
					alignOffset={alignOffset}
					collisionPadding={collisionPadding}
					anchor={anchor ?? undefined}
				>
					<BasePopover.Popup ref={ref} className={classNames('popover', className)} aria-label={!title ? label : undefined}>
						{showArrow && (
							<BasePopover.Arrow className="popover-arrow">
								<span className="popover-arrow-glyph" aria-hidden="true" />
							</BasePopover.Arrow>
						)}

						{title && (
							<BasePopover.Title render={<Title size={5} className="popover-title" />}>{title}</BasePopover.Title>
						)}

						{children}
					</BasePopover.Popup>
				</BasePopover.Positioner>
			</BasePopover.Portal>
		</BasePopover.Root>
	);
};

export default Popover;
