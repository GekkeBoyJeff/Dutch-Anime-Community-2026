import type { Ref } from 'react';

import Content from '@/components/basics/Content';
import Interactive from '@/components/basics/Interactive';
import { classNames } from '@/lib/classNames';
import type { BreadcrumbProps } from '@/lib/content/schema/basics/breadcrumb';

// Accessible breadcrumb trail: a nav > ol that links every crumb but the last, which is marked
// aria-current="page". Pairs with the JsonLd BreadcrumbList primitive for structured data.
const Breadcrumb = ({
	items,
	separator = '/',
	className,
	ref,
}: BreadcrumbProps & { ref?: Ref<HTMLElement> }) => {
	return (
		<nav ref={ref} aria-label="Breadcrumb" className={classNames('breadcrumb', className)}>
			<ol>
				{items.map((item, index) => {
					const isLast = index === items.length - 1;

					return (
						<li key={item.label}>
							{item.url && !isLast ? (
								<Interactive url={item.url} className="crumb link is-subtle">
									{item.label}
								</Interactive>
							) : (
								<Content
									element="span"
									className="crumb is-current link is-subtle"
									aria-current={isLast ? 'page' : undefined}
									value={item.label}
								/>
							)}
							{!isLast && (
								<span className="separator" aria-hidden="true">
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
