import React from 'react';
import { SyntaxHighlighter } from 'storybook/internal/components';

import type { JsonSchemaNode } from '../lib/walk';

const SchemaTab = ({ node }: { node: JsonSchemaNode }) => {
	return (
		<SyntaxHighlighter language='json' copyable padded>
			{JSON.stringify(node, null, 2)}
		</SyntaxHighlighter>
	);
}

export default SchemaTab;
