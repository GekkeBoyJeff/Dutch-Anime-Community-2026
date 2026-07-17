import { Document, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

import { formatEur, statusLabel } from '@/lib/expenses/types';

export interface ReportRow {
	description: string;
	person: string;
	date: string;
	event: string;
	category: string;
	amount: number;
	status: string;
	iban: string;
	accountHolder: string;
}
export interface ReportReceipt {
	label: string;
	url: string; // signed URL van een image-bon (PDF-bonnen kunnen niet ingesloten worden)
}
export interface ReportData {
	title: string;
	subtitle: string; // periode/filters
	generatedOn: string;
	generatedBy: string;
	rows: ReportRow[];
	total: number;
	byPerson: { person: string; total: number }[];
	byCategory: { category: string; total: number }[];
	receipts: ReportReceipt[];
}

// react-pdf gebruikt standaard Helvetica (WinAnsi) — dekt Nederlandse diacritics én €, dus geen self-hosted
// fonts nodig (blijft DRY: geen public/-assets). Liggend A4 zodat IBAN + naam naast de andere kolommen passen.
const styles = StyleSheet.create({
	page: { padding: 28, fontSize: 8, fontFamily: 'Helvetica', color: '#111' },
	header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14, borderBottom: '1px solid #ddd', paddingBottom: 10 },
	logo: { width: 40, height: 40 },
	org: { fontSize: 14, fontFamily: 'Helvetica-Bold' },
	title: { fontSize: 10, marginTop: 1 },
	meta: { fontSize: 7, color: '#888', marginTop: 2 },
	headRow: { flexDirection: 'row', borderBottom: '1px solid #999', paddingVertical: 3 },
	row: { flexDirection: 'row', borderBottom: '1px solid #eee', paddingVertical: 3 },
	cPerson: { flex: 2, paddingRight: 4 },
	cDesc: { flex: 3, paddingRight: 4 },
	cEvent: { flex: 2, paddingRight: 4 },
	cCat: { flex: 1.5, paddingRight: 4 },
	cDate: { flex: 1.6, paddingRight: 4 },
	cPayout: { flex: 3, paddingRight: 4 },
	cStatus: { flex: 1.4, paddingRight: 4 },
	cAmount: { flex: 1.4, textAlign: 'right' },
	bold: { fontFamily: 'Helvetica-Bold' },
	sub: { color: '#666', fontSize: 7 },
	totalsWrap: { flexDirection: 'row', gap: 40, marginTop: 16 },
	totalsCol: { flex: 1 },
	totalsHead: { fontSize: 10, fontFamily: 'Helvetica-Bold', marginBottom: 4 },
	totalRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 1 },
	grandTotal: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, marginTop: 6, borderTop: '1px solid #999', fontFamily: 'Helvetica-Bold', fontSize: 10 },
	receiptPage: { padding: 24, fontFamily: 'Helvetica' },
	receiptLabel: { fontSize: 10, marginBottom: 8, color: '#555' },
	receiptImg: { objectFit: 'contain', maxWidth: '100%', maxHeight: 500 },
});

export const ExpenseReport = ({ data, logoDataUri }: { data: ReportData; logoDataUri?: string }) => (
	<Document title={data.title} author="Dutch Anime Community">
		<Page size="A4" orientation="landscape" style={styles.page}>
			<View style={styles.header}>
				{/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf Image kent geen alt */}
				{logoDataUri ? <Image style={styles.logo} src={logoDataUri} /> : null}
				<View>
					<Text style={styles.org}>Dutch Anime Community</Text>
					<Text style={styles.title}>
						{data.title} · {data.subtitle}
					</Text>
					<Text style={styles.meta}>
						Gegenereerd op {data.generatedOn} door {data.generatedBy}
					</Text>
				</View>
			</View>

			<View style={styles.headRow}>
				<Text style={[styles.cPerson, styles.bold]}>Wie</Text>
				<Text style={[styles.cDesc, styles.bold]}>Omschrijving</Text>
				<Text style={[styles.cEvent, styles.bold]}>Conventie</Text>
				<Text style={[styles.cCat, styles.bold]}>Categorie</Text>
				<Text style={[styles.cDate, styles.bold]}>Datum</Text>
				<Text style={[styles.cPayout, styles.bold]}>Uitbetaling</Text>
				<Text style={[styles.cStatus, styles.bold]}>Status</Text>
				<Text style={[styles.cAmount, styles.bold]}>Bedrag</Text>
			</View>
			{data.rows.map((r, i) => (
				<View key={i} style={styles.row} wrap={false}>
					<Text style={styles.cPerson}>{r.person}</Text>
					<Text style={styles.cDesc}>{r.description}</Text>
					<Text style={styles.cEvent}>{r.event}</Text>
					<Text style={styles.cCat}>{r.category}</Text>
					<Text style={styles.cDate}>{r.date}</Text>
					<View style={styles.cPayout}>
						<Text>{r.iban || '—'}</Text>
						{r.accountHolder ? <Text style={styles.sub}>{r.accountHolder}</Text> : null}
					</View>
					<Text style={styles.cStatus}>{statusLabel(r.status)}</Text>
					<Text style={styles.cAmount}>{formatEur(r.amount)}</Text>
				</View>
			))}

			<View style={styles.totalsWrap}>
				<View style={styles.totalsCol}>
					<Text style={styles.totalsHead}>Per persoon</Text>
					{data.byPerson.map((p, i) => (
						<View key={i} style={styles.totalRow}>
							<Text>{p.person}</Text>
							<Text>{formatEur(p.total)}</Text>
						</View>
					))}
				</View>
				<View style={styles.totalsCol}>
					<Text style={styles.totalsHead}>Per categorie</Text>
					{data.byCategory.map((c, i) => (
						<View key={i} style={styles.totalRow}>
							<Text>{c.category}</Text>
							<Text>{formatEur(c.total)}</Text>
						</View>
					))}
					<View style={styles.grandTotal}>
						<Text>Totaal</Text>
						<Text>{formatEur(data.total)}</Text>
					</View>
				</View>
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
