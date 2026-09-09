import Button from '@/components/basics/Button';
import { classNames } from '@/lib/shared/classNames';
import type { ActionsProps as ActionsSchemaProps } from '@/lib/site/content/schema/basics/actions';

type ActionsProps = ActionsSchemaProps;

const Actions = ({
	actions,
	defaultVariant = 'primary',
	className,
}: ActionsProps) => {
	if (!actions?.length) {
		return null;
	}

	return (
		<div className={classNames('actions', className)}>
			{actions.map((action, index) => (
				<Button
					key={`${action.value}-${index}`}
					variant={action.variant ?? defaultVariant}
					url={action.url}
					target={action.target}
					value={action.value}
					icon={action.icon}
				/>
			))}
		</div>
	);
};

export default Actions;
