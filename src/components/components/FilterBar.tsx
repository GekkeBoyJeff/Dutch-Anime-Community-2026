'use client';

import type { ChangeEvent } from 'react';

import Icon from '@/components/basics/Icon';
import Interactive from '@/components/basics/Interactive';
import Pill from '@/components/basics/Pill';
import VisuallyHidden from '@/components/basics/VisuallyHidden';
import { classNames } from '@/lib/shared/classNames';
import type { FilterBarProps as FilterBarSchemaProps } from '@/lib/site/content/schema/components/filterBar';

export type FilterBarProps = FilterBarSchemaProps;

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
	ariaLabel = 'Filters',
	filterIcon,
	onValueChange,
	onSortChange,
	onSearchValueChange,
	onReset,
	className,
	children,
}: FilterBarProps) => {
	const handleSearch = (event: ChangeEvent<HTMLInputElement>) => onSearchValueChange?.(event.target.value);
	const handleSort = (event: ChangeEvent<HTMLSelectElement>) => onSortChange?.(event.target.value);

	return (
		<div className={classNames('filter-bar', className)}>
			{filters.length > 0 && (
			<div className="filter-bar-chips" role="group" aria-label={ariaLabel}>
				{filterIcon && <Icon name={filterIcon} className="filter-bar-chips-lead" />}
				{filters.map((filter) => {
					const isActive = filter.value === value;

					return (
						<Pill
							key={filter.value}
							className="filter-bar-chip"
							value={filter.label}
							count={filter.count}
							active={isActive}
							ariaPressed={isActive}
							onClick={() => onValueChange?.(filter.value)}
						/>
					);
				})}
			</div>
			)}

			<div className="filter-bar-tools">
				{searchable && (
					<label className="filter-bar-search">
						<Icon name="search" className='filter-bar-search-icon' />
						<VisuallyHidden value={searchLabel} />
						<input
							type="search"
							className="filter-bar-search-input"
							placeholder={searchPlaceholder}
							value={searchValue ?? ''}
							onChange={handleSearch}
						/>
					</label>
				)}

				{sortOptions && sortOptions.length > 0 && (
					<label className="filter-bar-sort">
						<VisuallyHidden value={sortLabel} />
						<select className="filter-bar-sort-select" value={sortValue ?? ''} onChange={handleSort} aria-label={sortLabel}>
							{sortOptions.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
						<Icon name="chevron-down" className="filter-bar-sort-icon" />
					</label>
				)}

				{children}

				{resettable && (
					<Interactive className="filter-bar-reset" onClick={() => onReset?.()}>
						{resetLabel}
					</Interactive>
				)}
			</div>
		</div>
	);
};

export default FilterBar;
