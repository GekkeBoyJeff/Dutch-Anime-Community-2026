'use client';

import Link from 'next/link';
import type { HTMLAttributes, MouseEvent, Ref } from 'react';

import Icon from '@/components/basics/Icon';
import VisuallyHidden from '@/components/basics/VisuallyHidden';
import useHaptics from '@/hooks/useHaptics';
import { classNames } from '@/lib/shared/classNames';
import type { InteractiveProps as InteractiveSchemaProps } from '@/lib/site/content/schema/basics/interactive';

// Base UI clones this through `render=` (Menu.LinkItem, Dialog.Close, Toast.Close) and merges its own
// interaction props into it — role, tabIndex, id, data-state and a bundle of keyboard/pointer handlers —
// so the HTML attribute set stays open here; narrowing it drops those props without a type error.
type InteractiveProps = InteractiveSchemaProps & HTMLAttributes<HTMLElement> & { ref?: Ref<HTMLButtonElement | HTMLAnchorElement> };

const Interactive = ({
	url,
	target,
	rel,
	download,
	type = 'button',
	disabled = false,
	icon,
	value,
	className,
	ariaLabel,
	ariaExpanded,
	ariaCurrent,
	ariaPressed,
	onClick,
	children,
	ref,
	...rest
}: InteractiveProps) => {
	const { haptic } = useHaptics();

	// `children` is the open slot for anything a caller wants inside the element; `icon`/`value` is
	// the data path for the icon-only element, where the text is read but never shown.
	const content = icon ? (
		<>
			<Icon name={icon} />
			{value && <VisuallyHidden value={value} />}
		</>
	) : (
		value ?? children
	);

	const handleClick = (event: MouseEvent<HTMLElement>) => {
		if (disabled) {
			event.preventDefault();
			return;
		}

		haptic();
		onClick?.(event);
	};

	if (!url) {
		return (
			<button
				ref={ref as Ref<HTMLButtonElement>}
				type={type}
				className={classNames('interactive', className)}
				disabled={disabled}
				aria-label={ariaLabel}
				aria-expanded={ariaExpanded}
				aria-current={ariaCurrent}
				aria-pressed={ariaPressed}
				onClick={handleClick}
				{...rest}
			>
				{content}
			</button>
		);
	}

	const isExternal = target === '_blank' || /^https?:\/\//.test(url);

	if (isExternal) {
		return (
			<a
				ref={ref as Ref<HTMLAnchorElement>}
				// Dropping the href is what makes a disabled link inert; aria-disabled alone leaves it
				// focusable and keyboard-activatable.
				href={disabled ? undefined : url}
				target={target}
				rel={['noopener', 'noreferrer', rel].filter(Boolean).join(' ') || undefined}
				download={download}
				className={classNames('interactive', className)}
				aria-disabled={disabled || undefined}
				aria-label={ariaLabel}
				aria-expanded={ariaExpanded}
				aria-current={ariaCurrent}
				tabIndex={disabled ? -1 : undefined}
				onClick={handleClick}
				{...rest}
			>
				{content}
			</a>
		);
	}

	return (
		<Link
			ref={ref as Ref<HTMLAnchorElement>}
			href={url}
			target={target}
			rel={rel}
			download={download}
			className={classNames('interactive', className)}
			aria-disabled={disabled || undefined}
			aria-label={ariaLabel}
			aria-expanded={ariaExpanded}
			aria-current={ariaCurrent}
			tabIndex={disabled ? -1 : undefined}
			onClick={handleClick}
			{...rest}
		>
			{content}
		</Link>
	);
};

export default Interactive;
