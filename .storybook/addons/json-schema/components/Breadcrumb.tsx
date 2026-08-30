import { SyncIcon } from '@storybook/icons';
import React from 'react';
import { IconButton } from 'storybook/internal/components';
import { styled } from 'storybook/theming';

import type { SchemaPath } from '../lib/walk';

const Bar = styled.div(({ theme }) => ({
	display: 'flex',
	alignItems: 'center',
	gap: 4,
	padding: '8px 12px',
	borderBottom: `1px solid ${theme.appBorderColor}`,
}));

const Crumb = styled.button(({ theme }) => ({
	background: 'none',
	border: 0,
	padding: 0,
	cursor: 'pointer',
	color: theme.color.secondary,
	fontSize: theme.typography.size.s2,
}));

const Separator = styled.span(({ theme }) => ({
	color: theme.color.mediumdark,
	fontSize: theme.typography.size.s2,
}));

const Spacer = styled.div({ flex: 1 });

const Breadcrumb = ({
	path,
	onNavigate,
	onRefresh,
}: {
	path: SchemaPath;
	onNavigate: (p: SchemaPath) => void;
	onRefresh: () => void;
}) => {
	const handleRoot = () => onNavigate([]);
	return (
		<Bar>
			<Crumb onClick={handleRoot}>Root</Crumb>
			{path.map((segment, i) => {
				const handleClick = () => onNavigate(path.slice(0, i + 1));
				return (
					<React.Fragment key={`${i}-${String(segment)}`}>
						<Separator>/</Separator>
						<Crumb onClick={handleClick}>{typeof segment === 'number' ? `option ${segment + 1}` : segment}</Crumb>
					</React.Fragment>
				);
			})}
			<Spacer />
			<IconButton title='Reset editor to current args' onClick={onRefresh}>
				<SyncIcon />
			</IconButton>
		</Bar>
	);
}

export default Breadcrumb;
