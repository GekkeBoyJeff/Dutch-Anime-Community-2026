import { json } from '@codemirror/lang-json';
import { Compartment } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { styled, useTheme } from 'storybook/theming';

import { deepEqual } from '../lib/diff';

const Wrapper = styled.div({
	height: '100%',
	overflow: 'auto',
	'.cm-editor': { height: '100%' },
});

const ParseHint = styled.div(({ theme }) => ({
	padding: '4px 12px',
	color: theme.color.negativeText,
	fontSize: theme.typography.size.s1,
	fontFamily: theme.typography.fonts.mono,
}));

const APPLY_DEBOUNCE_MS = 400;

const parseObject = (text: string): Record<string, unknown> | null => {
	try {
		const parsed: unknown = JSON.parse(text);
		return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
			? (parsed as Record<string, unknown>)
			: null;
	} catch {
		return null;
	}
};

const JsonEditor = ({
	value,
	onApply,
	refreshSignal,
}: {
	value: string;
	onApply: (parsed: Record<string, unknown>) => void;
	refreshSignal: number;
}) => {
	const theme = useTheme();
	const [parseError, setParseError] = useState(false);
	const editorRef = useRef<HTMLDivElement>(null);
	const viewRef = useRef<EditorView | null>(null);
	const themeCompartmentRef = useRef<Compartment | null>(null);
	const focusedRef = useRef(false);
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	// Props read inside the mount-once effect are routed through refs so the editor is never
	// recreated (which would drop cursor/selection) when value or onApply changes identity.
	const onApplyRef = useRef(onApply);
	const valueRef = useRef(value);

	useEffect(() => {
		onApplyRef.current = onApply;
		valueRef.current = value;
	});

	// Mount CodeMirror once; the doc lives in the EditorView, not React state. The update listener
	// debounces user edits and applies them through the current onApply.
	useEffect(() => {
		const themeCompartment = new Compartment();
		themeCompartmentRef.current = themeCompartment;
		const view = new EditorView({
			doc: valueRef.current,
			extensions: [
				basicSetup,
				json(),
				themeCompartment.of([]),
				EditorView.updateListener.of((update) => {
					if (!update.docChanged) return;
					const next = update.state.doc.toString();
					if (timerRef.current) clearTimeout(timerRef.current);
					timerRef.current = setTimeout(() => {
						const parsed = parseObject(next);
						setParseError(!parsed);
						if (parsed) onApplyRef.current(parsed);
					}, APPLY_DEBOUNCE_MS);
				}),
			],
			parent: editorRef.current ?? undefined,
		});
		viewRef.current = view;
		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
			view.destroy();
			viewRef.current = null;
		};
	}, []);

	// Light mode uses default CM styling ([]); dark mode swaps in oneDark via the compartment.
	useEffect(() => {
		const view = viewRef.current;
		const compartment = themeCompartmentRef.current;
		if (!view || !compartment) return;
		view.dispatch({ effects: compartment.reconfigure(theme.base === 'dark' ? oneDark : []) });
	}, [theme.base]);

	// External arg changes re-sync the doc only when that is lossless: never while the user is typing
	// (focused) and never when the doc is semantically equal already (a resync would only reformat
	// under the cursor).
	useEffect(() => {
		const view = viewRef.current;
		if (!view) return;
		const doc = view.state.doc.toString();
		const docParsed = parseObject(doc);
		const valueParsed = parseObject(value);
		if (docParsed && valueParsed && deepEqual(docParsed, valueParsed)) return;
		if (!focusedRef.current) {
			view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: value } });
			setParseError(false);
		}
	}, [value]);

	// The refresh button force-resyncs, discarding the draft.
	useEffect(() => {
		const view = viewRef.current;
		if (refreshSignal > 0 && view) {
			view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: value } });
			setParseError(false);
		}
	}, [refreshSignal]); // eslint-disable-line react-hooks/exhaustive-deps

	const handleFocus = useCallback(() => {
		focusedRef.current = true;
	}, []);
	const handleBlur = useCallback(() => {
		focusedRef.current = false;
	}, []);

	// Focus tracked on the wrapper (capture phase) — guaranteed React DOM behavior, unlike focus
	// props on the editor itself.
	return (
		<Wrapper onFocusCapture={handleFocus} onBlurCapture={handleBlur}>
			{parseError && <ParseHint>Invalid JSON — changes are on hold until it parses.</ParseHint>}
			<div ref={editorRef} style={{ height: '100%' }} />
		</Wrapper>
	);
}

export default JsonEditor;
