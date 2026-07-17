export type WarnColor = 'yellow' | 'red';
export type LinkStatus = 'suspected' | 'confirmed' | 'rejected';
export type BanScope = 'discord' | 'convention' | 'site';

export const WARN_COLOR_LABELS: Record<WarnColor, string> = { yellow: 'Geel', red: 'Rood' };
export const WARN_COLOR_OPTIONS = (Object.entries(WARN_COLOR_LABELS) as [WarnColor, string][]).map(([value, label]) => ({ value, label }));

export const LINK_STATUS_LABELS: Record<LinkStatus, string> = { suspected: 'Vermoed', confirmed: 'Bevestigd', rejected: 'Afgewezen' };
export const LINK_STATUS_OPTIONS = (Object.entries(LINK_STATUS_LABELS) as [LinkStatus, string][]).map(([value, label]) => ({ value, label }));

export const BAN_SCOPE_LABELS: Record<BanScope, string> = { discord: 'Discord', convention: 'Conventie', site: 'Site' };
export const BAN_SCOPE_OPTIONS = (Object.entries(BAN_SCOPE_LABELS) as [BanScope, string][]).map(([value, label]) => ({ value, label }));

export interface Subject {
	id: string;
	discord_id: string | null;
	discord_name: string | null;
	user_id: string | null;
	merged_into: string | null;
	created_at: string;
}
export interface Warning {
	id: string;
	subject_id: string;
	color: WarnColor;
	reason: string;
	issued_at: string;
	issued_by: string | null;
	removed_at: string | null;
}
export interface Evidence {
	id: string;
	kind: string;
	storage_path: string | null;
	url: string | null;
	body: string | null;
}
export interface ModNote {
	id: string;
	body: string;
	created_at: string;
	created_by: string | null;
	archived_at: string | null;
}
export interface SubjectLink {
	id: string;
	subject_low: string;
	subject_high: string;
	status: LinkStatus;
	reason: string | null;
	created_at: string;
}
export interface Ban {
	id: string;
	subject_id: string;
	scope: BanScope;
	reason: string;
	issued_at: string;
	expires_at: string | null;
	lifted_at: string | null;
}
export interface Alias {
	id: number;
	alias: string;
	kind: string | null;
	source: string | null;
	last_seen: string;
}
export interface ConductNote {
	id: string;
	kind: string;
	body: string | null;
	event_id: string | null;
	created_at: string;
}
