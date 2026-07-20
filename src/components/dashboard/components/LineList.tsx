import type { ReactNode } from 'react';

export interface LineListItem {
	main: ReactNode;
	note?: ReactNode;
	meta?: ReactNode;
}

interface LineListProps {
	items: LineListItem[];
	emptyLabel?: string;
}

/**
 * A compact list of records: each row shows a main label over an optional note, with an optional
 * trailing meta/actions slot. When there are no items it renders `emptyLabel` (or nothing). Presentational.
 */
const LineList = ({ items, emptyLabel }: LineListProps) => {
	if (items.length === 0 && !emptyLabel) return null;

	return (
		<ul className="line-list">
			{items.length === 0 ? (
				<li className="empty">{emptyLabel}</li>
			) : (
				items.map((item, index) => (
					<li key={index} className="line">
						<span className="info">
							<span className="main">{item.main}</span>
							{item.note !== undefined && <span className="note">{item.note}</span>}
						</span>
						{item.meta !== undefined && <span className="meta">{item.meta}</span>}
					</li>
				))
			)}
		</ul>
	);
};

export default LineList;
