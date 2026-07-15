import React, { useEffect, useRef, useState } from 'react';
import { STORY_CHANGED } from 'storybook/internal/core-events';
import { useArgs, useChannel, useStorybookApi } from 'storybook/manager-api';
import { styled } from 'storybook/theming';

import { EVENTS, type SchemaResult } from '../constants';
import { diffTopLevel } from '../lib/diff';
import { resolveNode, type SchemaPath } from '../lib/walk';

import Breadcrumb from './Breadcrumb';
import DetailsTab from './DetailsTab';
import ExampleTab from './ExampleTab';
import JsonEditor from './JsonEditor';
import SchemaTab from './SchemaTab';
import TabBar, { type TabId } from './TabBar';
import ValidationTab from './ValidationTab';

const Layout = styled.div({
	display: 'grid',
	gridTemplateColumns: 'minmax(340px, 1fr) 1fr',
	height: '100%',
	overflow: 'hidden',
});

const Left = styled.div(({ theme }) => ({
	display: 'flex',
	flexDirection: 'column',
	overflow: 'hidden',
	borderRight: `1px solid ${theme.appBorderColor}`,
}));

const Content = styled.div({ flex: 1, overflow: 'auto' });

const Right = styled.div({ overflow: 'hidden' });

const Message = styled.div(({ theme }) => ({
	padding: 16,
	color: theme.color.mediumdark,
	fontSize: theme.typography.size.s2,
}));

const Panel = () => {
	const api = useStorybookApi();
	const storyData = api.getCurrentStoryData();
	const storyId = storyData?.type === 'story' ? storyData.id : undefined;
	const storyIdRef = useRef(storyId);
	// Written during render (not an effect) so it's already current if a RESULT for the new story
	// arrives before the next commit; react-hooks/refs can't tell this "latest ref" read from a stale one.
	// eslint-disable-next-line react-hooks/refs
	storyIdRef.current = storyId;

	const [result, setResult] = useState<SchemaResult | null>(null);
	const [path, setPath] = useState<SchemaPath>([]);
	const [tab, setTab] = useState<TabId>('details');
	const [refreshSignal, setRefreshSignal] = useState(0);

	const [args, updateArgs] = useArgs();
	const argsJson = JSON.stringify(args ?? {}, null, 2);

	const handleApply = (parsed: Record<string, unknown>) => {
		const update = diffTopLevel(args ?? {}, parsed);
		if (Object.keys(update).length > 0) updateArgs(update);
	};

	const emit = useChannel({
		[EVENTS.RESULT]: (payload: SchemaResult) => {
			// Late RESULTs from the previous story can arrive after the manager switched stories.
			if (payload.storyId === storyIdRef.current) setResult(payload);
		},
		[STORY_CHANGED]: () => {
			setResult(null);
			setPath([]);
		},
	});

	useEffect(() => {
		if (storyId) emit(EVENTS.REQUEST, { storyId });
	}, [storyId, emit]);

	if (!result) return <Message>Waiting for the preview…</Message>;
	if (result.error) return <Message>Schema error: {result.error}</Message>;
	if (!result.schema) {
		return (
			<Message>
				This story has no zod schema. Components with a data contract can opt in via parameters.jsonSchema ={' '}
				{'{ schema: XProps }'} — see src/lib/content/schema/blocks/ for examples.
			</Message>
		);
	}

	// A stale path (e.g. schema changed via HMR) resolves to null — fall back to the root.
	const node = resolveNode(result.schema, path) ?? result.schema;
	const handleRefresh = () => setRefreshSignal((n) => n + 1);

	return (
		<Layout>
			<Left>
				<Breadcrumb path={path} onNavigate={setPath} onRefresh={handleRefresh} />
				<TabBar active={tab} onSelect={setTab} validationCount={result.issues.length} />
				<Content>
					{tab === 'details' && <DetailsTab node={node} path={path} onNavigate={setPath} />}
					{tab === 'schema' && <SchemaTab node={node} />}
					{tab === 'example' && <ExampleTab node={node} />}
					{tab === 'validation' && <ValidationTab issues={result.issues} />}
				</Content>
			</Left>
			<Right>
				<JsonEditor value={argsJson} onApply={handleApply} refreshSignal={refreshSignal} />
			</Right>
		</Layout>
	);
}

export default Panel;
