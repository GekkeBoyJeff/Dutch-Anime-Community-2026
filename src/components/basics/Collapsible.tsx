'use client';

import { Collapsible as BaseCollapsible } from '@base-ui/react/collapsible';
import type { ReactNode, Ref } from 'react';

import Content from '@/components/basics/Content';
import Icon from '@/components/basics/Icon';
import { classNames } from '@/lib/classNames';
import type { CollapsibleProps as CollapsibleSchemaProps } from '@/lib/content/schema/basics/collapsible';

type CollapsibleProps = CollapsibleSchemaProps & {
	/** A custom trigger node, replacing the default label + chevron */
	trigger?: ReactNode;
	/** Fires with the next open state whenever it toggles */
	onOpenChange?: (open: boolean) => void;
	children?: ReactNode;
};

// A single open/close region — the disclosure Accordion is built from, used directly for "show
// more", spoiler-hide and single FAQ rows. Wraps Base UI Collapsible so the aria-expanded /
// aria-controls wiring and the animatable height var come for free; we only theme it.
const Collapsible = ({
	title,
	trigger,
	icon = 'chevron-down',
	open,
	defaultOpen = false,
	disabled = false,
	keepMounted = false,
	hiddenUntilFound = true,
	onOpenChange,
	className,
	children,
	ref,
}: CollapsibleProps & { ref?: Ref<HTMLDivElement> }) => {
	// hiddenUntilFound (hidden="until-found") keeps the panel mounted so browser find-in-page can reveal
	// it; Base UI then ignores keepMounted={false}, so fold it in to avoid the contradiction (and warning).
	// https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/hidden#the_until-found_value
	const panelKeepMounted = hiddenUntilFound || keepMounted;

	return (
		<BaseCollapsible.Root
			ref={ref}
			className={classNames('collapsible', className)}
			open={open}
			defaultOpen={defaultOpen}
			disabled={disabled}
			onOpenChange={(next) => onOpenChange?.(next)}
		>
			<BaseCollapsible.Trigger className="trigger">
				{trigger ? (
					trigger
				) : (
					<>
						<Content element="span" className="label" value={title} />
						<Icon name={icon} className="chevron" />
					</>
				)}
			</BaseCollapsible.Trigger>

			<BaseCollapsible.Panel className="panel" keepMounted={panelKeepMounted} hiddenUntilFound={hiddenUntilFound}>
				<div className="body">{children}</div>
			</BaseCollapsible.Panel>
		</BaseCollapsible.Root>
	);
};

export default Collapsible;
