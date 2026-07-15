import type { ReactNode, Ref } from 'react';

import Actions from '@/components/basics/Actions';
import Container from '@/components/basics/Container';
import Content from '@/components/basics/Content';
import Icon from '@/components/basics/Icon';
import Section from '@/components/basics/Section';
import Title from '@/components/basics/Title';
import { classNames } from '@/lib/classNames';
import type { Action, Colorset } from '@/lib/content';

interface ErrorStateProps {
	/** A short error code shown above the heading, e.g. "404" or "500" */
	code?: string;
	title?: string;
	/** Supporting message under the heading; may contain HTML */
	message?: string;
	/** Optional icon glyph name shown above the code (the icon font is a placeholder) */
	icon?: string;
	/** Custom illustration slot above the code; wins over `icon` */
	media?: ReactNode;
	/** Calls to action, typically "home" plus an optional retry */
	actions?: Action[];
	colorset?: Colorset;
	className?: string;
}

// Presentational 404 / error / maintenance block to fill Next.js not-found.tsx and error.tsx. A
// Server Component composing Section + Title/Content + Button, centred in a full section. Shares the
// same primitive family as EmptyState but stands alone as a page (its own colorset + Section).
const ErrorState = ({
	code,
	title = 'Er ging iets mis',
	message,
	icon,
	media,
	actions = [{ label: 'Terug naar home', url: '/' }],
	colorset,
	className,
	ref,
}: ErrorStateProps & { ref?: Ref<HTMLElement> }) => {
	return (
		<Section ref={ref} colorset={colorset} className={classNames('error-state', className)}>
			<Container className="error-state-body">
				{media ? (
					<div className="error-state-media">{media}</div>
				) : (
					icon && (
						<span className="error-state-icon" aria-hidden="true">
							<Icon name={icon} className='error-state-icon-glyph' />
						</span>
					)
				)}

				{code && <Content element="p" className="error-state-code" value={code} />}

				<Title element="h1" size={2} value={title} className="error-state-title" />

				{message && <Content className="error-state-text" value={message} />}

				<Actions actions={actions} defaultVariant="primary" className="error-state-actions" />
			</Container>
		</Section>
	);
};

export default ErrorState;
