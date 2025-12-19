/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useAppTranslate, useDebounce, useIsMount } from '@/hooks';
import { type DynamicFilterDto, type TableColumn, type Sort, SORT } from '@/types';
import { useResizeHandler } from './useResizeHandler';
import { useTableScroll } from './useTableScroll';
import { applyVisibility, collectVisibleDataIndexes, toDynamicFilterList } from '../utils';
import { useContextMenu } from './useContextMenu';
import { useHeaderMenu } from './useHeaderMenu';
import { useFullscreen } from './useFullScreen';

export function useTableHooks<T>(
	columns: TableColumn<T>[],
	data: T[],
	headerOffset?: number,
	isTree?: boolean,
	tableStateSort?: Sort | undefined,
	onFilterTableChange?: (filterList: DynamicFilterDto[]) => void,
	onSortChange?: (sortField: string | undefined, sortType: SORT | undefined) => void,
	onScrollChange?: (event: React.UIEvent<HTMLDivElement, UIEvent>) => void,
) {
	// ===================== 🚀 Hooks & State Setup =====================
	const [expandedKeys, setExpandedKeys] = React.useState<React.Key[]>([]);
	const { t } = useAppTranslate();
	const isMount = useIsMount();
	const [tableColumn, setTableColumn] = React.useState<TableColumn<T>[]>([]);
	// Master (ordered) columns tree used for show/hide + reordering (includes hidden columns)
	const [allColumnsState, setAllColumnsState] = React.useState<TableColumn<T>[]>(columns);
	const infiniteLoadingRef = React.useRef(false);
	const [sort, setSort] = React.useState<Sort | undefined>(tableStateSort);

	// Sync sort state with tableState.sort when it changes
	React.useEffect(() => {
		if (tableStateSort !== undefined) {
			setSort(tableStateSort);
		}
	}, [tableStateSort]);

	// ===================== 📊 Full Screen Hooks Setup =====================
	const { containerRef, isFullscreen, toggleFullscreen } = useFullscreen();

	// ===================== 📊 Table Context Menu Setup =====================
	const {
		isOpen: isOpenMenu,
		position: menuPosition,
		record: selectedMenuRecord,
		showMenu,
		hideMenu,
	} = useContextMenu();

	// ===================== 📊 Header Context Menu Setup =====================
	const {
		isOpen: isOpenHeaderMenu,
		position: headerMenuPosition,
		column: selectedHeaderColumn,
		showMenu: showHeaderMenu,
		hideMenu: hideHeaderMenu,
	} = useHeaderMenu<T>();

	// ===================== 📏 Table Size Setup =====================
	const tableHeight = useTableScroll([], headerOffset ?? 290, isFullscreen);
	const tableWidth = React.useMemo(() => {
		return columns?.reduce(
			(accumulator, currentValue) => accumulator + (currentValue.width as number),
			0,
		);
	}, [columns]);

	// ===================== 📋 Filter Table Events Setup =====================
	const handleFilterFormChange = useDebounce((_changedValues, allValues) => {
		const filterValue = toDynamicFilterList(allValues);
		onFilterTableChange?.(filterValue);
	});

	// ===================== 🔄 Sort State Setup =====================
	// Handle sort change (from context menu or table header)
	const handleSortChange = React.useCallback(
		(sortField: string | undefined, sortType: SORT | undefined) => {
			const newSort: Sort | undefined = sortField && sortType
				? { sortField, sortType }
				: undefined;
			setSort(newSort);
			onSortChange?.(sortField, sortType);
		},
		[onSortChange],
	);

	// ===================== 📋 Table Columns Setup =====================
	const { makeResizable } = useResizeHandler(tableColumn, setTableColumn, showHeaderMenu);
	const mappedColumns = React.useMemo(() => {
		const resizableColumns = makeResizable(
			tableColumn.map((col) => ({
				...col,
				filterProps: {
					...col.filterProps,
					onFilterTableChange: handleFilterFormChange,
				},
			})),
		);
		return resizableColumns;
	}, [makeResizable, tableColumn]);

	// Apply sort state to columns for sort indicators
	const columnsWithSort = React.useMemo(() => {
		const applySortToColumns = (cols: TableColumn<T>[]): TableColumn<T>[] => {
			return cols.map((col) => {
				if (col.children) {
					return {
						...col,
						children: applySortToColumns(col.children),
					};
				}
				// If sort is undefined, explicitly clear sortOrder from all columns
				if (!sort || !sort.sortField || !sort.sortType) {
					// For sortable columns, explicitly set sortOrder to undefined to clear the indicator
					if (col.sorter) {
						return { ...col, sortOrder: undefined };
					}
					// For non-sortable columns, remove sortOrder if it exists
					if ('sortOrder' in col && col.sortOrder !== undefined) {
						const { sortOrder, ...rest } = col;
						return rest;
					}
					return col;
				}
				// Apply sort order to the column that matches the sort field
				if (col.dataIndex === sort.sortField && col.sorter) {
					return {
						...col,
						sortOrder:
							sort.sortType === SORT.ASC ? 'ascend' : sort.sortType === SORT.DESC ? 'descend' : undefined,
					};
				}
				// Clear sort order for all other columns (remove sortOrder property)
				if ('sortOrder' in col && col.sortOrder !== undefined) {
					const { sortOrder, ...rest } = col;
					return rest;
				}
				return col;
			});
		};

		return applySortToColumns(mappedColumns);
	}, [mappedColumns, sort]);

	const flattenKeys = React.useCallback((nodes: any[], isRoot: boolean) => {
		let keys: React.Key[] = [];
		nodes.forEach((node, index) => {
			keys.push(isRoot ? index : node.key);
			if (node.children) {
				keys = keys.concat(flattenKeys(node.children, false));
			}
		});
		return keys;
	}, []);

	React.useEffect(() => {
		if (isTree && data) {
			setExpandedKeys(flattenKeys(data, true));
		}
	}, [data, flattenKeys, isTree]);

	// Update table columns when columns or data change
	React.useEffect(() => {
		if (isMount) {
			setTableColumn(columns);
			setAllColumnsState(columns);
		}
	}, [columns, data, flattenKeys, isMount]);

	// Handle scroll to load more
	const handleScroll = React.useCallback(
		(e: React.UIEvent<HTMLDivElement>) => {
			const threshold = 10; // pixels from bottom
			const target = e.currentTarget;
			const bottom = target.scrollHeight - target.scrollTop - target.clientHeight < threshold;
			if (bottom) {
				onScrollChange?.(e);
			}
		},
		[onScrollChange],
	);

	// Handle column visibility change
	const handleColumnVisibilityChange = React.useCallback(
		(dataIndex: string, visible: boolean) => {
			// Column visibility is driven by a "visible leaf set".
			// Always rebuild the visible columns tree from the master ordered tree (`allColumnsState`).
			// This fixes nested/grouped columns where hiding the last child removes the whole group
			// and makes it impossible to show again.
			const nextVisibleSet = collectVisibleDataIndexes(tableColumn);
			if (visible) nextVisibleSet.add(dataIndex);
			else nextVisibleSet.delete(dataIndex);
			setTableColumn(applyVisibility(allColumnsState, nextVisibleSet));
		},
		[allColumnsState, tableColumn],
	);

	const handleColumnsReorder = React.useCallback(
		(nextAllColumns: TableColumn<T>[]) => {
			setAllColumnsState(nextAllColumns);
			const visibleSet = collectVisibleDataIndexes(tableColumn);
			setTableColumn(applyVisibility(nextAllColumns, visibleSet));
		},
		[tableColumn],
	);

	// Handle freeze/unfreeze column
	const handleFreezeChange = React.useCallback(
		(dataIndex: string, fixed: 'left' | 'right' | false) => {
			// Helper function to flatten columns and get all dataIndexes in order
			const flattenColumns = (cols: TableColumn<T>[]): string[] => {
				const result: string[] = [];
				cols.forEach((col) => {
					if (col.children) {
						result.push(...flattenColumns(col.children));
					} else if (col.dataIndex) {
						result.push(col.dataIndex as string);
					}
				});
				return result;
			};

			// Helper function to find all frozen columns (both left and right)
			const findFrozenColumns = (cols: TableColumn<T>[]): string[] => {
				const result: string[] = [];
				cols.forEach((col) => {
					if (col.children) {
						result.push(...findFrozenColumns(col.children));
					} else if (col.dataIndex && (col.fixed === 'left' || col.fixed === 'right')) {
						result.push(col.dataIndex as string);
					}
				});
				return result;
			};

			// Get all column dataIndexes in order
			const allDataIndexes = flattenColumns(tableColumn);
			const selectedIndex = allDataIndexes.indexOf(dataIndex);

			// Determine which columns to freeze/unfreeze based on the direction
			let columnsToUpdate: string[] = [];
			if (fixed === 'right' && selectedIndex !== -1) {
				// Freeze selected column and all columns to the right (from selectedIndex to end)
				columnsToUpdate = allDataIndexes.slice(selectedIndex);
			} else if (fixed === 'left' && selectedIndex !== -1) {
				// Freeze selected column and all columns to the left (from start to selectedIndex + 1)
				columnsToUpdate = allDataIndexes.slice(0, selectedIndex + 1);
			} else if (fixed === false) {
				// Unfreeze: reset all frozen columns (both left and right) back to normal
				columnsToUpdate = findFrozenColumns(tableColumn);
			}

			const updateColumnFreeze = (cols: TableColumn<T>[]): TableColumn<T>[] => {
				return cols.map((col) => {
					if (col.children) {
						return {
							...col,
							children: updateColumnFreeze(col.children),
						};
					}
					if (col.dataIndex && columnsToUpdate.includes(col.dataIndex as string)) {
						return {
							...col,
							fixed: fixed || undefined,
						};
					}
					return col;
				});
			};

			const updatedColumns = updateColumnFreeze(tableColumn);
			setTableColumn(updatedColumns);
		},
		[tableColumn],
	);

	return {
		t,
		tableHeight: isNaN(tableHeight!) ? 120 : tableHeight,
		tableWidth: isNaN(tableWidth!) ? 120 : tableWidth,
		mappedColumns,
		columnsWithSort,
		tableColumn,
		allColumnsState,
		expandedKeys,
		isOpenMenu,
		menuPosition,
		selectedMenuRecord,
		isOpenHeaderMenu,
		headerMenuPosition,
		selectedHeaderColumn,
		containerRef,
		isFullscreen,
		infiniteLoadingRef,
		sort,
		setExpandedKeys,
		setTableColumn,
		setAllColumnsState,
		handleFilterFormChange,
		showMenu,
		hideMenu,
		showHeaderMenu,
		hideHeaderMenu,
		toggleFullscreen,
		handleSortChange,
		handleScroll,
		handleColumnVisibilityChange,
		handleColumnsReorder,
		handleFreezeChange,
	};
}
