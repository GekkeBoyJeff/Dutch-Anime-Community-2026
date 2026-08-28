import Content from '@/components/basics/Content';
import { classNames } from '@/lib/shared/classNames';
import type { ShinyTextProps as ShinyTextSchemaProps } from '@/lib/site/content/schema/basics/shinyText';

type ShinyTextProps = ShinyTextSchemaProps;

const ShinyText = ({
	value,
	speed = 'normal',
	disabled = false,
	className,
}: ShinyTextProps) => {
	return (
		<Content element="span" className={classNames('shiny-text', `is-${speed}`, disabled && 'is-disabled', className)} value={value} />
	);
};

export default ShinyText;
