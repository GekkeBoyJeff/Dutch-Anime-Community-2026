'use client';

import Link from 'next/link';
import type { HTMLAttributes, MouseEvent, ReactNode, Ref } from 'react';

import useHaptics from '@/hooks/useHaptics';
import { classNames } from '@/lib/classNames';
import type { InteractiveProps as InteractiveSchemaProps } from '@/lib/content/schema/basics/interactive';

// Polymorphic: the element is a <button> or an <a>, so the ref is one or the other. A union is the
// honest type here — callers that need the concrete node narrow it themselves.
export type InteractiveRef = HTMLButtonElement | HTMLAnchorElement;

// Built on the common HTML attribute surface (id, className, style, title, tabIndex, role, every
// aria-*/data-*, and the shared events) — the safe set valid on BOTH a button and an anchor, so the
// leftover `...rest` can be spread onto either element. The element-specific attributes a clickable
// actually needs are declared explicitly below and applied only to the branch they belong to, so a
// button never receives `target` and an anchor never receives `type`. The serializable fields
// (url/target/rel/download/type/name/value/form/disabled/className) live in the zod schema now;
// only the non-serializable extras (callback, children) stay here.
export type InteractiveProps = InteractiveSchemaProps &
	Omit<HTMLAttributes<HTMLElement>, 'onClick'> & {
		/** Click handler; receives the event after the haptic feedback */
		onClick?: (event: MouseEvent<HTMLElement>) => void;
		children?: ReactNode;
	};

// One definition of "clickable": picks between a <button> (an action), next/link (an internal route)
// and an external <a> (outbound, with a safe rel), and fires haptic feedback on every enabled click.
// It carries only the neutral `.interactive` reset — compose a visual class (`button is-primary`,
// `text-link`, `pill`) onto it, or use the Button / Link / Pill wrappers that add one for you.
const Interactive = ({
	url,
	target,
	rel,
	download,
	type = 'button',
	name,
	value,
	form,
	disabled = false,
	derivedAriaLabel,
	className,
	onClick,
	children,
	ref,
	...rest
}: InteractiveProps & { ref?: Ref<InteractiveRef> }) => {
	const { haptic } = useHaptics();

	const handleClick = (event: MouseEvent<HTMLElement>) => {
		if (disabled) {
			event.preventDefault();
			return;
		}

		haptic();
		onClick?.(event);
	};

	// ref is button-or-anchor; each branch casts it to its concrete element, because a Ref can't be
	// assigned across element types. No url → a real button (an action).
	if (!url) {
		return (
			<button
				ref={ref as Ref<HTMLButtonElement>}
				type={type}
				name={name}
				value={value}
				form={form}
				className={classNames('interactive', className)}
				disabled={disabled}
				onClick={handleClick}
				{...rest}
			>
				{children}
			</button>
		);
	}

	const isExternal = target === '_blank' || /^https?:\/\//.test(url);

	// External link → a plain <a> with a safe rel (caller rel merged in).
	if (isExternal) {
		return (
			<a
				ref={ref as Ref<HTMLAnchorElement>}
				// A disabled link must be genuinely inert: drop the href and pull it out of the tab order,
				// not just dim it. Otherwise it stays focusable and keyboard-activatable despite aria-disabled.
				href={disabled ? undefined : url}
				target={target}
				aria-label={derivedAriaLabel || undefined}
				rel={['noopener', 'noreferrer', rel].filter(Boolean).join(' ') || undefined}
				download={download}
				className={classNames('interactive', className)}
				aria-disabled={disabled || undefined}
				tabIndex={disabled ? -1 : undefined}
				onClick={handleClick}
				{...rest}
			>
				{children}
			</a>
		);
	}

	// Internal route → next/link for client-side navigation and prefetch.
	return (
		<Link
			ref={ref as Ref<HTMLAnchorElement>}
			href={url}
			target={target}
			aria-label={derivedAriaLabel || undefined}
			rel={rel}
			download={download}
			className={classNames('interactive', className)}
			aria-disabled={disabled || undefined}
			// next/Link requires href, so a disabled internal link stays in the DOM but leaves the tab order
			// and blocks the click (handleClick preventDefaults) — inert without dropping client routing.
			tabIndex={disabled ? -1 : undefined}
			onClick={handleClick}
			{...rest}
		>
			{children}
		</Link>
	);
};

export default Interactive;
