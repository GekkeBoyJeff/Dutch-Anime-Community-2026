import type { ReactNode, Ref } from 'react';

import { classNames } from '@/lib/classNames';

export interface DetailRowProps {
	/** Primary label; truncates to one line when it overflows */
	main: ReactNode;
	/** Secondary line below the main label */
	sub?: ReactNode;
	/** Trailing slot — a Badge, StatusBadge, an amount, … */
	trailing?: ReactNode;
	className?: string;
}

// One row in a compact list: a main label with an optional sub-line, and a trailing slot. Renders a
// bare <li> — compose it inside the list's own <ul>/<ol>.
const DetailRow = ({ main, sub, trailing, className, ref }: DetailRowProps & { ref?: Ref<HTMLLIElement> }) => (
	<li ref={ref} className={classNames('detail-row', className)}>
		<span className="detail-row-info">
			<span className="detail-row-main">{main}</span>
			{sub && <span className="detail-row-sub">{sub}</span>}
		</span>
		{trailing && <span className="detail-row-trailing">{trailing}</span>}
	</li>
);

export default DetailRow;
