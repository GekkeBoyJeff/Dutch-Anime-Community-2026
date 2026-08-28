import { defaultPresetFor } from '@/lib/admin/puck/presets';
import { Page } from '@/lib/site/content/schema';

export interface PageTemplate {
	label: string;
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
			console.warn(`Template "${candidate.label}" overgeslagen — ongeldige preset-data`, parsed.error.issues);
			return [];
		}
		return [{ label: candidate.label, page: parsed.data }];
	});
};
