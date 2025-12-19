/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
	AGGERATE_TYPE,
	SORT,
	TABLE_ACTIONS,
	type DynamicFilterDto,
	type Pagination,
	type TableColumn,
	type TableData,
	type TableExtra,
	type TableFilter,
	type TableSort,
	type TableState,
} from '@/types';
import { ConfigProvider, Empty, Form, Table, type CheckboxProps, type FormInstance } from 'antd';
import styled from 'styled-components';
import styles from './CustomTable.module.scss';
import { DEFAULT_PAGE_OPTIONS, DEFAULT_TABLE_STATE } from '@/constants/table';
import { useTableHooks } from './hooks';
import { TableHeader } from './components/TableHeader';
import { isEmpty, some } from 'lodash';
import { aggregate } from './utils/aggerate';
import { formatNumberAmount } from '@/utils/helper';
import { DragDropTableContextProvider, TableContextMenu, ContextHeaderMenu } from './components';

export type CustomTableProps<T> = {
	columns: TableColumn<T>[];
	data: TableData<T>[];
	tableFilterForm?: FormInstance;
	tableState: TableState<T>;
	headerOffset?: number;
	loading?: boolean;
	autoPagination?: boolean;
	noFooter?: boolean;
	scroll?: { x: number | true | 'max-content' | 'min-content'; y: number };
	isTree?: boolean;
	isSelectStrict?: boolean;
	virtual?: boolean;
	rowSelectionType?: 'radio' | 'checkbox',
	exportFileName?: string,
	contextMenu?: {
		onRefresh?: (filterForm?: FormInstance) => void;
		onExport?: (dataSource: readonly TableData<T>[], columns: TableColumn<TableData<T>>[], summary: (data: readonly TableData<T>[]) => React.ReactNode | boolean) => void;
		onFullScreen?: (toggleFullScreen: () => void) => void
	},
	onScrollChange?: (event: React.UIEvent<HTMLDivElement, UIEvent>) => void;
	onSelectChange?: (selectedRowKeys: React.Key[], selectedRows: TableData<T>[]) => void;
	onPaginationChange?: (current: number, pageSize: number) => void;
	onSortChange?: (sortField: string | undefined, sortType: SORT | undefined) => void;
	onRowClick?: (record: TableData<T>, rowIndex: number) => void;
	onRowDoubleClick?: (record: TableData<T>, rowIndex: number) => void;
	onFilterTableChange?: (filterValue: DynamicFilterDto[]) => void;
	getCheckboxProps?: (record: T) => Partial<Omit<CheckboxProps, 'checked' | 'defaultChecked'>>;
};

const CustomTable = <T,>({
	columns,
	data,
	tableFilterForm,
	tableState = DEFAULT_TABLE_STATE,
	loading = false,
	autoPagination = false,
	headerOffset = 290,
	noFooter = false,
	scroll,
	isTree,
	isSelectStrict,
	virtual,
	rowSelectionType = 'checkbox',
	exportFileName,
	contextMenu,
	onSelectChange,
	onPaginationChange,
	onSortChange,
	onRowClick,
	onFilterTableChange,
	onScrollChange,
	onRowDoubleClick,
	getCheckboxProps,
}: CustomTableProps<T>) => {
	const { pagination, rowSelection, sort: tableStateSort } = tableState;

	const {
		t,
		tableHeight,
		tableWidth,
		mappedColumns,
		columnsWithSort,
		expandedKeys,
		menuPosition,
		isOpenMenu,
		selectedMenuRecord,
		isOpenHeaderMenu,
		headerMenuPosition,
		selectedHeaderColumn,
		containerRef,
		isFullscreen,
		setTableColumn,
		setAllColumnsState,
		setExpandedKeys,
		handleFilterFormChange,
		showMenu,
		hideMenu,
		hideHeaderMenu,
		toggleFullscreen,
		sort,
		handleSortChange,
		allColumnsState,
		handleScroll,
		handleColumnVisibilityChange,
		handleColumnsReorder,
		handleFreezeChange,
	} = useTableHooks<T>(
		columns,
		data,
		headerOffset,
		isTree,
		tableStateSort,
		onFilterTableChange,
		onSortChange,
		onScrollChange,
	);

	// Pagination Options
	const paginationOptions = React.useMemo(() => {
		if (pagination) {
			return {
				...DEFAULT_PAGE_OPTIONS,
				...pagination,
			};
		} else if (autoPagination) {
			return {
				...DEFAULT_PAGE_OPTIONS,
			};
		}
		return false;
	}, [pagination, autoPagination]);

	// Row Selection Options
	const rowSelectionOptions = React.useMemo(() => {
		if (rowSelection) {
			return {
				selectedRowKeys: rowSelection.map((item) => item.key),
				onChange: onSelectChange,
				getCheckboxProps: getCheckboxProps,
				checkStrictly: isSelectStrict,
				type: rowSelectionType
			};
		}
		return undefined;
	}, [rowSelection, onSelectChange, isSelectStrict, getCheckboxProps]);

	// Render Summary Footer
	const renderSummary = React.useCallback(
		(data: readonly TableData<T>[]): React.ReactNode | boolean => {
			// Flatten columns (accounting for children)
			const flatCols = mappedColumns.flatMap((col) =>
				col.children && col.children.length > 0 ? col.children : [col],
			);

			if (rowSelection) {
				flatCols.unshift({ dataIndex: 'checkbox' });
			}

			if (!some(flatCols, 'summary')) return false;

			return (
				<Table.Summary fixed>
					<Table.Summary.Row>
						{flatCols.map(({ valueType, summary, align, dataIndex }, i) => {
							let content;
							if (typeof summary === 'function') content = summary();
							else if (isEmpty(summary)) content = <></>;
							else if (Object.values(AGGERATE_TYPE).includes(summary!)) {
								content = aggregate(data as T[], dataIndex as any, summary as AGGERATE_TYPE);
								if (valueType === 'amount' && typeof content === 'number') {
									content = formatNumberAmount(content);
								}
							}
							return (
								<Table.Summary.Cell key={i} index={i} align={align}>
									{content}
								</Table.Summary.Cell>
							);
						})}
					</Table.Summary.Row>
				</Table.Summary>
			);
		},
		[mappedColumns, rowSelection],
	);

	// On-Change Handler
	const onTableChange = (
		pagination: Pagination,
		_filter: TableFilter,
		sorter: TableSort,
		extra: TableExtra<T>,
	) => {
		switch (extra.action) {
			case TABLE_ACTIONS.PAGINATE:
				if (!autoPagination) {
					onPaginationChange?.(pagination.current, pagination.pageSize);
				}
				break;
			case TABLE_ACTIONS.SORT:
				handleSortChange(
					sorter.field as string,
					sorter.order == 'ascend' ? SORT.ASC : sorter.order == 'descend' ? SORT.DESC : undefined,
				);
				break;
			case TABLE_ACTIONS.FILTER:
				break;
		}
	};

	// Render Table
	return (
		<ConfigProvider renderEmpty={() => <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('No Data')} />}>
			<WrapperTable ref={containerRef} style={{ padding: isFullscreen ? 32 : 0 }}>
				<Form form={tableFilterForm} onValuesChange={handleFilterFormChange}>
					<DragDropTableContextProvider columns={mappedColumns} setColumns={setTableColumn}>
						<Table<TableData<T>>
							bordered
							size="small"
							loading={loading}
							virtual={virtual}
							className={styles.tableCustom}
							columns={columnsWithSort as any}
							dataSource={data.map((item, index) => ({
								...item,
								key: index,
							}))}
							rowSelection={rowSelectionOptions}
							scroll={scroll ?? { x: tableWidth, y: tableHeight }}
							style={{
								paddingBottom: noFooter ? 0 : !paginationOptions || data.length == 0 ? 45 : 0,
								whiteSpace: 'pre',
							}}
							pagination={paginationOptions}
							components={{
								header: {
									cell: TableHeader,
								},
							}}
							onChange={onTableChange as any}
							summary={renderSummary}
							expandable={{
								expandedRowKeys: expandedKeys,
								onExpandedRowsChange: setExpandedKeys as any,
							}}
							onRow={(record, rowIndex) => {
								return {
									onClick: () => {
										onRowClick?.(record, rowIndex!);
									},
									onDoubleClick: () => {
										onRowDoubleClick?.(record, rowIndex!);
									},
									onContextMenu: (e) => {
										showMenu(e, record);
									},
								};
							}}
							onScroll={handleScroll}
						/>
						{noFooter ? (
							<></>
						) : (
							<CountItems
								style={{
									position: isFullscreen ? 'relative' : 'absolute',
									float: isFullscreen ? 'right' : 'none',
									bottom: isFullscreen ? 40 : data.length == 0 ? 12 : paginationOptions ? 18 : 12,
								}}
							>
								Total: {pagination?.total || data.length || 0} item&#40;s&#41;
							</CountItems>
						)}
					</DragDropTableContextProvider>

					<TableContextMenu
						isOpen={isOpenMenu}
						toggleFullScreen={toggleFullscreen}
						position={menuPosition}
						hideMenu={hideMenu}
						record={selectedMenuRecord}
						selectedRows={rowSelection}
						dataSource={data.map((item, index) => ({
							...item,
							key: index,
						}))}
						columns={mappedColumns}
						summary={renderSummary}
						exportFileName={exportFileName || 'data'}
						isTree={isTree}
						contextMenu={contextMenu}
					/>

					<ContextHeaderMenu
						isOpen={isOpenHeaderMenu}
						position={headerMenuPosition}
						column={selectedHeaderColumn}
						columns={mappedColumns}
						allColumns={allColumnsState}
						onColumnVisibilityChange={handleColumnVisibilityChange}
						onColumnReorder={handleColumnsReorder}
						onSortChange={handleSortChange}
						onFreezeChange={handleFreezeChange}
						currentSort={sort}
						onResetToDefault={() => {
							// Reset columns ordering/visibility/frozen to the defaults passed to the table
							setAllColumnsState(columns);
							setTableColumn(columns);
							// Also clear sort to match a full "default" reset behavior
							handleSortChange(undefined, undefined);
						}}
						hideMenu={hideHeaderMenu}
					/>
				</Form>
			</WrapperTable>
		</ConfigProvider>
	);
};

const WrapperTable = styled.div`
	position: relative;
	background: var(--ant-table-header-bg);
`;

const CountItems = styled.p`
	position: absolute;
	right: 20px;
	font-weight: 500;
	font-size: 12px;
	line-height: 22px;
	color: var(--ant-color-text-secondary);  /* softer text */
`;

export default CustomTable;
