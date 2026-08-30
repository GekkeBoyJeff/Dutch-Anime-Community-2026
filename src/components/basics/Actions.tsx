import Button from '@/components/basics/Button';
import { classNames } from '@/lib/shared/classNames';
import type { ActionsProps as ActionsSchemaProps } from '@/lib/site/content/schema/basics/actions';

type ActionsProps = ActionsSchemaProps;

const Actions = ({
	actions,
	defaultVariant = 'primary',
	badge,
	className,
}: ActionsProps) => {
	if (!actions?.length) {
		return null;
	}

	return (
		<div className={classNames('actions', className)}>
			{actions.map((action, index) => {
				const variant = action.variant ?? defaultVariant;
				const badged = badge && variant === 'primary';

				return (
					<Button
						key={`${action.value}-${index}`}
						variant={variant}
						url={action.url}
						target={action.target}
						value={action.value}
						icon={badged ? (action.icon ?? 'arrow-up-right') : action.icon}
						iconStyle={badged ? 'badge' : 'plain'}
					/>
				);
			})}
		</div>
	);
};

export default Actions;
