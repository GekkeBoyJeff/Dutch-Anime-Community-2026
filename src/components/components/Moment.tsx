import Interactive from '@/components/basics/Interactive';
import Skeleton from '@/components/basics/Skeleton';
import { classNames } from '@/lib/shared/classNames';
import type { MomentProps as MomentSchemaProps, MomentsProps as MomentsSchemaProps } from '@/lib/site/content/schema/components/moment';

type MomentProps = MomentSchemaProps;

type MomentListProps = MomentsSchemaProps;

const Moment = ({
	marker,
	title,
	meta,
	state = 'upcoming',
	tone = 'neutral',
	href,
	trailing,
	loading = false,
	className,
}: MomentProps) => {
	const body = (
		<>
			<span className="moment-body">
				<span className="moment-title">{loading ? <Skeleton height="1rem" width="65%" /> : title}</span>
				{(meta !== undefined || loading) && <span className="moment-meta">{loading ? <Skeleton height="0.8rem" width="40%" /> : meta}</span>}
			</span>
			{trailing !== undefined && !loading && <span className="moment-trailing">{trailing}</span>}
		</>
	);

	return (
		<li className={classNames('moment', `is-${state}`, `is-${tone}`, loading && 'is-loading', className)} aria-hidden={loading || undefined}>
			<span className="moment-rail" aria-hidden="true">
				<span className="moment-dot" />
			</span>
			<span className="moment-marker">{loading ? <Skeleton height="0.75rem" width="2.5rem" /> : marker}</span>
			{href && !loading ? (
				<Interactive url={href} className="moment-link">
					{body}
				</Interactive>
			) : (
				body
			)}
		</li>
	);
};

const MomentList = ({
	items,
	className,
}: MomentListProps) => (
	<ol className={classNames('moment-list', className)}>
		{items.map((item, index) => (
			<Moment key={index} {...item} />
		))}
	</ol>
);

Moment.List = MomentList;

export default Moment;
