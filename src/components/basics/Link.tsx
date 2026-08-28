import Interactive from '@/components/basics/Interactive';
import { classNames } from '@/lib/shared/classNames';
import type { LinkProps as LinkSchemaProps } from '@/lib/site/content/schema/basics/link';

type LinkProps = LinkSchemaProps;

const Link = ({
	className,
	value,
	...rest
}: LinkProps) => {
	return (
		<Interactive className={classNames('content', 'link', className)} {...rest}>
			{value}
		</Interactive>
	);
};

export default Link;
