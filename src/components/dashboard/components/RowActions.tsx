import Button from '@/components/basics/Button';
import Menu from '@/components/components/Menu';

export interface RowAction {
	/** Visible label; doubles as the React key, so keep it unique within a row */
	label: string;
	/** Optional leading icon (a name from the icon set) */
	icon?: string;
	/** Activation handler */
	onClick: () => void;
	/** Marks a destructive action (delete, hard-remove) with the danger idiom */
	danger?: boolean;
	/** Stays a visible button instead of folding into the overflow menu */
	pinned?: boolean;
	/** Button variant when pinned (defaults to 'secondary') */
	variant?: 'primary' | 'secondary' | 'ghost';
}

// The full action list as menu items — shared by the overflow dropdown and a row's right-click
// context menu (DataTable's `rowContextMenu`), so both surfaces show every action.
export const RowActionItems = ({ actions }: { actions: RowAction[] }) => (
	<>
		{actions.map((action) => (
			<Menu.Item key={action.label} icon={action.icon} danger={action.danger} onClick={action.onClick}>
				{action.label}
			</Menu.Item>
		))}
	</>
);

interface RowActionsProps {
	/** Every action for the row; `pinned` ones stay buttons, the rest fold into a "⋯" menu */
	actions: RowAction[];
	/** Accessible name for the overflow menu */
	label?: string;
}

// The dashboard row-action pattern: pinned actions stay visible buttons, everything else collapses to
// a "⋯" overflow Menu so a row of ≥3 actions reads as one primary plus an overflow. Pair with
// DataTable's `rowContextMenu` so a right-click on the row opens the same items.
const RowActions = ({ actions, label = 'Meer acties' }: RowActionsProps) => {
	const pinned = actions.filter((action) => action.pinned);
	const overflow = actions.filter((action) => !action.pinned);

	return (
		<span className="row-actions">
			{pinned.map((action) => (
				<Button key={action.label} variant={action.variant ?? 'secondary'} icon={action.icon} onClick={action.onClick}>
					{action.label}
				</Button>
			))}
			{overflow.length > 0 && (
				<Menu label={label} side="bottom" align="end" trigger={<Button variant="ghost" icon="dots" aria-label={label} />}>
					<RowActionItems actions={overflow} />
				</Menu>
			)}
		</span>
	);
};

export default RowActions;
