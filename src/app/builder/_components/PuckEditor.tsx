'use client';

import { Puck, type Data, type Plugin } from '@puckeditor/core';
import headingAnalyzer from '@puckeditor/plugin-heading-analyzer';
import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';

import BlockDrawer from '@/app/builder/_components/BlockDrawer';
import { dispatchRef, takePendingPreset } from '@/app/builder/_components/presetBridge';
import Button from '@/components/basics/Button';
import Spinner from '@/components/basics/Spinner';
import Modal from '@/components/components/Modal';
import { pages } from '@/content/pages';
import { structures } from '@/content/structures';
import { config } from '@/lib/puck/config';
import { pageTemplates, type PageTemplate } from '@/lib/puck/templates';
import {
	fromPuckData,
	pageFileName,
	pageModuleCode,
	structuresChanged,
	structuresModuleCode,
	toPuckData,
	type BuilderData,
	type BuilderExport,
} from '@/lib/puck/transform';

// The visual builder island. Content is imported directly (not through the server-only accessors)
// because the editor runs entirely client-side; the /builder route is development-only, so this
// bundle never ships to production visitors.

/** What the editor is currently editing: an existing page, a blank page, or a template. */
type EditorSource = { kind: 'page'; path: string } | { kind: 'new' } | { kind: 'template'; template: PageTemplate };

const NEW_PAGE = 'new';

// True after hydration only — the canonical client-only detector (no setState-in-effect).
const emptySubscribe = () => () => {};
const useMounted = (): boolean => {
	return useSyncExternalStore(
		emptySubscribe,
		() => true,
		() => false,
	);
};

// The heading analyzer only (re)binds its DOM observers when data changes; when its effect runs
// before the preview iframe finishes loading, the Audit tab stays empty until the first edit.
// Remounting the analyzer once the iframe has content makes it work on a freshly opened page.
const BaseAnalyzer = headingAnalyzer.render as () => React.ReactElement;

const AuditPanel = (): React.ReactElement => {
	const [frameReady, setFrameReady] = useState(false);

	useEffect(() => {
		const timer = window.setInterval(() => {
			const frame = document.querySelector<HTMLIFrameElement>('iframe#preview-frame');
			if (frame?.contentDocument?.querySelector('[data-puck-entry]')) {
				window.clearInterval(timer);
				setFrameReady(true);
			}
		}, 250);
		return () => window.clearInterval(timer);
	}, []);

	return <BaseAnalyzer key={String(frameReady)} />;
};

const auditPlugin: Plugin = { ...headingAnalyzer, render: AuditPanel };

const PuckEditor = () => {
	// Puck measures the canvas, so render it after mount only.
	const mounted = useMounted();
	const [source, setSource] = useState<EditorSource>({ kind: 'page', path: '/' });
	const [editorKey, setEditorKey] = useState(0);
	const [exportResult, setExportResult] = useState<BuilderExport | null>(null);

	const templates = useMemo(() => pageTemplates(), []);

	const initialData = useMemo<BuilderData>(() => {
		const page =
			source.kind === 'page' ? (pages[source.path] ?? null) : source.kind === 'template' ? source.template.page : null;
		return toPuckData(page, structures);
	}, [source]);

	if (!mounted) {
		return (
			<div className="builder-loading">
				<Spinner label="Builder laden" />
			</div>
		);
	}

	// Remount Puck so the selected source becomes the editor's fresh initial data/history.
	const loadSource = (next: EditorSource) => {
		setSource(next);
		setEditorKey((key) => key + 1);
	};

	const exportPath = source.kind === 'page' ? source.path : '/nieuwe-pagina';
	const exportFile = pageFileName(exportPath);

	return (
		<div className="builder">
			<Puck
				key={editorKey}
				config={config}
				data={initialData}
				plugins={[auditPlugin]}
				// Keep richtext props plain HTML strings in the canvas (Puck's default transform swaps in
				// a ReactNode editor, which would break components typed to the string contract). Rich
				// editing stays available in the sidebar field.
				fieldTransforms={{ richtext: ({ value }) => value as string }}
				onPublish={(data: Data) => setExportResult(fromPuckData(data as BuilderData))}
				// A dragged story preset only carries its component type through Puck's dnd; right after
				// the insert lands, swap the default props for the story's props (see presetBridge).
				onAction={(action, newState) => {
					if (action.type !== 'insert') {
						return;
					}
					const presetProps = takePendingPreset(action.componentType);
					const dispatch = dispatchRef.current;
					if (!presetProps || !dispatch) {
						return;
					}
					const inserted = newState.data.content[action.destinationIndex];
					if (!inserted || inserted.type !== action.componentType) {
						return;
					}
					// Wait a tick so Puck finishes committing the insert first; dispatching the replace
					// straight from inside this handler gets swallowed by that same update.
					window.setTimeout(() => {
						dispatch({
							type: 'replace',
							destinationZone: action.destinationZone,
							destinationIndex: action.destinationIndex,
							data: { type: inserted.type, props: { ...presetProps, id: inserted.props.id } },
						});
					}, 0);
				}}
				overrides={{
					drawer: () => <BlockDrawer />,
					headerActions: ({ children }) => (
						<>
							<label className="builder-page-select">
								<span className="visually-hidden">Pagina</span>
								<select
									value={source.kind === 'page' ? source.path : NEW_PAGE}
									onChange={(event) => {
										const path = event.currentTarget.value;
										loadSource(path === NEW_PAGE ? { kind: 'new' } : { kind: 'page', path });
									}}
								>
									<option value={NEW_PAGE}>Nieuwe pagina</option>
									{Object.keys(pages).map((path) => (
										<option key={path} value={path}>
											{path === '/' ? 'Home' : path}
										</option>
									))}
								</select>
							</label>
							{templates.length > 0 && (
								<label className="builder-page-select">
									<span className="visually-hidden">Template</span>
									<select
										value=""
										onChange={(event) => {
											const template = templates[Number(event.currentTarget.value)];
											if (template) {
												loadSource({ kind: 'template', template });
											}
										}}
									>
										<option value="" disabled>
											Template…
										</option>
										{templates.map((template, index) => (
											<option key={template.label} value={index}>
												{template.label}
											</option>
										))}
									</select>
								</label>
							)}
							{children}
						</>
					),
				}}
			/>

			<Modal
				open={exportResult !== null}
				onOpenChange={(open) => {
					if (!open) {
						setExportResult(null);
					}
				}}
				title={exportResult?.issues.length ? 'Export geblokkeerd' : 'Exporteer pagina'}
				description={
					exportResult?.issues.length
						? 'Los deze validatiefouten op voordat je exporteert — zo kan de export nooit de build breken.'
						: undefined
				}
				size="l"
				footer={
					<Button variant="secondary" onClick={() => setExportResult(null)}>
						Sluiten
					</Button>
				}
			>
				{exportResult?.issues.length ? (
					<ul className="builder-issues">
						{exportResult.issues.map((issue) => (
							<li key={issue}>{issue}</li>
						))}
					</ul>
				) : (
					exportResult?.page && (
						<div className="builder-export">
							<p>
								Sla dit op als <code>src/content/pages/{exportFile}.ts</code> en registreer de route in{' '}
								<code>src/content/pages/index.ts</code>.
							</p>
							<textarea readOnly rows={16} value={pageModuleCode(exportResult.page, exportPath)} />
							{exportResult.structures && structuresChanged(exportResult.structures, structures) && (
								<>
									<p>
										De site-structuren zijn gewijzigd — vervang de data in <code>src/content/structures.ts</code> door:
									</p>
									<textarea readOnly rows={10} value={structuresModuleCode(exportResult.structures)} />
								</>
							)}
						</div>
					)
				)}
			</Modal>
		</div>
	);
};

export default PuckEditor;
