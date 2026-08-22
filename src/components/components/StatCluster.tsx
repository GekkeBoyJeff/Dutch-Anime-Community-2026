import type { Ref } from 'react';

import Content from '@/components/basics/Content';
import { classNames } from '@/lib/classNames';
import type { StatClusterProps } from '@/lib/content/schema/components/statCluster';

// A row of short facts: a large anchor with a small label under it. Deliberately plain text — no
// counting up, no surface of its own. Whatever it sits on decides its contrast, so it can be placed
// on a scrim and still be measurable.
const StatCluster = ({ items, className, ref }: StatClusterProps & { ref?: Ref<HTMLDListElement> }) => {
	return (
		<dl ref={ref} className={classNames('stat-cluster', className)}>
			{items.map((item) => (
				<div key={item.id} className="stat-cluster-stat">
					<dt className="stat-cluster-value">{item.value}</dt>
					<Content element="dd" className="stat-cluster-label" value={item.label} />
				</div>
			))}
		</dl>
	);
};

export default StatCluster;
