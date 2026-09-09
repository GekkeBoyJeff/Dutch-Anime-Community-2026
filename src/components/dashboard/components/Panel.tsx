import Button from '@/components/basics/Button';
import Title from '@/components/basics/Title';
import { classNames } from '@/lib/shared/classNames';
import type { PanelProps as PanelSchemaProps } from '@/lib/site/content/schema/components/panel';

export type PanelProps = PanelSchemaProps;

const Panel = ({
	title,
	href,
	linkLabel,
	action,
	error,
	isEmpty,
	emptyLabel = 'Niets te tonen',
	errorLabel = 'Kon niet laden.',
	hideWhenEmpty,
	className,
	children,
}: PanelProps) => {
	if (!error && isEmpty && hideWhenEmpty) return null;

	return (
		<article className={classNames('panel', className)}>
			<header className="panel-head">
				<Title element="h3" size={6} value={title} />
				{action && <span className="panel-action">{action}</span>}
				{href && <Button variant="ghost" icon="arrow-right" url={href} ariaLabel={linkLabel ?? title} className="panel-link" />}
			</header>
			<div className="panel-body">
				{error ? <p className="panel-error">{errorLabel}</p> : isEmpty ? <p className="panel-empty">{emptyLabel}</p> : children}
			</div>
		</article>
	);
};

export default Panel;
