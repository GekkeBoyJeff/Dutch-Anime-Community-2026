import { create } from 'storybook/theming';

const brand = {
	brandTitle: 'DAC — Dutch Anime Community',
	brandTarget: '_self',
	appBorderRadius: 8,
	// Without this Storybook falls back to the bare `monospace` keyword, which Chrome renders
	// optically far smaller than the surrounding text — code blocks read as broken.
	fontCode: "'SF Mono', SFMono-Regular, ui-monospace, 'JetBrains Mono', Menlo, Consolas, monospace",
};

// Both accent colours are foregrounds — Storybook paints links, the selected sidebar row and the
// loading bar with them — so neither can be shared between two opposite backgrounds. These are the
// same two values the site itself uses for "the brand colour, as text": --primary-text-light and
// --primary-text-dark in theme.scss. Measured against their own appBg: 5.4:1 and 12.8:1 on light,
// 11.4:1 on dark. Readable text needs 4.5:1; the shared gold was 1.6:1 on light and the shared
// plum 1.4:1 on dark.
export const light = create({ base: 'light', ...brand, colorPrimary: '#875f0d', colorSecondary: '#3b2938', appBg: '#f9f9f9' });
export const dark = create({ base: 'dark', ...brand, colorPrimary: '#f5c24a', colorSecondary: '#f5c24a', appBg: '#14110f' });

export default light;
