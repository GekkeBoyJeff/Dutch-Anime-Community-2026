import type { Ref } from 'react';

import Button from '@/components/basics/Button';
import { classNames } from '@/lib/classNames';
import type { ActionsProps } from '@/lib/content/schema/basics/actions';

// The one CTA row: maps the shared Action shape onto Buttons so every block honors the same
// capabilities (variant, url, target, icon) without re-writing the loop. The row's layout stays
// block-local (each block styles its own `.actions`); `badge` opts primary actions into the circular
// icon-badge treatment — the house style for a leading CTA.
const Actions = ({
	actions,
	defaultVariant = 'primary',
	badge,
	className,
	ref,
}: ActionsProps & { ref?: Ref<HTMLDivElement> }) => {
	if (!actions?.length) {
		return null;
	}

	return (
		<div ref={ref} className={classNames('actions', className)}>
			{actions.map((action, index) => {
				const variant = action.variant ?? defaultVariant;
				const badged = badge && variant === 'primary';

				return (
					<Button
						key={`${action.label}-${index}`}
						variant={variant}
						url={action.url}
						target={action.target}
						icon={badged ? (action.icon ?? 'arrow-up-right') : action.icon}
						iconStyle={badged ? 'badge' : 'plain'}
					>
						{action.label}
					</Button>
				);
			})}
		</div>
	);
};

export default Actions;
