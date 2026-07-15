'use client';

import type { ChangeEvent, ReactNode, Ref } from 'react';

import Icon from '@/components/basics/Icon';
import Interactive from '@/components/basics/Interactive';
import Pill from '@/components/basics/Pill';
import VisuallyHidden from '@/components/basics/VisuallyHidden';
import { classNames } from '@/lib/classNames';
import type { FilterBarProps as FilterBarSchemaProps } from '@/lib/content/schema/components/filterBar';

export interface FilterBarProps extends FilterBarSchemaProps {
	/** Fires with the next filter value when a chip is selected */
	onValueChange?: (value: string) => void;
	/** Fires with the next sort value */
	onSortChange?: (value: string) => void;
	/** Fires with the search query on every keystroke */
	onSearchValueChange?: (value: string) => void;
	/** Fires when the reset button is pressed */
	onReset?: () => void;
	/** Extra controls rendered after the built-in ones */
	children?: ReactNode;
}

// A fully controlled filter toolbar: filter chips (a group of toggle Pills), an optional search
// input, a native sort <select> and a reset button. It owns no state — the parent reflects the
// values (e.g. to searchParams) and passes them back down. A small client island because the inputs
// fire change handlers; the surrounding page stays a Server Component.
const FilterBar = ({
	filters,
	value,
	sortOptions,
	sortValue,
	searchable = false,
	searchValue,
	resettable = false,
	searchPlaceholder = 'Search…',
	searchLabel = 'Search',
	sortLabel = 'Sort',
	resetLabel = 'Reset',
	label = 'Filters',
	onValueChange,
	onSortChange,
	onSearchValueChange,
	onReset,
	className,
	children,
	ref,
}: FilterBarProps & { ref?: Ref<HTMLDivElement> }) => {
	const handleSearch = (event: ChangeEvent<HTMLInputElement>) => onSearchValueChange?.(event.target.value);
	const handleSort = (event: ChangeEvent<HTMLSelectElement>) => onSortChange?.(event.target.value);

	return (
		<div ref={ref} className={classNames('filter-bar', className)}>
			<div className="chips" role="group" aria-label={label}>
				{filters.map((filter) => {
					const isActive = filter.value === value;

					return (
						<Pill
							key={filter.value}
							className="chip"
							active={isActive}
							aria-pressed={isActive}
							onClick={() => onValueChange?.(filter.value)}
						>
							{filter.label}
						</Pill>
					);
				})}
			</div>

			<div className="tools">
				{searchable && (
					<label className="search">
						<Icon name="search" className='filter-bar-search-icon' />
						<VisuallyHidden>{searchLabel}</VisuallyHidden>
						<input
							type="search"
							className="search-input"
							placeholder={searchPlaceholder}
							value={searchValue ?? ''}
							onChange={handleSearch}
						/>
					</label>
				)}

				{sortOptions && sortOptions.length > 0 && (
					<label className="sort">
						<VisuallyHidden>{sortLabel}</VisuallyHidden>
						<select className="sort-select" value={sortValue ?? ''} onChange={handleSort} aria-label={sortLabel}>
							{sortOptions.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
						<Icon name="chevron-down" className="sort-icon" />
					</label>
				)}

				{children}

				{resettable && (
					<Interactive className="reset" onClick={() => onReset?.()}>
						{resetLabel}
					</Interactive>
				)}
			</div>
		</div>
	);
};

export default FilterBar;
