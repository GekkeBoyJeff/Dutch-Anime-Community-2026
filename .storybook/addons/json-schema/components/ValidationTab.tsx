import React from 'react';
import { styled } from 'storybook/theming';

import type { ValidationIssue } from '../constants';
import { formatPath } from '../lib/walk';

const List = styled.div({ padding: '12px 16px', overflow: 'auto' });

const Ok = styled.div(({ theme }) => ({
	color: theme.color.positiveText,
	fontSize: theme.typography.size.s2,
}));

const Issue = styled.div(({ theme }) => ({
	marginBottom: 12,
	fontSize: theme.typography.size.s2,
	color: theme.color.defaultText,
}));

const Path = styled.code(({ theme }) => ({
	display: 'block',
	fontFamily: theme.typography.fonts.mono,
	color: theme.color.negativeText,
	marginBottom: 2,
}));

const ValidationTab = ({ issues }: { issues: ValidationIssue[] }) => {
	if (issues.length === 0) {
		return (
			<List>
				<Ok>No validation errors found.</Ok>
			</List>
		);
	}
	return (
		<List>
			{issues.map((issue, i) => (
				<Issue key={`${formatPath(issue.path)}-${i}`}>
					<Path>{formatPath(issue.path)}</Path>
					{issue.message}
				</Issue>
			))}
		</List>
	);
};

export default ValidationTab;
