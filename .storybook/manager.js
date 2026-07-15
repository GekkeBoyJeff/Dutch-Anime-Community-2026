import { addons } from 'storybook/manager-api';

import theme from './theme';
import './addons/json-schema/manager';

// Applies the custom brand theme to the Storybook UI (sidebar, toolbar).
addons.setConfig({ theme });
