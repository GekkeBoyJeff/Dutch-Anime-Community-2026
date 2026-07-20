export interface AuditDetailEntry {
	key: string;
	before?: string;
	after: string;
}

interface AuditDetailListProps {
	entries: AuditDetailEntry[];
}

/**
 * The field-level detail of an audit entry: one row per field. A row with a `before` renders an
 * old → new diff; without it (an insert/delete snapshot) it shows the single value. Presentational —
 * the caller derives the entries from the audit row.
 */
const AuditDetailList = ({ entries }: AuditDetailListProps) => {
	if (entries.length === 0) return <p className="audit-detail-list is-empty">Geen veldwijzigingen.</p>;

	return (
		<dl className="audit-detail-list">
			{entries.map((e) => (
				<div key={e.key} className="row">
					<dt>{e.key}</dt>
					<dd>
						{e.before !== undefined ? (
							<>
								<span className="before">{e.before}</span>
								<span className="arrow"> → </span>
								<span className="after">{e.after}</span>
							</>
						) : (
							e.after
						)}
					</dd>
				</div>
			))}
		</dl>
	);
};

export default AuditDetailList;
