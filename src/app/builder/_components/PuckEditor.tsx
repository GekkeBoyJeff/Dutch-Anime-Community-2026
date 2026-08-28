'use client';

import { Puck, type Data, type Plugin } from '@puckeditor/core';
import headingAnalyzer from '@puckeditor/plugin-heading-analyzer';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from 'react';

import BlockDrawer from '@/app/builder/_components/BlockDrawer';
import { dispatchRef, takePendingPreset } from '@/app/builder/_components/presetBridge';
import Button from '@/components/basics/Button';
import Content from '@/components/basics/Content';
import Spinner from '@/components/basics/Spinner';
import Modal from '@/components/components/Modal';
import { config } from '@/lib/admin/puck/config';
import { pageTemplates, type PageTemplate } from '@/lib/admin/puck/templates';
import { fromPuckData, structuresChanged, toPuckData, type BuilderData } from '@/lib/admin/puck/transform';
import { usePermissions } from '@/lib/shared/auth/permissions';
import { env } from '@/lib/shared/env';
import { sanitizePage } from '@/lib/shared/sanitize';
import { getBrowserClient } from '@/lib/shared/supabase/client';
import { Page, SiteStructures } from '@/lib/site/content/schema';
import type { Json } from '@/types/database.types';

// The /builder route ships in the static export and is gated on the `pages.edit` permission — RLS
// is the real boundary, this gate is UX only.

type EditorSource = { kind: 'page'; path: string } | { kind: 'new' } | { kind: 'template'; template: PageTemplate };

const PAGE_LABELS: Record<string, string> = {
	'/': 'Home',
	'/404': '404 — pagina niet gevonden',
};

const NEW_PAGE = 'new';

// True after hydration only — the canonical client-only detector (no setState-in-effect).
const emptySubscribe = () => () => {};
const useMounted = (): boolean => useSyncExternalStore(emptySubscribe, () => true, () => false);

// The heading analyzer only (re)binds its DOM observers when data changes; remounting it once the
// preview iframe has content makes the Audit tab work on a freshly opened page.
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

// toPuckData needs a non-null SiteStructures; this is only used if the DB row is missing (it won't be
// after seeding).
const EMPTY_STRUCTURES = { navigation: {}, footer: {} } as unknown as SiteStructures;

type Feedback = { title: string; issues?: string[]; message?: string };

const PuckEditor = () => {
	const mounted = useMounted();
	const router = useRouter();
	const { permissions, loading: permsLoading, session } = usePermissions();
	const canEdit = permissions.has('pages.edit');
	const canPublish = permissions.has('site.approve');

	const [source, setSource] = useState<EditorSource>({ kind: 'page', path: '/' });
	const [editorKey, setEditorKey] = useState(0);
	const [feedback, setFeedback] = useState<Feedback | null>(null);
	const [paths, setPaths] = useState<string[]>([]);
	// Keyed by editorKey so a stale fetch never shows: initialData is null (→ spinner) until the load
	// for the current editorKey lands.
	const [loaded, setLoaded] = useState<{ key: number; data: BuilderData } | null>(null);
	const loadedStructuresRef = useRef<SiteStructures>(EMPTY_STRUCTURES);
	const latestDataRef = useRef<BuilderData | null>(null);

	const templates = useMemo(() => pageTemplates(), []);

	useEffect(() => {
		if (permsLoading) return;
		if (!session) {
			router.replace('/login?next=/builder');
			return;
		}
		if (!canEdit) router.replace('/dashboard');
	}, [permsLoading, session, canEdit, router]);

	useEffect(() => {
		if (!mounted || permsLoading || !session || !canEdit) return;
		let active = true;
		getBrowserClient()
			.from('pages')
			.select('path')
			.then(({ data }) => {
				if (active) setPaths((data ?? []).map((r) => r.path as string).sort());
			});
		return () => {
			active = false;
		};
	}, [mounted, permsLoading, session, canEdit]);

	useEffect(() => {
		if (!mounted || permsLoading || !session || !canEdit) return;
		let active = true;
		const currentKey = editorKey;
		const db = getBrowserClient();
		const pagePromise =
			source.kind === 'page'
				? db.from('pages').select('data').eq('path', source.path).maybeSingle()
				: Promise.resolve({ data: null as { data: unknown } | null });
		Promise.all([db.from('structures').select('data').eq('id', 1).maybeSingle(), pagePromise]).then(([structRes, pageRes]) => {
			if (!active) return;
			const structJson = (structRes as { data: { data: unknown } | null }).data?.data;
			const sParsed = structJson ? SiteStructures.safeParse(structJson) : undefined;
			const structures = sParsed?.success ? sParsed.data : EMPTY_STRUCTURES;
			loadedStructuresRef.current = structures;

			let page: Page | null = null;
			if (source.kind === 'template') {
				page = source.template.page;
			} else if (source.kind === 'page') {
				const pageJson = (pageRes as { data: { data: unknown } | null }).data?.data;
				if (pageJson) {
					const pParsed = Page.safeParse(pageJson);
					page = pParsed.success ? pParsed.data : null;
				}
			}
			const puckData = toPuckData(page, structures);
			latestDataRef.current = puckData;
			setLoaded({ key: currentKey, data: puckData });
		});
		return () => {
			active = false;
		};
	}, [mounted, permsLoading, session, canEdit, source, editorKey]);

	if (!mounted || permsLoading || !session || !canEdit) {
		return (
			<div className="builder-loading">
				<Spinner ariaLabel="Builder laden" />
			</div>
		);
	}

	const initialData = loaded && loaded.key === editorKey ? loaded.data : null;

	const loadSource = (next: EditorSource) => {
		setSource(next);
		setEditorKey((key) => key + 1);
	};

	const refreshPaths = async () => {
		const { data } = await getBrowserClient().from('pages').select('path');
		setPaths((data ?? []).map((r) => r.path as string).sort());
	};

	const savePage = async (data: Data) => {
		const result = fromPuckData(data as BuilderData);
		if (result.issues.length) {
			setFeedback({ title: 'Validatiefouten', issues: result.issues });
			return;
		}
		const db = getBrowserClient();
		let path = source.kind === 'page' ? source.path : null;
		if (!path && result.page) {
			const entered = window.prompt('Pad voor de nieuwe pagina (bijv. /over-ons):', '/');
			if (!entered) return;
			path = entered.startsWith('/') ? entered : `/${entered}`;
		}
		if (result.page && path) {
			const clean = sanitizePage(result.page);
			const { error } = await db.from('pages').upsert({ path, data: clean as unknown as Json }, { onConflict: 'path' });
			if (error) {
				setFeedback({ title: 'Opslaan mislukt', issues: [error.message] });
				return;
			}
			if (source.kind !== 'page' || source.path !== path) {
				await refreshPaths();
				loadSource({ kind: 'page', path });
			}
		}
		// Only write structures when the chrome actually changed, and merge into the full loaded
		// structures so overlays the builder doesn't round-trip (scrollProgress/searchPalette/
		// cookieConsent) survive the write.
		const loaded = loadedStructuresRef.current;
		const loadedChrome = {
			announcementBar: loaded.announcementBar,
			navigation: loaded.navigation,
			footer: loaded.footer,
		} as SiteStructures;
		if (result.structures && structuresChanged(result.structures, loadedChrome)) {
			const merged: SiteStructures = { ...loaded, ...result.structures };
			const { error } = await db.from('structures').upsert({ id: 1, data: merged }, { onConflict: 'id' });
			if (error) {
				setFeedback({ title: 'Structuren opslaan mislukt', issues: [error.message] });
				return;
			}
			loadedStructuresRef.current = merged;
		}
		setFeedback({
			title: 'Opgeslagen',
			message: canPublish ? 'Klik "Publiceren naar live" om de site te bouwen.' : 'Je wijzigingen zijn opgeslagen.',
		});
	};

	const publishLive = async () => {
		const {
			data: { session: current },
		} = await getBrowserClient().auth.getSession();
		const res = await fetch(`${env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/deploy`, {
			method: 'POST',
			headers: { Authorization: `Bearer ${current?.access_token ?? ''}` },
		});
		setFeedback(
			res.ok
				? { title: 'Build gestart', message: 'De site is over ~1-3 minuten live.' }
				: { title: 'Build starten mislukt', issues: ['Probeer het opnieuw of controleer je rechten.'] },
		);
	};

	return (
		<div className="builder">
			<div className="builder-topbar">
				<Button variant="ghost" icon="chevron-left" url="/dashboard" className="builder-back" value="Terug naar dashboard" />
				<div className="builder-topbar-actions">
					<label className="builder-page-select">
						<span className="sr-only">Pagina</span>
						<select
							value={source.kind === 'page' ? source.path : NEW_PAGE}
							onChange={(event) => {
								const path = event.currentTarget.value;
								loadSource(path === NEW_PAGE ? { kind: 'new' } : { kind: 'page', path });
							}}
						>
							<option value={NEW_PAGE}>Nieuwe pagina</option>
							{paths.map((path) => (
								<option key={path} value={path}>
									{PAGE_LABELS[path] ?? path}
								</option>
							))}
						</select>
					</label>
					{templates.length > 0 && (
						<label className="builder-page-select">
							<span className="sr-only">Template</span>
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
					<Button
						variant="primary"
						icon="check"
						onClick={() => {
							if (latestDataRef.current) savePage(latestDataRef.current);
						}}
						value="Opslaan"
					/>
					{canPublish && (
						<Button variant="secondary" icon="upload" onClick={publishLive} value="Publiceren naar live" />
					)}
				</div>
			</div>
			{initialData ? (
				<Puck
					key={editorKey}
					config={config}
					data={initialData}
					plugins={[auditPlugin]}
					// Keep richtext props plain HTML strings in the canvas (Puck's default swaps in a ReactNode
					// editor, breaking components typed to the string contract). Rich editing stays in the sidebar.
					fieldTransforms={{ richtext: ({ value }) => value as string }}
					onChange={(nextData) => {
						latestDataRef.current = nextData as BuilderData;
					}}
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
					}}
				/>
			) : (
				<div className="builder-loading">
					<Spinner ariaLabel="Pagina laden" />
				</div>
			)}

			<Modal
				open={feedback !== null}
				onOpenChange={(open) => {
					if (!open) setFeedback(null);
				}}
				title={feedback?.title ?? ''}
				size="l"
				footer={
					<Button variant="secondary" onClick={() => setFeedback(null)} value="Sluiten" />
				}
			>
				{feedback?.issues?.length ? (
					<ul className="builder-issues">
						{feedback.issues.map((issue) => (
							<li key={issue}>{issue}</li>
						))}
					</ul>
				) : feedback?.message ? (
					<Content element="p" value={feedback.message} />
				) : null}
			</Modal>
		</div>
	);
};

export default PuckEditor;
