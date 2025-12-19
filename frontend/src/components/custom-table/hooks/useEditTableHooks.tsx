/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useAppTranslate, useIsMount } from '@/hooks';
import { SORT, type Sort, type TableColumn, type TableData, type TableState } from '@/types';
import { Table, type FormInstance, type FormListFieldData } from 'antd';
import { useResizeHandler } from './useResizeHandler';
import { useTableScroll } from './useTableScroll';
import { isEmpty, maxBy, some } from 'lodash';
import TableSummaryCell from '../components/TableSummaryCell';
import { useContextMenu } from './useContextMenu';
import { useHeaderMenu } from './useHeaderMenu';
import { applyVisibility, collectVisibleDataIndexes } from '../utils';
import { useShowMessage } from '@/hooks/useShowMessage';

export function useEditTableHooks<T>(
	columns: TableColumn<T>[],
	data: T[],
	form: FormInstance,
	formTableName: string,
	headerOffset?: number,
	tableState?: TableState<T>,
	onSortChange?: (sortField: string | undefined, sortType: SORT | undefined) => void,
	onScrollChange?: (event: React.UIEvent<HTMLDivElement, UIEvent>) => void,
) {
	// ===================== 🚀 Hooks & State Setup =====================
	const { t } = useAppTranslate();
	const { showUnsaveChangeMessage } = useShowMessage();
	const isMount = useIsMount();
	const [tableColumn, setTableColumn] = React.useState<TableColumn<T>[]>([]);
	// Master (ordered) columns tree used for show/hide + reordering (includes hidden columns)
	const [allColumnsState, setAllColumnsState] = React.useState<TableColumn<T>[]>(columns);
	const deletedRows = React.useRef<TableData<T>[]>([]);
	const [sort, setSort] = React.useState<Sort | undefined>(tableState?.sort);

	// ===================== 🧹 Unsaved Change Guard =====================
	// Checks procFlag in form list (I/U) and deletedRows ref (D)
	const hasUnsavedTableChange = React.useCallback(() => {
		const currentRows = (form.getFieldValue(formTableName) as Array<TableData<T>>) || [];
		const hasInsertedOrUpdated = some(currentRows, (row) => row?.procFlag && row.procFlag !== 'S');
		const hasDeleted = !isEmpty(deletedRows.current);
		return hasInsertedOrUpdated || hasDeleted;
	}, [form, formTableName]);

	const confirmProceedIfUnsaved = React.useCallback(async () => {
		if (!hasUnsavedTableChange()) return true;

		return await new Promise<boolean>((resolve) => {
			showUnsaveChangeMessage(
				() => resolve(true), // Confirm -> proceed
				() => resolve(false), // Cancel -> do nothing
			);
		});
	}, [hasUnsavedTableChange, showUnsaveChangeMessage]);

	// Sync sort state with tableState.sort when it changes
	React.useEffect(() => {
		if (tableState?.sort !== undefined) {
			setSort(tableState.sort);
		}
	}, [tableState?.sort]);

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
	const tableHeight = useTableScroll([], headerOffset ?? 290);
	const tableWidth = React.useMemo(() => {
		return columns?.reduce(
			(accumulator, currentValue) => accumulator + (currentValue.width as number),
			0,
		);
	}, [columns]);

	// ===================== 📋 Table Columns Setup =====================
	const { makeResizable } = useResizeHandler(tableColumn, setTableColumn, showHeaderMenu);
	const mappedColumns = React.useMemo(() => {
		const resizableColumns = makeResizable(tableColumn);
		return resizableColumns;
	}, [makeResizable, tableColumn]);

	// ===================== 🔄 Sort State Setup =====================
	// Handle sort change (from context menu or table header)
	const handleSortChange = React.useCallback(
		(sortField: string | undefined, sortType: SORT | undefined) => {
			const newSort: Sort | undefined = sortField && sortType ? { sortField, sortType } : undefined;
			setSort(newSort);
			onSortChange?.(sortField, sortType);
		},
		[onSortChange],
	);

	const guardedHandleSortChange = React.useCallback(
		(sortField: string | undefined, sortType: SORT | undefined) => {
			void confirmProceedIfUnsaved().then((ok) => {
				if (!ok) return;
				handleSortChange(sortField, sortType);
			});
		},
		[confirmProceedIfUnsaved, handleSortChange],
	);

	// Apply sort state to columns for sort indicators
	const columnsWithSort = React.useMemo(() => {
		const applySortToColumns = (cols: TableColumn<T>[]): TableColumn<T>[] => {
			return cols.map((col) => {
				if (col.children) {
					return { ...col, children: applySortToColumns(col.children) };
				}

				// If sort is undefined, explicitly clear sortOrder from all columns
				if (!sort || !sort.sortField || !sort.sortType) {
					if (col.sorter) return { ...col, sortOrder: undefined };
					if ('sortOrder' in col && col.sortOrder !== undefined) {
						// eslint-disable-next-line @typescript-eslint/no-unused-vars
						const { sortOrder, ...rest } = col as any;
						return rest as any;
					}
					return col;
				}

				// Apply sort order to the column that matches the sort field
				if (col.dataIndex === sort.sortField && col.sorter) {
					return {
						...col,
						sortOrder:
							sort.sortType === SORT.ASC ? 'ascend' : sort.sortType === SORT.DESC ? 'descend' : undefined,
					} as any;
				}

				// Clear sort order for all other columns
				if ('sortOrder' in col && col.sortOrder !== undefined) {
					// eslint-disable-next-line @typescript-eslint/no-unused-vars
					const { sortOrder, ...rest } = col as any;
					return rest as any;
				}
				return col;
			});
		};

		return applySortToColumns(mappedColumns);
	}, [mappedColumns, sort]);

	// ===================== 🔹 External Refs Setup =====================
	const tableRef = React.useRef<any>(null);
	const fieldsRef = React.useRef<FormListFieldData[]>([]);
	const addRowRef = React.useRef<
		((defaultValue?: Partial<TableData<T>>, index?: number) => void) | null
	>(null);
	const removeRowRef = React.useRef<((index: number | number[]) => void) | null>(null);

	// Update table columns when columns or data change
	React.useEffect(() => {
		if (isMount) {
			setTableColumn(columns);
			setAllColumnsState(columns);
		}
	}, [columns, data, form, isMount, formTableName]);

	// Handle scroll to load more (parity with CustomTable)
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

	// Handle freeze/unfreeze column (same behavior as CustomTable)
	const handleFreezeChange = React.useCallback(
		(dataIndex: string, fixed: 'left' | 'right' | false) => {
			const flattenColumns = (cols: TableColumn<T>[]): string[] => {
				const result: string[] = [];
				cols.forEach((col) => {
					if (col.children) result.push(...flattenColumns(col.children));
					else if (col.dataIndex) result.push(col.dataIndex as string);
				});
				return result;
			};

			const findFrozenColumns = (cols: TableColumn<T>[]): string[] => {
				const result: string[] = [];
				cols.forEach((col) => {
					if (col.children) result.push(...findFrozenColumns(col.children));
					else if (col.dataIndex && (col.fixed === 'left' || col.fixed === 'right')) {
						result.push(col.dataIndex as string);
					}
				});
				return result;
			};

			const allDataIndexes = flattenColumns(tableColumn);
			const selectedIndex = allDataIndexes.indexOf(dataIndex);

			let columnsToUpdate: string[] = [];
			if (fixed === 'right' && selectedIndex !== -1) {
				columnsToUpdate = allDataIndexes.slice(selectedIndex);
			} else if (fixed === 'left' && selectedIndex !== -1) {
				columnsToUpdate = allDataIndexes.slice(0, selectedIndex + 1);
			} else if (fixed === false) {
				columnsToUpdate = findFrozenColumns(tableColumn);
			}

			const updateColumnFreeze = (cols: TableColumn<T>[]): TableColumn<T>[] => {
				return cols.map((col) => {
					if (col.children) {
						return { ...col, children: updateColumnFreeze(col.children) };
					}
					if (col.dataIndex && columnsToUpdate.includes(col.dataIndex as string)) {
						return { ...col, fixed: fixed || undefined };
					}
					return col;
				});
			};

			setTableColumn(updateColumnFreeze(tableColumn));
		},
		[tableColumn],
	);

	// ===================== 🛠️ Tables Utility Setup =====================
	const generateKey = () => {
		const nextKey = (maxBy(fieldsRef.current, 'key')?.key ?? 0) + 1;
		return nextKey;
	};

	const scrollToRow = React.useCallback((rowIndex?: number) => {
		setTimeout(() => {
			if (!tableRef.current || !fieldsRef.current) return;

			if (typeof rowIndex === 'number') {
				// Scroll directly to inserted row
				tableRef.current.scrollTo({ rowIndex });
			} else {
				// Scroll to bottom
				tableRef.current.scrollTo({ index: fieldsRef.current.length - 1 });
			}
		}, 100);
	}, []);

	const renderSummary = React.useCallback((): React.ReactNode | boolean => {
		// Flatten columns (accounting for children)
		const flatCols = mappedColumns.flatMap((col) =>
			col.children && col.children.length > 0 ? col.children : [col],
		);

		if (tableState?.rowSelection) {
			flatCols.unshift({ dataIndex: 'checkbox' });
		}

		if (!some(flatCols, 'summary')) return false;

		return (
			<Table.Summary fixed>
				<Table.Summary.Row>
					{flatCols.map((col, i) => (
						<TableSummaryCell
							key={i}
							cellKey={i}
							formTableName={formTableName}
							dataIndex={col.dataIndex as string}
							summary={col.summary}
							valueType={col.valueType}
							align={col.align}
							form={form}
						/>
					))}
				</Table.Summary.Row>
			</Table.Summary>
		);
	}, [form, formTableName, mappedColumns, tableState]);

	return {
		t,
		tableRef,
		fieldsRef,
		addRowRef,
		removeRowRef,
		tableHeight: isNaN(tableHeight!) ? 120 : tableHeight,
		tableWidth: isNaN(tableWidth!) ? 120 : tableWidth,
		tableColumn,
		allColumnsState,
		mappedColumns,
		columnsWithSort,
		deletedRows,
		sort,
		hasUnsavedTableChange,
		confirmProceedIfUnsaved,
		isOpenMenu,
		menuPosition,
		selectedMenuRecord,
		isOpenHeaderMenu,
		headerMenuPosition,
		selectedHeaderColumn,
		showMenu,
		hideMenu,
		showHeaderMenu,
		hideHeaderMenu,
		setTableColumn,
		setAllColumnsState,
		scrollToRow,
		generateKey,
		renderSummary,
		handleSortChange,
		guardedHandleSortChange,
		handleScroll,
		handleColumnVisibilityChange,
		handleColumnsReorder,
		handleFreezeChange,
	};
}
