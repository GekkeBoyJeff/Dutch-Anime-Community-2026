import Interactive from '@/components/basics/Interactive/Interactive';
import { classNames } from '@/lib/shared/classNames';

import type { LinkProps as LinkSchemaProps } from './Link.schema';

import './Link.scss';

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
