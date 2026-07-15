import { create } from 'storybook/theming';

// Custom Storybook brand for the workshop UI. Colours come from the design tokens
// (src/styles/_initial.scss) so the chrome matches the site. The storybook-dark-mode toggle (configured
// in preview.tsx) swaps between `light` and `dark`; manager.js uses `light` as the initial theme.
const brand = {
	brandTitle: 'DAC — Dutch Anime Community',
	brandTarget: '_self',
	colorPrimary: '#f5c24a',   // brand gold — --accent in [data-theme='dac'] (MERKBRIEF §2)
	colorSecondary: '#3b2938', // plum-ink — --accent-contrast (Storybook chrome only)
	appBorderRadius: 8,
};

export const light = create({ base: 'light', ...brand, appBg: '#f9f9f9' });
export const dark = create({ base: 'dark', ...brand, appBg: '#14110f' });

export default light;
