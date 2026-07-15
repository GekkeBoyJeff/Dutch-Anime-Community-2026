import type { Ref } from 'react';

import Actions from '@/components/basics/Actions';
import Breadcrumb from '@/components/basics/Breadcrumb';
import Content from '@/components/basics/Content';
import Title from '@/components/basics/Title';
import { classNames } from '@/lib/classNames';
import type { Action } from '@/lib/content';

interface PageHeaderCrumb {
	label: string;
	/** Target URL; the last crumb renders as plain text */
	url?: string;
}

interface PageHeaderProps {
	title: string;
	/** Supporting subtitle under the title; may contain HTML */
	subtitle?: string;
	/** Breadcrumb trail above the title, root first */
	breadcrumb?: PageHeaderCrumb[];
	/** A row of action buttons aligned beside the title (defaults to the secondary variant) */
	actions?: Action[];
	className?: string;
}

// Interior-page header: an optional breadcrumb, the page title and subtitle, and an optional row of
// action buttons. Standardises a composition that otherwise lives ad-hoc on top of Breadcrumb,
// Title and Content. Server-safe and small — it only arranges existing primitives.
const PageHeader = ({
	title,
	subtitle,
	breadcrumb = [],
	actions = [],
	className,
	ref,
}: PageHeaderProps & { ref?: Ref<HTMLElement> }) => {
	return (
		<header ref={ref} className={classNames('page-header', className)}>
			{breadcrumb.length > 0 && <Breadcrumb items={breadcrumb} />}

			<div className="bar">
				<div className="text">
					<Title size={1} value={title} />
					{subtitle && <Content className="subtitle" value={subtitle} />}
				</div>

				<Actions actions={actions} defaultVariant="secondary" />
			</div>
		</header>
	);
};

export default PageHeader;
