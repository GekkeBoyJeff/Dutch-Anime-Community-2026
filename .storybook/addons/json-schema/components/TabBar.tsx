import React from 'react';
import { styled } from 'storybook/theming';

export type TabId = 'details' | 'schema' | 'example' | 'validation';

const Bar = styled.div(({ theme }) => ({
	display: 'flex',
	gap: 16,
	padding: '0 12px',
	borderBottom: `1px solid ${theme.appBorderColor}`,
}));

const Tab = styled.button<{ active: boolean }>(({ theme, active }) => ({
	background: 'none',
	border: 0,
	borderBottom: `2px solid ${active ? theme.color.secondary : 'transparent'}`,
	padding: '8px 0',
	cursor: 'pointer',
	color: active ? theme.color.secondary : theme.color.defaultText,
	fontSize: theme.typography.size.s2,
	fontWeight: active ? theme.typography.weight.bold : theme.typography.weight.regular,
}));

const TabBar = ({
	active,
	onSelect,
	validationCount,
}: {
	active: TabId;
	onSelect: (t: TabId) => void;
	validationCount: number;
}) => {
	const tabs: { id: TabId; label: string }[] = [
		{ id: 'details', label: 'Details' },
		{ id: 'schema', label: 'Schema' },
		{ id: 'example', label: 'JSON example' },
		{ id: 'validation', label: `Validation (${validationCount})` },
	];
	return (
		<Bar role='tablist'>
			{tabs.map(({ id, label }) => {
				const handleSelect = () => onSelect(id);
				return (
					<Tab key={id} role='tab' aria-selected={active === id} active={active === id} onClick={handleSelect}>
						{label}
					</Tab>
				);
			})}
		</Bar>
	);
}

export default TabBar;
