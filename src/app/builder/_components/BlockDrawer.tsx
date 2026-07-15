'use client';

import { createUsePuck, Drawer } from '@puckeditor/core';
import { useEffect, useState } from 'react';

import { dispatchRef, setPendingPreset } from '@/app/builder/_components/presetBridge';
import { config } from '@/lib/puck/config';
import { presets } from '@/lib/puck/presets';

// The component drawer, extended with story variants: expanding a block lists its Storybook
// presets, and dragging a preset inserts the block WITH that story's data (via presetBridge).

const usePuck = createUsePuck();

interface DrawerGroup {
	title: string;
	types: string[];
}

const drawerGroups = (): DrawerGroup[] => {
	const categorised = new Set<string>();
	const groups: DrawerGroup[] = [];

	for (const category of Object.values(config.categories ?? {})) {
		const types = (category.components ?? []) as string[];
		types.forEach((type) => categorised.add(type));
		if (types.length) {
			groups.push({ title: category.title ?? 'Overig', types });
		}
	}

	const leftovers = Object.keys(config.components).filter((type) => !categorised.has(type));
	if (leftovers.length) {
		groups.push({ title: 'Overig', types: leftovers });
	}

	return groups;
};

const BlockDrawer = () => {
	const dispatch = usePuck((s) => s.dispatch);
	const [expanded, setExpanded] = useState<Record<string, boolean>>({});

	// Register dispatch for the editor's onAction preset hand-off (see presetBridge).
	useEffect(() => {
		dispatchRef.current = dispatch;
		return () => {
			dispatchRef.current = null;
		};
	}, [dispatch]);

	return (
		<div className="builder-drawer">
			<Drawer>
				{drawerGroups().map((group) => (
					<section key={group.title} className="builder-drawer-group">
						<h3>{group.title}</h3>
						{group.types.map((type) => {
							const variants = presets[type as keyof typeof presets] ?? [];
							const isOpen = expanded[type] ?? false;

							return (
								<div key={type} className="builder-drawer-block">
									<div className="builder-drawer-row">
										<Drawer.Item name={type} id={type} />
										{variants.length > 1 && (
											<button
												type="button"
												className="builder-drawer-toggle"
												aria-expanded={isOpen}
												title={`Varianten van ${type}`}
												onClick={() => setExpanded((state) => ({ ...state, [type]: !isOpen }))}
											>
												{isOpen ? '−' : '+'}
											</button>
										)}
									</div>
									{isOpen && (
										<div className="builder-drawer-variants">
											{variants.map((variant) => (
												<div
													key={variant.label}
													onPointerDown={() => setPendingPreset(type, variant.props)}
												>
													<Drawer.Item name={type} id={`${type}::${variant.label}`} label={variant.label} />
												</div>
											))}
										</div>
									)}
								</div>
							);
						})}
					</section>
				))}
			</Drawer>
		</div>
	);
};

export default BlockDrawer;
