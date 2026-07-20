'use client';

import { Command, useCommandState } from 'cmdk';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import Icon from '@/components/basics/Icon';
import Shortcut from '@/components/basics/Shortcut';
import type { PaletteCommand } from '@/lib/auth/dashboard-sections';

// A live search hit for a real record (a convention or a member), deep-linking straight to that record.
export interface PaletteResult {
	key: string;
	group: 'events' | 'people';
	label: string;
	sublabel?: string | null;
	href: string;
	icon: string;
}

export interface CommandPaletteProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	/** The "Pagina's" group — the caller's permission-filtered destinations. */
	pages: PaletteCommand[];
	/** The "Acties" group — deep-links into create flows; empty hides the group. */
	actions: PaletteCommand[];
	/** Builds the "see all people" target from the live query; omit to hide that fallback. */
	personSearchHref?: (query: string) => string;
	/** Live search over real records (conventions, members). Omit to disable inline record results. */
	searchEntities?: (query: string) => Promise<PaletteResult[]>;
}

const RECENT_KEY = 'dac:command-recent';
const RECENT_MAX = 5;
const MIN_QUERY = 2;
const DEBOUNCE_MS = 180;

// The last-picked commands, newest first, read defensively (private-mode / bad JSON never throws).
const readRecent = (): PaletteCommand[] => {
	try {
		const parsed = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]');
		return Array.isArray(parsed) ? (parsed as PaletteCommand[]).slice(0, RECENT_MAX) : [];
	} catch {
		return [];
	}
};

// One static command row: icon + label. `value` drives cmdk's fuzzy match; recents pass a distinct value
// so a command showing in both "Recent" and its own group never collides on selection.
const PaletteItem = ({ command, value, onSelect }: { command: PaletteCommand; value?: string; onSelect: (command: PaletteCommand) => void }) => (
	<Command.Item className="command-palette-item" value={value ?? command.label} onSelect={() => onSelect(command)}>
		<Icon name={command.icon} className="command-palette-item-icon" />
		<span className="command-palette-item-label">{command.label}</span>
	</Command.Item>
);

// One live-record row: force-mounted (the server already matched it, so cmdk must not filter it out) with
// an optional second line (location / discord tag).
const ResultItem = ({ result, onNavigate }: { result: PaletteResult; onNavigate: (href: string) => void }) => (
	<Command.Item className="command-palette-item" value={`${result.label} ${result.key}`} forceMount onSelect={() => onNavigate(result.href)}>
		<Icon name={result.icon} className="command-palette-item-icon" />
		<span className="command-palette-item-text">
			<span className="command-palette-item-label">{result.label}</span>
			{result.sublabel && <span className="command-palette-item-sub">{result.sublabel}</span>}
		</span>
	</Command.Item>
);

// Recents only make sense on an empty query — cmdk keeps every group mounted, so once the user types this
// folds away and normal fuzzy matching over Pagina's/Acties takes over.
const RecentGroup = ({ items, onSelect }: { items: PaletteCommand[]; onSelect: (command: PaletteCommand) => void }) => {
	const search = useCommandState((state) => state.search);
	if (search.trim() !== '' || items.length === 0) return null;
	return (
		<Command.Group heading="Recent" className="command-palette-group">
			{items.map((command) => (
				<PaletteItem key={`recent-${command.key}`} command={command} value={`recent ${command.label}`} onSelect={onSelect} />
			))}
		</Command.Group>
	);
};

// The live conventions group — hidden until there is at least one hit (results are empty until the user
// types), so it never leaves a dangling heading.
const ConventionsGroup = ({ events, onNavigate }: { events: PaletteResult[]; onNavigate: (href: string) => void }) => {
	if (events.length === 0) return null;
	// forceMount on the GROUP too: cmdk scores async items as non-matching and hides the group,
	// leaving force-mounted children invisible.
	return (
		<Command.Group heading="Conventies" className="command-palette-group" forceMount>
			{events.map((result) => (
				<ResultItem key={result.key} result={result} onNavigate={onNavigate} />
			))}
		</Command.Group>
	);
};

// The people group: live member hits plus a "see all in the list" fallback. Only shows once the user is
// typing, so an empty query never renders a lone heading.
const PeopleGroup = ({ people, personSearchHref, onNavigate }: { people: PaletteResult[]; personSearchHref?: (query: string) => string; onNavigate: (href: string) => void }) => {
	const query = useCommandState((state) => state.search).trim();
	if (query === '' || (people.length === 0 && !personSearchHref)) return null;
	return (
		<Command.Group heading="Personen" className="command-palette-group" forceMount>
			{people.map((result) => (
				<ResultItem key={result.key} result={result} onNavigate={onNavigate} />
			))}
			{personSearchHref && (
				<Command.Item className="command-palette-item" value="alle personen zoek verder" forceMount onSelect={() => onNavigate(personSearchHref(query))}>
					<Icon name="search" className="command-palette-item-icon" />
					<span className="command-palette-item-label">Alle personen met “{query}”…</span>
				</Command.Item>
			)}
		</Command.Group>
	);
};

// A render-null probe: reads the live query from cmdk and reports it (debounced) to the parent, which owns
// the async record search. Debouncing here keeps the effect body free of synchronous setState.
const QueryProbe = ({ onQuery }: { onQuery: (query: string) => void }) => {
	const query = useCommandState((state) => state.search);
	useEffect(() => {
		const timer = setTimeout(() => onQuery(query.trim()), DEBOUNCE_MS);
		return () => clearTimeout(timer);
	}, [query, onQuery]);
	return null;
};

// Empty state with a little character; the query echoes back so a dead end reads as intentional.
const EmptyLabel = () => {
	const query = useCommandState((state) => state.search).trim();
	return (
		<>
			<span className="command-palette-empty-face" aria-hidden="true">
				(·_·)
			</span>
			<span>{query ? `Niets gevonden voor “${query}”` : 'Begin met typen om te zoeken.'}</span>
		</>
	);
};

// The dashboard ⌘K palette: cmdk's Radix-backed Command.Dialog (focus-trap/ESC/scroll-lock come free).
// Static groups (Recent/Pagina's/Acties) fuzzy-match client-side; Conventies/Personen are live Supabase
// hits from `searchEntities`. data-theme/data-colorset ride the cmdk-root so admin tokens resolve inside
// the body-level portal; the box is fixed-size (no CLS on filter).
const CommandPalette = ({ open, onOpenChange, pages, actions, personSearchHref, searchEntities }: CommandPaletteProps) => {
	const router = useRouter();
	// Seed the MRU from localStorage once (client-only); selecting a command updates both store and state,
	// so the component stays mounted across opens without re-reading. The list only shows inside the open
	// dialog (Radix mounts content lazily), so a non-empty seed never affects the closed-state markup.
	const [recent, setRecent] = useState<PaletteCommand[]>(() => (typeof window === 'undefined' ? [] : readRecent()));
	const [results, setResults] = useState<PaletteResult[]>([]);
	const [loading, setLoading] = useState(false);
	// Monotonic token: only the newest query's response is allowed to land, so out-of-order fetches can't
	// flash stale hits.
	const searchToken = useRef(0);

	// Runs from QueryProbe's debounce timer (an event callback, not an effect body), so setState is fine.
	const runSearch = useCallback(
		(query: string) => {
			if (!searchEntities || query.length < MIN_QUERY) {
				searchToken.current += 1;
				setResults([]);
				setLoading(false);
				return;
			}
			const token = (searchToken.current += 1);
			setLoading(true);
			searchEntities(query)
				.then((found) => {
					if (token === searchToken.current) {
						setResults(found);
						setLoading(false);
					}
				})
				.catch(() => {
					if (token === searchToken.current) {
						setResults([]);
						setLoading(false);
					}
				});
		},
		[searchEntities],
	);

	const handleOpenChange = useCallback(
		(next: boolean) => {
			// Drop stale hits on close so a reopen never flashes the previous query's results.
			if (!next) {
				searchToken.current += 1;
				setResults([]);
				setLoading(false);
			}
			onOpenChange(next);
		},
		[onOpenChange],
	);

	const navigate = useCallback(
		(href: string) => {
			router.push(href);
			handleOpenChange(false);
		},
		[router, handleOpenChange],
	);

	const selectCommand = useCallback(
		(command: PaletteCommand) => {
			const next = [command, ...readRecent().filter((entry) => entry.key !== command.key)].slice(0, RECENT_MAX);
			setRecent(next);
			try {
				localStorage.setItem(RECENT_KEY, JSON.stringify(next));
			} catch {
				// A full/blocked localStorage just means no persistence — never block the navigation.
			}
			navigate(command.href);
		},
		[navigate],
	);

	const events = results.filter((result) => result.group === 'events');
	const people = results.filter((result) => result.group === 'people');

	return (
		<Command.Dialog
			open={open}
			onOpenChange={handleOpenChange}
			label="Snelzoeken"
			loop
			data-theme="admin"
			data-colorset="light"
			className="command-palette"
			overlayClassName="command-palette-overlay"
			contentClassName="command-palette-content"
		>
			<div className="command-palette-field">
				<Icon name="search" className="command-palette-field-icon" />
				<Command.Input className="command-palette-input" placeholder="Zoek pagina's, conventies of personen…" />
				{loading && <span className="command-palette-spinner" aria-hidden="true" />}
			</div>

			<Command.List className="command-palette-list">
				{searchEntities && <QueryProbe onQuery={runSearch} />}

				{/* Force-mounted entity hits bypass cmdk's match count, so Empty must also wait for them. */}
				{!loading && results.length === 0 && (
					<Command.Empty className="command-palette-empty">
						<EmptyLabel />
					</Command.Empty>
				)}

				<RecentGroup items={recent} onSelect={selectCommand} />

				<ConventionsGroup events={events} onNavigate={navigate} />
				<PeopleGroup people={people} personSearchHref={personSearchHref} onNavigate={navigate} />

				<Command.Group heading="Pagina's" className="command-palette-group">
					{pages.map((command) => (
						<PaletteItem key={command.key} command={command} onSelect={selectCommand} />
					))}
				</Command.Group>

				{actions.length > 0 && (
					<Command.Group heading="Acties" className="command-palette-group">
						{actions.map((command) => (
							<PaletteItem key={command.key} command={command} onSelect={selectCommand} />
						))}
					</Command.Group>
				)}
			</Command.List>

			<footer className="command-palette-footer">
				<span className="command-palette-hint">
					<Shortcut>↑</Shortcut>
					<Shortcut>↓</Shortcut>
					navigeren
				</span>
				<span className="command-palette-hint">
					<Shortcut>↵</Shortcut>
					openen
				</span>
				<span className="command-palette-hint">
					<Shortcut>esc</Shortcut>
					sluiten
				</span>
			</footer>
		</Command.Dialog>
	);
};

export default CommandPalette;
