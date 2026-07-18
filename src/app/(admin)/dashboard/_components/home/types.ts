import type { Session } from '@supabase/supabase-js';

// Every home widget receives the live session so personal widgets can scope their own reads
// (owner_user_id / assigned_user_id); org widgets ignore it and lean on RLS to scope the rows.
export interface WidgetProps {
	session: Session;
}
