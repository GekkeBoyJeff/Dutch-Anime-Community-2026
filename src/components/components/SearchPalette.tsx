'use client';

import { Command } from 'cmdk';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';

import Content from '@/components/basics/Content';
import Icon from '@/components/basics/Icon';
import Shortcut from '@/components/basics/Shortcut';
import useHotkey from '@/hooks/useHotkey';
import useOverlay from '@/hooks/useOverlay';
import { classNames } from '@/lib/shared/classNames';
import type {
	SearchPaletteItem,
	SearchPaletteOverlayProps as SearchPaletteSchemaProps,
} from '@/lib/site/content/schema/components/searchPalette';

type SearchPaletteProps = SearchPaletteSchemaProps;

// Preserves the caller's category order, then first-seen order for the rest. Relies on Map keeping
// insertion order: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map
const groupItems = (
	items: SearchPaletteItem[],
	categories: string[],
	fallbackCategory: string,
): [string, SearchPaletteItem[]][] => {
	const groups = new Map<string, SearchPaletteItem[]>();

	for (const preset of categories) {
		groups.set(preset, []);
	}

	for (const item of items) {
		const key = item.category ?? fallbackCategory;
		const bucket = groups.get(key);

		if (bucket) {
			bucket.push(item);
		} else {
			groups.set(key, [item]);
		}
	}

	return [...groups.entries()].filter(([, bucket]) => bucket.length > 0);
};

const SearchPalette = ({
	open,
	items,
	categories = [],
	fallbackCategory = 'Other',
	placeholder = 'Type a command or search…',
	emptyLabel = 'No results found.',
	selectHint = 'to select',
	onClose,
	className,
}: SearchPaletteProps) => {
	const router = useRouter();
	const [internalOpen, setInternalOpen] = useState(false);
	const isControlled = open !== undefined;
	const isOpen = isControlled ? open : internalOpen;

	const close = useCallback(() => {
		if (!isControlled) {
			setInternalOpen(false);
		}
		onClose?.();
	}, [isControlled, onClose]);

	useHotkey('mod+k', () => {
		if (!isControlled) {
			setInternalOpen((value) => !value);
		}
	});

	useOverlay(isOpen, close);

	const handleSelect = (item: SearchPaletteItem) => {
		if (item.url) {
			router.push(item.url);
		}
		close();
	};

	if (!isOpen) {
		return null;
	}

	const grouped = groupItems(items, categories, fallbackCategory);

	return (
		<div className="search-palette-overlay" onClick={close}>
			<Command
				label={placeholder}
				className={classNames('search-palette', className)}
				onClick={(event) => event.stopPropagation()}
			>
				<div className="search-palette-field">
					<Icon name="search" className="search-palette-search-icon" />
					<Command.Input className="search-palette-input" placeholder={placeholder} autoFocus />
				</div>

				<Command.List className="search-palette-list">
					<Command.Empty className="search-palette-empty">{emptyLabel}</Command.Empty>

					{grouped.map(([category, bucket]) => (
						<Command.Group key={category} heading={category} className="search-palette-group">
							{bucket.map((item) => (
								<Command.Item
									key={item.id}
									value={`${item.label} ${item.hint ?? ''}`}
									className="search-palette-item"
									onSelect={() => handleSelect(item)}
								>
									{item.icon && <Icon name={item.icon} className="search-palette-item-icon" />}
									<Content element="span" className="search-palette-item-label" value={item.label} />
									{item.hint && <Content element="span" className="search-palette-item-hint" value={item.hint} />}
								</Command.Item>
							))}
						</Command.Group>
					))}
				</Command.List>

				<footer className="search-palette-footer">
					<span className="search-palette-foot">
						<Shortcut keys={['↑']} />
						<Shortcut keys={['↓']} />
						to navigate
					</span>
					<span className="search-palette-foot">
						<Shortcut keys={['↵']} />
						{selectHint}
					</span>
					<span className="search-palette-foot">
						<Shortcut keys={['esc']} />
						to close
					</span>
				</footer>
			</Command>
		</div>
	);
};

export default SearchPalette;
