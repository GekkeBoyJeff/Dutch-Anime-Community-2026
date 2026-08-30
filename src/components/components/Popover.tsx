'use client';

import { Popover as BasePopover } from '@base-ui/react/popover';

import Title from '@/components/basics/Title';
import { classNames } from '@/lib/shared/classNames';
import type { PopoverProps as PopoverSchemaProps } from '@/lib/site/content/schema/components/popover';

type PopoverProps = PopoverSchemaProps;

const Popover = ({
	children,
	trigger,
	open,
	defaultOpen,
	onOpenChange,
	title,
	ariaLabel,
	side = 'bottom',
	align = 'center',
	sideOffset = 8,
	alignOffset = 0,
	collisionPadding = 8,
	anchor,
	modal = false,
	showArrow = false,
	className,
}: PopoverProps) => {
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
					<BasePopover.Popup className={classNames('popover', className)} aria-label={!title ? ariaLabel : undefined}>
						{showArrow && (
							<BasePopover.Arrow className="popover-arrow">
								<span className="popover-arrow-glyph" aria-hidden="true" />
							</BasePopover.Arrow>
						)}

						{title && (
							<BasePopover.Title render={<Title size={5} className="popover-title" value={title} />} />
						)}

						{children}
					</BasePopover.Popup>
				</BasePopover.Positioner>
			</BasePopover.Portal>
		</BasePopover.Root>
	);
};

export default Popover;
