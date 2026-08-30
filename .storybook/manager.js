import { addons } from 'storybook/manager-api';

import theme from './theme';
import './addons/json-schema/manager';

addons.setConfig({ theme });
