// A stand-in for src/lib/supabase/client.ts, aliased in for Storybook only (see .storybook/main.js).
//
// Why this exists: nearly every dashboard component fetches its own data through getBrowserClient().
// Without a stand-in, a story for one of them renders a spinner and then an error, which looks like
// coverage while verifying nothing. Because usePermissions and useDashboardGuard also derive from this
// one module, replacing it here is enough to make every screen render — including its own gate.
//
// It is a fixture, not a simulator. Filters are applied so a screen shows plausibly narrowed data
// rather than every row, but nothing here enforces anything: in the real app Row Level Security
// decides what a caller may read, and no mock can or should stand in for that.

import { FIXTURES, RPC_FIXTURES, STORAGE_FIXTURES, USER_ID } from './fixtures';
import { PERMISSIONS_BY_ROLE, type StoryRole } from './roles';

let activeRole: StoryRole = 'yakuza';

/** Set by the Storybook "Rol" toolbar before a story renders. */
export const setStoryRole = (role: StoryRole): void => {
	activeRole = role;
};

// usePermissions caches its RPC result against the session's user id, so a role switch would keep
// serving the previous role's permissions. Giving each role its own id invalidates that cache without
// touching app code; queries normalise it back (see asString) so the fixtures still match.
const roleUserId = (): string => `${USER_ID}-${activeRole}`;

const session = () => ({
	access_token: 'storybook',
	token_type: 'bearer',
	expires_in: 3600,
	refresh_token: 'storybook',
	user: {
		id: roleUserId(),
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

// The session id carries a role suffix (see roleUserId) purely to bust a permissions cache. Strip it
// here so `eq('user_id', session.user.id)` still matches the fixture rows.
const asString = (value: unknown): string => {
	if (value === null || value === undefined) return '';
	const text = String(value);
	return text.startsWith(`${USER_ID}-`) ? USER_ID : text;
};

// The subset of PostgREST the dashboard actually uses. Anything not listed simply passes rows through,
// which keeps a story rendering instead of throwing on a filter nobody looks at.
class Query implements PromiseLike<{ data: unknown; error: null; count: number | null }> {
	private rows: Row[];
	private filters: Filter[] = [];
	private limitTo: number | null = null;
	private orderKey: string | null = null;
	private orderAsc = true;
	private single: 'one' | 'maybe' | null = null;
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

	neq(column: string, value: unknown) {
		this.filters.push((row) => asString(row[column]) !== asString(value));
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

	gt(column: string, value: unknown) {
		this.filters.push((row) => asString(row[column]) > asString(value));
		return this;
	}

	lt(column: string, value: unknown) {
		this.filters.push((row) => asString(row[column]) < asString(value));
		return this;
	}

	ilike(column: string, pattern: string) {
		const needle = pattern.replace(/%/g, '').toLowerCase();
		this.filters.push((row) => asString(row[column]).toLowerCase().includes(needle));
		return this;
	}

	not() {
		return this;
	}

	or() {
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

	range(from: number, to: number) {
		this.filters.push(() => true);
		this.limitTo = to - from + 1;
		return this;
	}

	maybeSingle() {
		this.single = 'maybe';
		return this;
	}

	returns() {
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
		if (this.single) return { data: out[0] ?? null, error: null, count };
		return { data: out, error: null, count: this.wantCount ? count : null };
	}

	then<TResult1 = { data: unknown; error: null; count: number | null }, TResult2 = never>(
		onfulfilled?: ((value: { data: unknown; error: null; count: number | null }) => TResult1 | PromiseLike<TResult1>) | null,
		onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
	): PromiseLike<TResult1 | TResult2> {
		return Promise.resolve(this.resolve()).then(onfulfilled, onrejected);
	}
}

// `single()` throws in PostgREST when there is no row; the dashboard only calls it where a row is
// expected, so it behaves like maybeSingle here rather than inventing an error path no screen handles.
Object.assign(Query.prototype, {
	single(this: Query) {
		return (this as unknown as { maybeSingle: () => Query }).maybeSingle();
	},
});

const storageBucket = (bucket: string) => ({
	list: async () => ({ data: STORAGE_FIXTURES[bucket] ?? [], error: null }),
	getPublicUrl: (path: string) => ({ data: { publicUrl: `/media/placeholder.svg#${path}` } }),
	createSignedUrl: async (path: string) => ({ data: { signedUrl: `/media/placeholder.svg#${path}` }, error: null }),
	upload: async () => ({ data: { path: 'storybook/upload' }, error: null }),
	download: async () => ({ data: new Blob([]), error: null }),
	remove: async () => ({ data: [], error: null }),
});

export const getBrowserClient = () => ({
	auth: {
		getSession: async () => ({ data: { session: session() }, error: null }),
		getUser: async () => ({ data: { user: session().user }, error: null }),
		onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
		signOut: async () => ({ error: null }),
		signInWithOAuth: async () => ({ data: null, error: null }),
		exchangeCodeForSession: async () => ({ data: { session: session() }, error: null }),
	},
	from: (table: string) => new Query(table),
	rpc: async (name: string) => ({
		data: name === 'my_permissions' ? PERMISSIONS_BY_ROLE[activeRole] : (RPC_FIXTURES[name] ?? null),
		error: null,
	}),
	storage: { from: storageBucket },
	channel: () => ({ on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }), subscribe: () => ({ unsubscribe: () => {} }) }),
	removeChannel: () => {},
});
