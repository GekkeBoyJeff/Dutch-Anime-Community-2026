import Interactive from '@/components/basics/Interactive';
import { classNames } from '@/lib/shared/classNames';
import type { PillProps as PillSchemaProps } from '@/lib/site/content/schema/basics/pill';

type PillProps = PillSchemaProps;

const Pill = ({
	active = false,
	url,
	target,
	rel,
	download,
	type,
	disabled,
	icon,
	className,
	value,
	count,
	ariaLabel,
	ariaExpanded,
	ariaCurrent,
	ariaPressed,
	onClick,
}: PillProps) => {
	// aria-pressed is valid only on a button, so a pill with a url must not get it.
	const resolvedAriaPressed = ariaPressed ?? (url ? undefined : active);

	return (
		<Interactive
			url={url}
			target={target}
			rel={rel}
			download={download}
			type={type}
			disabled={disabled}
			icon={icon}
			className={classNames('pill', active && 'is-active', className)}
			ariaLabel={ariaLabel}
			ariaExpanded={ariaExpanded}
			ariaCurrent={ariaCurrent}
			ariaPressed={resolvedAriaPressed}
			onClick={onClick}
		>
			{value}
			{typeof count === 'number' && (
				<span className="pill-count">
					{' '}
					{count}
				</span>
			)}
		</Interactive>
	);
};

export default Pill;
