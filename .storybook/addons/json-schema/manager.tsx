import React from 'react';
import { AddonPanel } from 'storybook/internal/components';
import { addons, types } from 'storybook/manager-api';

import Panel from './components/Panel';
import { ADDON_ID, PANEL_ID } from './constants';

addons.register(ADDON_ID, () => {
	addons.add(PANEL_ID, {
		type: types.PANEL,
		title: 'JSON Schema',
		render: ({ active }) => (
			<AddonPanel active={!!active}>
				<Panel />
			</AddonPanel>
		),
	});
});
