import Interactive from '@/components/basics/Interactive';
import Skeleton from '@/components/basics/Skeleton';
import { classNames } from '@/lib/shared/classNames';
import type { EntryListProps as EntryListSchemaProps, EntryProps as EntrySchemaProps } from '@/lib/site/content/schema/components/entry';

type EntryProps = EntrySchemaProps;

type EntryListProps = EntryListSchemaProps;

const Entry = ({
	main,
	sub,
	marker,
	tone = 'neutral',
	trailing,
	href,
	loading = false,
	className,
}: EntryProps) => {
	const body = (
		<>
			{marker && (
				<span className="entry-marker" aria-hidden="true">
					{marker}
				</span>
			)}
			<span className="entry-info">
				<span className="entry-main">{loading ? <Skeleton height="0.95rem" width="70%" /> : main}</span>
				{(sub !== undefined || loading) && <span className="entry-sub">{loading ? <Skeleton height="0.8rem" width="45%" /> : sub}</span>}
			</span>
			{trailing !== undefined && !loading && <span className="entry-trailing">{trailing}</span>}
		</>
	);

	return (
		<li className={classNames('entry', `is-${tone}`, loading && 'is-loading', className)} aria-hidden={loading || undefined}>
			{href && !loading ? (
				<Interactive url={href} className="entry-link">
					{body}
				</Interactive>
			) : (
				body
			)}
		</li>
	);
};

const EntryList = ({
	items,
	className,
}: EntryListProps) => (
	<ul className={classNames('entry-list', className)}>
		{items.map((item, index) => (
			<Entry key={index} {...item} />
		))}
	</ul>
);

Entry.List = EntryList;

export default Entry;
