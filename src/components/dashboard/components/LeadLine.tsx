import type { ReactNode, Ref } from 'react';

import { classNames } from '@/lib/classNames';

export interface LeadLineProps {
	/** The bold headline line */
	main: ReactNode;
	/** Secondary line beneath it */
	sub?: ReactNode;
	className?: string;
}

// A two-line lead: a bold headline with an optional muted sub-line beneath it (a next-up fact, a
// deep-linked summary). Renders a bare <div> — drop it inside any card body.
const LeadLine = ({ main, sub, className, ref }: LeadLineProps & { ref?: Ref<HTMLDivElement> }) => (
	<div ref={ref} className={classNames('lead-line', className)}>
		<span className="lead-line-main">{main}</span>
		{sub && <span className="lead-line-sub">{sub}</span>}
	</div>
);

export default LeadLine;
