import Content from '@/components/basics/Content';
import Interactive from '@/components/basics/Interactive';
import { classNames } from '@/lib/shared/classNames';
import type { BreadcrumbProps as BreadcrumbSchemaProps } from '@/lib/site/content/schema/basics/breadcrumb';

type BreadcrumbProps = BreadcrumbSchemaProps;

const Breadcrumb = ({
	items,
	separator = '/',
	className,
}: BreadcrumbProps) => {
	return (
		<nav aria-label="Breadcrumb" className={classNames('breadcrumb', className)}>
			<ol>
				{items.map((item, index) => {
					const isLast = index === items.length - 1;

					return (
						<li key={item.value}>
							{item.url && !isLast ? (
								<Interactive url={item.url} className="breadcrumb-crumb link is-subtle">
									{item.value}
								</Interactive>
							) : (
								<Content
									element="span"
									className="breadcrumb-crumb is-current link is-subtle"
									ariaCurrent={isLast ? 'page' : undefined}
									value={item.value}
								/>
							)}
							{!isLast && (
								<span className="breadcrumb-separator" aria-hidden="true">
									{separator}
								</span>
							)}
						</li>
					);
				})}
			</ol>
		</nav>
	);
};

export default Breadcrumb;
