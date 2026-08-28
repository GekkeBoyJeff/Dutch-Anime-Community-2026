'use client';

import { ContextMenu as BaseContextMenu } from '@base-ui/react/context-menu';
import { Menu as BaseMenu } from '@base-ui/react/menu';
import type { MouseEvent } from 'react';

import Content from '@/components/basics/Content';
import Icon from '@/components/basics/Icon';
import Interactive from '@/components/basics/Interactive';
import useHaptics from '@/hooks/useHaptics';
import { classNames } from '@/lib/shared/classNames';
import type {
	MenuCheckboxItemProps as MenuCheckboxItemSchemaProps,
	MenuContextProps as MenuContextSchemaProps,
	MenuGroupLabelProps as MenuGroupLabelSchemaProps,
	MenuGroupProps as MenuGroupSchemaProps,
	MenuItemProps as MenuItemSchemaProps,
	MenuProps as MenuSchemaProps,
	MenuRadioGroupProps as MenuRadioGroupSchemaProps,
	MenuRadioItemProps as MenuRadioItemSchemaProps,
	MenuSeparatorProps as MenuSeparatorSchemaProps,
} from '@/lib/site/content/schema/components/menu';

type MenuProps = MenuSchemaProps;

type MenuItemProps = MenuItemSchemaProps;

type MenuGroupProps = MenuGroupSchemaProps;

type MenuGroupLabelProps = MenuGroupLabelSchemaProps;

type MenuCheckboxItemProps = MenuCheckboxItemSchemaProps;

type MenuRadioGroupProps = MenuRadioGroupSchemaProps;

type MenuRadioItemProps = MenuRadioItemSchemaProps;

type MenuSeparatorProps = MenuSeparatorSchemaProps;

type MenuContextProps = MenuContextSchemaProps;

const MenuItem = ({
	icon,
	label,
	url,
	target,
	disabled = false,
	keepOpen = false,
	danger = false,
	onClick,
	className,
}: MenuItemProps) => {
	const { haptic } = useHaptics();

	const body = (
		<>
			{icon && <Icon name={icon} className='menu-item-icon' />}
			<Content element="span" className="menu-label" value={label} />
		</>
	);

	const handleClick = (event: MouseEvent<HTMLElement>) => {
		haptic();
		onClick?.(event);
	};

	if (url) {
		return (
			<BaseMenu.LinkItem
				className={classNames('menu-item', danger && 'is-danger', className)}
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
			className={classNames('menu-item', danger && 'is-danger', className)}
			label={label}
			disabled={disabled}
			closeOnClick={!keepOpen}
			onClick={handleClick}
		>
			{body}
		</BaseMenu.Item>
	);
};

const MenuGroup = ({
	className,
	children,
}: MenuGroupProps) => {
	return (
		<BaseMenu.Group className={classNames('menu-group', className)}>
			{children}
		</BaseMenu.Group>
	);
};

const MenuGroupLabel = ({
	className,
	children,
}: MenuGroupLabelProps) => {
	return (
		<BaseMenu.GroupLabel className={classNames('menu-group-label', className)}>
			{children}
		</BaseMenu.GroupLabel>
	);
};

const MenuCheckboxItem = ({
	checked,
	defaultChecked = false,
	label,
	disabled = false,
	onCheckedChange,
	className,
}: MenuCheckboxItemProps) => {
	return (
		<BaseMenu.CheckboxItem
			className={classNames('menu-item', 'is-checkbox', className)}
			checked={checked}
			defaultChecked={defaultChecked}
			label={label}
			disabled={disabled}
			onCheckedChange={(next) => onCheckedChange?.(next)}
		>
			<BaseMenu.CheckboxItemIndicator className="menu-indicator">
				<Icon name="check" className='menu-item-icon' />
			</BaseMenu.CheckboxItemIndicator>
			<Content element="span" className="menu-label" value={label} />
		</BaseMenu.CheckboxItem>
	);
};

const MenuRadioGroup = ({
	value,
	defaultValue,
	onValueChange,
	className,
	children,
}: MenuRadioGroupProps) => {
	return (
		<BaseMenu.RadioGroup
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
}: MenuRadioItemProps) => {
	return (
		<BaseMenu.RadioItem
			className={classNames('menu-item', 'is-radio', className)}
			value={value}
			label={label}
			disabled={disabled}
		>
			<BaseMenu.RadioItemIndicator className="menu-indicator">
				<span className="menu-dot" />
			</BaseMenu.RadioItemIndicator>
			<Content element="span" className="menu-label" value={label} />
		</BaseMenu.RadioItem>
	);
};

const MenuSeparator = ({
	className,
}: MenuSeparatorProps) => {
	return <BaseMenu.Separator className={classNames('menu-separator', className)} />;
};

const Menu = ({
	trigger,
	open,
	defaultOpen = false,
	modal = true,
	orientation = 'vertical',
	side = 'bottom',
	align = 'start',
	sideOffset = 6,
	ariaLabel,
	openOnHover,
	delay,
	closeDelay,
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
			<BaseMenu.Trigger openOnHover={openOnHover} delay={delay} closeDelay={closeDelay} render={trigger as React.ReactElement} />

			<BaseMenu.Portal>
				<BaseMenu.Positioner className="menu-positioner" side={side} align={align} sideOffset={sideOffset}>
					<BaseMenu.Popup className={classNames('menu', className)} aria-label={ariaLabel}>
						{children}
					</BaseMenu.Popup>
				</BaseMenu.Positioner>
			</BaseMenu.Portal>
		</BaseMenu.Root>
	);
};

const MenuContext = ({
	trigger,
	onOpenChange,
	ariaLabel,
	className,
	children,
}: MenuContextProps) => {
	return (
		<BaseContextMenu.Root onOpenChange={(next) => onOpenChange?.(next)}>
			<BaseContextMenu.Trigger render={trigger as React.ReactElement} />
			<BaseMenu.Portal>
				<BaseMenu.Positioner className="menu-positioner">
					<BaseMenu.Popup className={classNames('menu', className)} aria-label={ariaLabel}>
						{children}
					</BaseMenu.Popup>
				</BaseMenu.Positioner>
			</BaseMenu.Portal>
		</BaseContextMenu.Root>
	);
};

Menu.Item = MenuItem;
Menu.Context = MenuContext;
Menu.Group = MenuGroup;
Menu.GroupLabel = MenuGroupLabel;
Menu.CheckboxItem = MenuCheckboxItem;
Menu.RadioGroup = MenuRadioGroup;
Menu.RadioItem = MenuRadioItem;
Menu.Separator = MenuSeparator;

export default Menu;
