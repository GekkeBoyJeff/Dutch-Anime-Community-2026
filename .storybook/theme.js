import { create } from 'storybook/theming';

const brand = {
	brandTitle: 'DAC — Dutch Anime Community',
	brandTarget: '_self',
	colorPrimary: '#f5c24a',
	colorSecondary: '#3b2938',
	appBorderRadius: 8,
};

export const light = create({ base: 'light', ...brand, appBg: '#f9f9f9' });
export const dark = create({ base: 'dark', ...brand, appBg: '#14110f' });

export default light;
