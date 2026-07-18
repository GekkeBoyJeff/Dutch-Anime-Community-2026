'use client';

import { useEffect, useState } from 'react';

import { getBrowserClient } from '@/lib/supabase/client';

type Db = ReturnType<typeof getBrowserClient>;
type Loader<T> = (db: Db) => Promise<T>;

export interface WidgetData<T> {
	loading: boolean;
	error: string | null;
	data: T | null;
}

// One fetch per widget, independent of every other widget so a slow query never blocks the page.
// The loader throws on a Supabase error (widgets surface a quiet inline error, never a toast); it
// returns null for the honest "no data" case. `refreshKey` drives an optimistic-mutation refetch.
export const useWidgetData = <T>(load: Loader<T>, refreshKey = 0): WidgetData<T> => {
	const [state, setState] = useState<WidgetData<T>>({ loading: true, error: null, data: null });

	useEffect(() => {
		let active = true;
		load(getBrowserClient())
			.then((data) => active && setState({ loading: false, error: null, data }))
			.catch((e) => active && setState({ loading: false, error: e instanceof Error ? e.message : 'Onbekende fout', data: null }));
		return () => {
			active = false;
		};
		// `load` is an inline closure recreated each render (the codebase's own dashboard idiom); only a
		// refreshKey bump should refetch, so it is intentionally the sole dependency.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [refreshKey]);

	return state;
};
