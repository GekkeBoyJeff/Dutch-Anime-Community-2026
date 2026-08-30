// A stand-in for src/lib/supabase/client.ts, aliased in for Storybook only (see .storybook/main.js).
//
// It is a fixture, not a simulator. Filters are applied so a screen shows plausibly narrowed data
// rather than every row, but nothing here enforces anything: in the real app Row Level Security
// decides what a caller may read, and no mock can or should stand in for that.

import { FIXTURES, RPC_FIXTURES, STORAGE_FIXTURES, USER_ID } from './fixtures';

const session = () => ({
	access_token: 'storybook',
	token_type: 'bearer',
	expires_in: 3600,
	refresh_token: 'storybook',
	user: {
		id: USER_ID,
		email: 'jeffrey@example.test',
		app_metadata: {},
		aud: 'authenticated',
		created_at: new Date(0).toISOString(),
		user_metadata: {
			full_name: 'Jeffrey de Vries',
			name: 'Jeffrey de Vries',
			user_name: 'gekkeboyjeff',
			avatar_url: undefined,
		},
	},
});

type Row = Record<string, unknown>;
type Filter = (row: Row) => boolean;

// Filters compare loosely: a fixture may hold a number where the query passes a string, so both sides
// are normalised before matching.
const asString = (value: unknown): string => (value === null || value === undefined ? '' : String(value));

class Query implements PromiseLike<{ data: unknown; error: null; count: number | null }> {
	private rows: Row[];
	private filters: Filter[] = [];
	private limitTo: number | null = null;
	private orderKey: string | null = null;
	private orderAsc = true;
	private singleRow = false;
	private headOnly = false;
	private wantCount = false;

	constructor(table: string) {
		this.rows = ((FIXTURES[table] ?? []) as Row[]).map((row) => ({ ...row }));
	}

	select(_columns?: string, options?: { count?: string; head?: boolean }) {
		if (options?.count) this.wantCount = true;
		if (options?.head) this.headOnly = true;
		return this;
	}

	insert(values: Row | Row[]) {
		this.rows = Array.isArray(values) ? values : [values];
		return this;
	}

	update(values: Row) {
		this.rows = this.rows.map((row) => ({ ...row, ...values }));
		return this;
	}

	delete() {
		this.rows = [];
		return this;
	}

	upsert(values: Row | Row[]) {
		return this.insert(values);
	}

	eq(column: string, value: unknown) {
		this.filters.push((row) => asString(row[column]) === asString(value));
		return this;
	}

	is(column: string, value: unknown) {
		this.filters.push((row) => (row[column] ?? null) === value);
		return this;
	}

	in(column: string, values: unknown[]) {
		const set = new Set(values.map(asString));
		this.filters.push((row) => set.has(asString(row[column])));
		return this;
	}

	gte(column: string, value: unknown) {
		this.filters.push((row) => asString(row[column]) >= asString(value));
		return this;
	}

	lte(column: string, value: unknown) {
		this.filters.push((row) => asString(row[column]) <= asString(value));
		return this;
	}

	ilike(column: string, pattern: string) {
		const needle = pattern.replace(/%/g, '').toLowerCase();
		this.filters.push((row) => asString(row[column]).toLowerCase().includes(needle));
		return this;
	}

	order(column: string, options?: { ascending?: boolean }) {
		this.orderKey = column;
		this.orderAsc = options?.ascending !== false;
		return this;
	}

	limit(count: number) {
		this.limitTo = count;
		return this;
	}

	maybeSingle() {
		this.singleRow = true;
		return this;
	}

	private resolve() {
		let out = this.rows.filter((row) => this.filters.every((f) => f(row)));
		if (this.orderKey) {
			const key = this.orderKey;
			out = [...out].sort((a, b) => {
				const left = asString(a[key]);
				const right = asString(b[key]);
				return this.orderAsc ? left.localeCompare(right) : right.localeCompare(left);
			});
		}
		const count = out.length;
		if (this.limitTo !== null) out = out.slice(0, this.limitTo);
		if (this.headOnly) return { data: null, error: null, count };
		if (this.singleRow) return { data: out[0] ?? null, error: null, count };
		return { data: out, error: null, count: this.wantCount ? count : null };
	}

	then<TResult1 = { data: unknown; error: null; count: number | null }, TResult2 = never>(
		onfulfilled?: ((value: { data: unknown; error: null; count: number | null }) => TResult1 | PromiseLike<TResult1>) | null,
		onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
	): PromiseLike<TResult1 | TResult2> {
		return Promise.resolve(this.resolve()).then(onfulfilled, onrejected);
	}
}

// It has to be a file that exists: a made-up placeholder path 404s, and a media grid of broken images
// verifies nothing. The object path rides along as the fragment so a story still shows its row.
const STAND_IN_IMAGE = '/media/_opt/dac-stand-640.webp';

const storageBucket = (bucket: string) => ({
	list: async () => ({ data: STORAGE_FIXTURES[bucket] ?? [], error: null }),
	getPublicUrl: (path: string) => ({ data: { publicUrl: `${STAND_IN_IMAGE}#${path}` } }),
});

export const getBrowserClient = () => ({
	auth: {
		getSession: async () => ({ data: { session: session() }, error: null }),
		getUser: async () => ({ data: { user: session().user }, error: null }),
		onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
		signOut: async () => ({ error: null }),
		signInWithOAuth: async () => ({ data: null, error: null }),
	},
	from: (table: string) => new Query(table),
	rpc: async (name: string) => ({
		data: RPC_FIXTURES[name] ?? null,
		error: null,
	}),
	functions: {
		invoke: async () => ({ data: null, error: null }),
	},
	storage: { from: storageBucket },
});
