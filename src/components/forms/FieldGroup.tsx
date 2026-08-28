import { classNames } from '@/lib/shared/classNames';
import type { FieldGroupProps as FieldGroupSchemaProps } from '@/lib/site/content/schema/forms/fieldGroup';

type FieldGroupProps = FieldGroupSchemaProps;

// A non-semantic layout wrapper that stacks Fields with a consistent gap and opens a container
// query context, so a child Field with orientation="horizontal" can switch from stacked to
// side-by-side based on the group's own width rather than the viewport. Stays a Server Component.
const FieldGroup = ({ className, children, ref }: FieldGroupProps) => {
	return (
		<div ref={ref} className={classNames('field-group', className)}>
			{children}
		</div>
	);
};

export default FieldGroup;
