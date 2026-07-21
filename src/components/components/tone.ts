// Semantic colouring shared by every fact component: neutral carries no meaning, the other three map
// onto the --status-* tokens. Keep this the single source so a tone means the same thing everywhere.
export type Tone = 'neutral' | 'positive' | 'warning' | 'negative';
