import React from 'react';
import { SyntaxHighlighter } from 'storybook/internal/components';

import { buildExample } from '../lib/example';
import type { JsonSchemaNode } from '../lib/walk';

const ExampleTab = ({ node }: { node: JsonSchemaNode }) => {
	return (
		<SyntaxHighlighter language='json' copyable padded>
			{JSON.stringify(buildExample(node), null, 2)}
		</SyntaxHighlighter>
	);
}

export default ExampleTab;
