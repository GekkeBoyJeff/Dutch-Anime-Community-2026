import { Page } from '@/lib/content/schema';
import { defaultPresetFor } from '@/lib/puck/presets';

// Page templates for the builder: a labelled, schema-valid starting page composed from the block
// presets (story data). Validated with Page.safeParse before they're offered, so a template can
// never load a page the export gate would reject; an invalid combination is dropped with a warning.

export interface PageTemplate {
	/** Menu label shown in the builder's template picker */
	label: string;
	/** The validated starting page */
	page: Page;
}

interface TemplateCandidate {
	label: string;
	meta: { title: string; description: string };
	blockTypes: string[];
}

const CANDIDATES: TemplateCandidate[] = [
	{
		label: 'Landingspagina',
		meta: { title: 'Nieuwe landingspagina', description: 'Beschrijf hier waar deze pagina over gaat.' },
		blockTypes: ['hero', 'featureCards', 'textMedia', 'ctaBanner'],
	},
	{
		label: 'Blogartikel',
		meta: { title: 'Nieuw artikel', description: 'Korte samenvatting van het artikel.' },
		blockTypes: ['hero', 'prose', 'ctaBanner'],
	},
	{
		label: 'FAQ-pagina',
		meta: { title: 'Veelgestelde vragen', description: 'Antwoorden op de meest gestelde vragen.' },
		blockTypes: ['hero', 'faqAccordion', 'subscribeNewsletter'],
	},
];

export const pageTemplates = (): PageTemplate[] => {
	return CANDIDATES.flatMap((candidate) => {
		const raw = {
			meta: candidate.meta,
			blocks: candidate.blockTypes.map((type, index) => ({
				type,
				id: `${type}-${index + 1}`,
				...defaultPresetFor(type),
			})),
		};

		const parsed = Page.safeParse(raw);
		if (!parsed.success) {
			// A preset drifted out of its schema; surface it in dev instead of offering a broken template.
			console.warn(`Template "${candidate.label}" overgeslagen — ongeldige preset-data`, parsed.error.issues);
			return [];
		}
		return [{ label: candidate.label, page: parsed.data }];
	});
};
