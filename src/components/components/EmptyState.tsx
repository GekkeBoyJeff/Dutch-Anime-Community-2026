import type { ReactNode, Ref } from 'react';

import Actions from '@/components/basics/Actions';
import Content from '@/components/basics/Content';
import Icon from '@/components/basics/Icon';
import Title from '@/components/basics/Title';
import { classNames } from '@/lib/classNames';
import type { EmptyStateProps as EmptyStateSchemaProps } from '@/lib/content/schema/components/emptyState';

type EmptyStateProps = EmptyStateSchemaProps & {
	/** Custom media slot above the title; wins over `icon` (an illustration, a Media, …) */
	media?: ReactNode;
	/** Extra content below the actions (a hint, a secondary link, …) */
	children?: ReactNode;
};

// Zero-state: an optional icon/illustration, a title, a description and up to two actions. Pairs
// with FilterBar / SearchPalette / ImageList for no-results and fills 404/error presentation. A
// Server Component composing Title/Content/Button; centred and self-contained.
const EmptyState = ({
	title,
	description,
	icon,
	media,
	actions = [],
	compact = false,
	className,
	children,
	ref,
}: EmptyStateProps & { ref?: Ref<HTMLDivElement> }) => {
	return (
		<div ref={ref} className={classNames('empty-state', compact && 'is-compact', className)}>
			{media ? (
				<div className="empty-state-media">{media}</div>
			) : (
				icon && (
					<span className="empty-state-icon" aria-hidden="true">
						<Icon name={icon} className='empty-state-glyph' />
					</span>
				)
			)}

			<Title element="h2" size={4} value={title} className="empty-state-title" />

			{description && <Content size="small" className="empty-state-text" value={description} />}

			<Actions actions={actions} defaultVariant="primary" className="empty-state-actions" />

			{children}
		</div>
	);
};

export default EmptyState;
