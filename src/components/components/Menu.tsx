'use client';

import { Menu as BaseMenu } from '@base-ui/react/menu';
import type { MouseEvent, ReactNode, Ref } from 'react';

import Content from '@/components/basics/Content';
import Icon from '@/components/basics/Icon';
import Interactive from '@/components/basics/Interactive';
import useHaptics from '@/hooks/useHaptics';
import { classNames } from '@/lib/classNames';
import type {
	MenuCheckboxItemProps as MenuCheckboxItemSchemaProps,
	MenuGroupLabelProps as MenuGroupLabelSchemaProps,
	MenuGroupProps as MenuGroupSchemaProps,
	MenuItemProps as MenuItemSchemaProps,
	MenuProps as MenuSchemaProps,
	MenuRadioGroupProps as MenuRadioGroupSchemaProps,
	MenuRadioItemProps as MenuRadioItemSchemaProps,
	MenuSeparatorProps as MenuSeparatorSchemaProps,
} from '@/lib/content/schema/components/menu';

type MenuProps = MenuSchemaProps & {
	/** The trigger node — usually a Button or Pill that opens the menu */
	trigger: ReactNode;
	/** Fires with the next open state whenever it changes */
	onOpenChange?: (open: boolean) => void;
	/** The menu items, groups and separators */
	children?: ReactNode;
};

type MenuItemProps = MenuItemSchemaProps & {
	/** Activation handler */
	onClick?: (event: MouseEvent<HTMLElement>) => void;
	children?: ReactNode;
};

type MenuGroupProps = MenuGroupSchemaProps & {
	/** The GroupLabel and items */
	children?: ReactNode;
};

type MenuGroupLabelProps = MenuGroupLabelSchemaProps & {
	children?: ReactNode;
};

type MenuCheckboxItemProps = MenuCheckboxItemSchemaProps & {
	/** Fires with the next checked state on toggle */
	onCheckedChange?: (checked: boolean) => void;
	children?: ReactNode;
};

type MenuRadioGroupProps = MenuRadioGroupSchemaProps & {
	/** Fires with the next value on selection */
	onValueChange?: (value: string) => void;
	/** The MenuRadioItem children */
	children?: ReactNode;
};

type MenuRadioItemProps = MenuRadioItemSchemaProps & {
	children?: ReactNode;
};

type MenuSeparatorProps = MenuSeparatorSchemaProps;

// A single action item. Routes through Interactive when given a `url` (so internal routes use
// next/link), otherwise stays the default role=menuitem with a haptic-wrapped click.
const MenuItem = ({
	icon,
	label,
	url,
	target,
	disabled = false,
	keepOpen = false,
	onClick,
	className,
	children,
	ref,
}: MenuItemProps & { ref?: Ref<HTMLElement> }) => {
	const { haptic } = useHaptics();

	const body = (
		<>
			{icon && <Icon name={icon} className='menu-item-icon' />}
			<Content element="span" className="label">{children}</Content>
		</>
	);

	const handleClick = (event: MouseEvent<HTMLElement>) => {
		haptic();
		onClick?.(event);
	};

	// A link item renders an <a>; we slot our Interactive so internal vs external routing matches the
	// rest of the app. Navigation items keep the menu open by default.
	if (url) {
		return (
			<BaseMenu.LinkItem
				ref={ref}
				className={classNames('item', className)}
				label={label}
				closeOnClick={!keepOpen}
				render={<Interactive url={url} target={target} disabled={disabled} />}
			>
				{body}
			</BaseMenu.LinkItem>
		);
	}

	return (
		<BaseMenu.Item
			ref={ref}
			className={classNames('item', className)}
			label={label}
			disabled={disabled}
			closeOnClick={!keepOpen}
			onClick={handleClick}
		>
			{body}
		</BaseMenu.Item>
	);
};

const MenuGroup = ({ className, children, ref }: MenuGroupProps & { ref?: Ref<HTMLDivElement> }) => {
	return (
		<BaseMenu.Group ref={ref} className={classNames('group', className)}>
			{children}
		</BaseMenu.Group>
	);
};

// The non-focusable heading for a Group.
const MenuGroupLabel = ({ className, children, ref }: MenuGroupLabelProps & { ref?: Ref<HTMLDivElement> }) => {
	return (
		<BaseMenu.GroupLabel ref={ref} className={classNames('group-label', className)}>
			{children}
		</BaseMenu.GroupLabel>
	);
};

// A toggle item that keeps the menu open so several can be flipped in one pass.
const MenuCheckboxItem = ({
	checked,
	defaultChecked = false,
	label,
	disabled = false,
	onCheckedChange,
	className,
	children,
	ref,
}: MenuCheckboxItemProps & { ref?: Ref<HTMLDivElement> }) => {
	return (
		<BaseMenu.CheckboxItem
			ref={ref}
			className={classNames('item', 'is-checkbox', className)}
			checked={checked}
			defaultChecked={defaultChecked}
			label={label}
			disabled={disabled}
			onCheckedChange={(next) => onCheckedChange?.(next)}
		>
			<BaseMenu.CheckboxItemIndicator className="indicator">
				<Icon name="check" className='menu-item-icon' />
			</BaseMenu.CheckboxItemIndicator>
			<Content element="span" className="label">{children}</Content>
		</BaseMenu.CheckboxItem>
	);
};

const MenuRadioGroup = ({
	value,
	defaultValue,
	onValueChange,
	className,
	children,
	ref,
}: MenuRadioGroupProps & { ref?: Ref<HTMLDivElement> }) => {
	return (
		<BaseMenu.RadioGroup
			ref={ref}
			className={classNames('menu-radio-group', className)}
			value={value}
			defaultValue={defaultValue}
			onValueChange={(next) => onValueChange?.(next as string)}
		>
			{children}
		</BaseMenu.RadioGroup>
	);
};

const MenuRadioItem = ({
	value,
	label,
	disabled = false,
	className,
	children,
	ref,
}: MenuRadioItemProps & { ref?: Ref<HTMLDivElement> }) => {
	return (
		<BaseMenu.RadioItem
			ref={ref}
			className={classNames('item', 'is-radio', className)}
			value={value}
			label={label}
			disabled={disabled}
		>
			<BaseMenu.RadioItemIndicator className="indicator">
				<span className="dot" />
			</BaseMenu.RadioItemIndicator>
			<Content element="span" className="label">{children}</Content>
		</BaseMenu.RadioItem>
	);
};

const MenuSeparator = ({ className, ref }: MenuSeparatorProps & { ref?: Ref<HTMLDivElement> }) => {
	return <BaseMenu.Separator ref={ref} className={classNames('separator', className)} />;
};

// An action / dropdown / kebab menu with roving focus, typeahead, submenus and checkbox/radio
// items. Wraps Base UI Menu — the a11y-hard focus management, typeahead and collision positioning
// are exactly what a starter must not hand-roll. A client island; the page around it stays server.
const Menu = ({
	trigger,
	open,
	defaultOpen = false,
	modal = true,
	orientation = 'vertical',
	side = 'bottom',
	align = 'start',
	sideOffset = 6,
	label,
	onOpenChange,
	className,
	children,
}: MenuProps) => {
	return (
		<BaseMenu.Root
			open={open}
			defaultOpen={defaultOpen}
			modal={modal}
			orientation={orientation}
			onOpenChange={(next) => onOpenChange?.(next)}
		>
			<BaseMenu.Trigger render={trigger as React.ReactElement} />

			<BaseMenu.Portal>
				<BaseMenu.Positioner className="menu-positioner" side={side} align={align} sideOffset={sideOffset}>
					<BaseMenu.Popup className={classNames('menu', className)} aria-label={label}>
						{children}
					</BaseMenu.Popup>
				</BaseMenu.Positioner>
			</BaseMenu.Portal>
		</BaseMenu.Root>
	);
};

Menu.Item = MenuItem;
Menu.Group = MenuGroup;
Menu.GroupLabel = MenuGroupLabel;
Menu.CheckboxItem = MenuCheckboxItem;
Menu.RadioGroup = MenuRadioGroup;
Menu.RadioItem = MenuRadioItem;
Menu.Separator = MenuSeparator;

export default Menu;
