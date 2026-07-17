import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

import { formatEur } from '@/lib/expenses/types';

export interface ReportRow {
	description: string;
	person: string;
	date: string;
	event: string;
	amount: number;
	status: string;
}
export interface ReportReceipt {
	label: string;
	url: string; // signed URL of een image-bon (PDF-bonnen kunnen niet ingesloten worden)
}
export interface ReportData {
	title: string;
	subtitle: string; // periode/filters
	generatedOn: string;
	generatedBy: string;
	rows: ReportRow[];
	total: number;
	byPerson: { person: string; total: number }[];
	receipts: ReportReceipt[];
}

// react-pdf gebruikt standaard Helvetica (WinAnsi) — dekt Nederlandse diacritics én €, dus geen self-hosted
// fonts nodig (blijft DRY: geen public/-assets). Kleuren/afmetingen bewust neutraal voor print.
const styles = StyleSheet.create({
	page: { padding: 36, fontSize: 9, fontFamily: 'Helvetica', color: '#111' },
	title: { fontSize: 16, fontFamily: 'Helvetica-Bold' },
	subtitle: { fontSize: 9, color: '#555', marginTop: 2 },
	meta: { fontSize: 8, color: '#888', marginTop: 2 },
	table: { marginTop: 16, borderTop: '1px solid #ccc' },
	row: { flexDirection: 'row', borderBottom: '1px solid #eee', paddingVertical: 4 },
	headRow: { flexDirection: 'row', borderBottom: '1px solid #999', paddingVertical: 4 },
	cDesc: { flex: 3, paddingRight: 4 },
	cPerson: { flex: 2, paddingRight: 4 },
	cEvent: { flex: 2, paddingRight: 4 },
	cDate: { flex: 1.4, paddingRight: 4 },
	cStatus: { flex: 1.2, paddingRight: 4 },
	cAmount: { flex: 1.2, textAlign: 'right' },
	bold: { fontFamily: 'Helvetica-Bold' },
	totalsHead: { fontSize: 11, fontFamily: 'Helvetica-Bold', marginTop: 18, marginBottom: 6 },
	totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2, maxWidth: 260 },
	grandTotal: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, marginTop: 4, borderTop: '1px solid #999', maxWidth: 260, fontFamily: 'Helvetica-Bold' },
	receiptPage: { padding: 24, fontFamily: 'Helvetica' },
	receiptLabel: { fontSize: 10, marginBottom: 8, color: '#555' },
	receiptImg: { objectFit: 'contain', maxWidth: '100%', maxHeight: 720 },
});

const STATUS_LABEL: Record<string, string> = { submitted: 'Ingediend', approved: 'Goedgekeurd', rejected: 'Afgewezen', reimbursed: 'Uitbetaald' };

export const ExpenseReport = ({ data }: { data: ReportData }) => (
	<Document title={data.title}>
		<Page size="A4" style={styles.page}>
			<Text style={styles.title}>{data.title}</Text>
			{data.subtitle ? <Text style={styles.subtitle}>{data.subtitle}</Text> : null}
			<Text style={styles.meta}>
				Gegenereerd op {data.generatedOn} door {data.generatedBy}
			</Text>

			<View style={styles.table}>
				<View style={styles.headRow}>
					<Text style={[styles.cDesc, styles.bold]}>Omschrijving</Text>
					<Text style={[styles.cPerson, styles.bold]}>Wie</Text>
					<Text style={[styles.cEvent, styles.bold]}>Conventie</Text>
					<Text style={[styles.cDate, styles.bold]}>Datum</Text>
					<Text style={[styles.cStatus, styles.bold]}>Status</Text>
					<Text style={[styles.cAmount, styles.bold]}>Bedrag</Text>
				</View>
				{data.rows.map((r, i) => (
					<View key={i} style={styles.row} wrap={false}>
						<Text style={styles.cDesc}>{r.description}</Text>
						<Text style={styles.cPerson}>{r.person}</Text>
						<Text style={styles.cEvent}>{r.event}</Text>
						<Text style={styles.cDate}>{r.date}</Text>
						<Text style={styles.cStatus}>{STATUS_LABEL[r.status] ?? r.status}</Text>
						<Text style={styles.cAmount}>{formatEur(r.amount)}</Text>
					</View>
				))}
			</View>

			<Text style={styles.totalsHead}>Totalen per persoon</Text>
			{data.byPerson.map((p, i) => (
				<View key={i} style={styles.totalRow}>
					<Text>{p.person}</Text>
					<Text>{formatEur(p.total)}</Text>
				</View>
			))}
			<View style={styles.grandTotal}>
				<Text>Totaal</Text>
				<Text>{formatEur(data.total)}</Text>
			</View>
		</Page>

		{data.receipts.map((receipt, i) => (
			<Page key={i} size="A4" style={styles.receiptPage}>
				<Text style={styles.receiptLabel}>Bon: {receipt.label}</Text>
				{/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image kent geen alt */}
				<Image style={styles.receiptImg} src={receipt.url} />
			</Page>
		))}
	</Document>
);
