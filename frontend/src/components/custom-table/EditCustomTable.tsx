/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import {
	SORT,
	TABLE_ACTIONS,
	type EditTableHandler,
	type Pagination,
	type TableColumn,
	type TableData,
	type TableExtra,
	type TableFilter,
	type TableSort,
	type TableState,
} from '@/types';
import {
	ConfigProvider,
	Empty,
	Form,
	Table,
	type CheckboxProps,
	type FormListFieldData,
} from 'antd';
import { DEFAULT_PAGE_OPTIONS, DEFAULT_TABLE_STATE } from '@/constants/table';
import type { FormInstance } from 'antd/lib';
import { isEmpty, some } from 'lodash';
import {
	TableHeader,
	EditableCell,
	DragDropTableContextProvider,
	EditTableContextMenu,
	ContextHeaderMenu,
} from './components';
import { useEditTableHooks } from './hooks';
import styled from 'styled-components';
import styles from './CustomTable.module.scss';
import ColumnHeader from './components/ColumnHeader';

export type EditCustomTableProps<T> = {
	form: FormInstance;
	formTableName: string;
	columns: TableColumn<T>[];
	data: TableData<T>[];
	tableState: TableState<T>;
	headerOffset?: number;
	loading?: boolean;
	autoPagination?: boolean;
	noFooter?: boolean;
	exportFileName?: string;
	contextMenu?: {
		onRefresh?: (filterForm?: FormInstance) => void;
		onExport?: (
			dataSource: readonly TableData<T>[],
			columns: TableColumn<TableData<T>>[],
			summary: (data: readonly TableData<T>[]) => React.ReactNode | boolean,
		) => void;
		onFullScreen?: (toggleFullScreen: () => void) => void;
	};
	onSelectChange?: (selectedRowKeys: React.Key[], selectedRows: TableData<T>[]) => void;
	onPaginationChange?: (current: number, pageSize: number) => void;
	onSortChange?: (sortField: string | undefined, sortType: SORT | undefined) => void;
	onTableDataChange?: (changedRow: TableData<T>) => void;
	getCheckboxProps?: (record: {
		key: number;
		index: number;
	}) => Partial<Omit<CheckboxProps, 'checked' | 'defaultChecked'>>;
};

const EditCustomTable = <T,>(
	{
		form,
		formTableName,
		columns,
		data,
		tableState = DEFAULT_TABLE_STATE,
		loading = false,
		autoPagination = false,
		headerOffset = 290,
		noFooter = false,
		exportFileName,
		contextMenu,
		onSelectChange,
		onPaginationChange,
		onSortChange,
		onTableDataChange,
		getCheckboxProps,
	}: EditCustomTableProps<T>,
	ref: React.ForwardedRef<EditTableHandler<T>>,
) => {
	// ========== ⚙️ Table Options ==========
	const {
		t,
		mappedColumns,
		columnsWithSort,
		tableHeight,
		tableWidth,
		addRowRef,
		removeRowRef,
		fieldsRef,
		tableRef,
		deletedRows,
		isOpenMenu,
		menuPosition,
		selectedMenuRecord,
		isOpenHeaderMenu,
		headerMenuPosition,
		selectedHeaderColumn,
		showMenu,
		hideMenu,
		hideHeaderMenu,
		setTableColumn,
		setAllColumnsState,
		generateKey,
		scrollToRow,
		renderSummary,
		sort,
		handleSortChange,
		confirmProceedIfUnsaved,
		guardedHandleSortChange,
		allColumnsState,
		handleColumnVisibilityChange,
		handleColumnsReorder,
		handleFreezeChange,
	} = useEditTableHooks<T>(columns, data, form, formTableName, headerOffset, tableState, onSortChange);
	const { pagination, rowSelection } = tableState;

	// ========== 🧩 Table Exposed Methods ==========
	React.useImperativeHandle(ref, () => ({
		insertAbove: (row?: Partial<TableData<T>>, index?: number) => {
			const newRow = {
				...row,
				key: generateKey(),
				procFlag: 'I',
			} as TableData<T>;
			if (index !== null) {
				addRowRef.current?.(newRow, index);
				scrollToRow(index);
			} else {
				addRowRef.current?.(newRow);
				scrollToRow();
			}
		},
		insertBelow: (row?: Partial<TableData<T>>, index?: number) => {
			const newRow = {
				...row,
				key: generateKey(),
				procFlag: 'I',
			} as TableData<T>;
			if (index) {
				addRowRef.current?.(newRow, index + 1);
				scrollToRow(index + 1);
			} else {
				addRowRef.current?.(newRow);
				scrollToRow();
			}
		},

		onAddRow: (row?: Partial<TableData<T>>, index?: number) => {
			const newRow = {
				...row,
				key: generateKey(),
				procFlag: 'I',
			} as TableData<T>;
			if (index) {
				addRowRef.current?.(newRow, index);
				scrollToRow(index);
			} else {
				addRowRef.current?.(newRow);
				scrollToRow();
			}
		},
		onRemoveRow: (key: number | number[]) => {
			if (isEmpty(key)) return;
			if (key instanceof Array) {
				const listRowIndex = key
					.map((k) => fieldsRef.current.findIndex((item) => String(item.key) === String(k)))
					.filter((index) => index !== -1);

				// Filter the rows that is deleted.
				const deletedRowsForm = (form.getFieldValue(formTableName) as Array<TableData<T>>)
					.filter((item, index) => item.procFlag != 'I' && listRowIndex.includes(index))
					.map((item) => ({ ...item, procFlag: 'D' }));
				deletedRows.current = deletedRows.current.concat(deletedRowsForm as TableData<T>[]);

				// Remove the rows
				removeRowRef.current?.(listRowIndex);
			} else {
				const rowIndex = fieldsRef.current.findIndex((item) => String(item.key) === String(key));

				// Filter the rows that is deleted.
				const deletedRowsForm = (form.getFieldValue(formTableName) as Array<TableData<T>>)
					.filter((item, index) => item.procFlag != 'I' && rowIndex == index)
					.map((item) => ({ ...item, procFlag: 'D' }));
				deletedRows.current = deletedRows.current.concat(deletedRowsForm as TableData<T>[]);

				// Remove the rows
				removeRowRef.current?.(rowIndex);
			}
		},
		getDeletedRows: () => {
			return deletedRows.current;
		},
		resetDeletedRows: () => {
			deletedRows.current = [];
		},
		duplicateRow: (rows: TableData<T>[]) => {
			if (isEmpty(rows)) return;
			rows.forEach((row) => {
				// eslint-disable-next-line @typescript-eslint/no-unused-vars
				const { key, procFlag, ...rowData } = row;
				const newRow = {
					...rowData,
					key: generateKey(),
					procFlag: 'I',
				} as TableData<T>;
				addRowRef.current?.(newRow);
			});
			scrollToRow();
		},
	}));

	// ========== 🔧 Table Utility Functions ==========
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
				columnWidth: 30,
				selectedRowKeys: rowSelection.map((item) => item.key),
				getCheckboxProps: getCheckboxProps,
				onChange: onSelectChange,
			};
		}
		return undefined;
	}, [rowSelection, getCheckboxProps, onSelectChange]);

	// Table Changes Event
	const onTableChange = (
		pagination: Pagination,
		_filter: TableFilter,
		sorter: TableSort,
		extra: TableExtra<T>,
	) => {
		const applyChange = () => {
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

		// Guard: sorting/pagination/pageSize changes must confirm if unsaved
		if (extra.action === TABLE_ACTIONS.PAGINATE || extra.action === TABLE_ACTIONS.SORT) {
			void confirmProceedIfUnsaved().then((ok) => {
				if (!ok) return;
				applyChange();
			});
			return;
		}

		applyChange();
	};

	// Render Cells
	const renderCell = React.useCallback(
		(inputColumns: TableColumn<T>[], fields: FormListFieldData[]) => {
			const processColumns = (columns: TableColumn<T>[]): TableColumn<T>[] =>
				columns.map((col) => {
					// Recursively handle children
					if (col.children) {
						return {
							...col,
							children: processColumns(col.children),
						};
					}

					return {
						...col,
						title: <ColumnHeader<T> title={col.title} required={col.editProps?.required} />,
						render: (text: any, record: T, rowIndex: number) => (
							<EditableCell
								editType={col.editType}
								field={fields[rowIndex]}
								cellKey={`${rowIndex}-${col.dataIndex}`}
								name={[fields[rowIndex].name, col.dataIndex as string]}
								tableFormName={formTableName}
								editProps={col.editProps}
								text={text}
								record={record}
							/>
						),
					};
				});

			return processColumns(inputColumns);
		},
		[formTableName],
	);

	const onFinish = (values: any) => {
		console.log('Received values of form:', values);
	};

	const onFieldsChange = (changedFields: any[]) => {
		if (some(changedFields, (field) => field.validating)) return;
		const [formName, rowIndex] = changedFields[0].name;
		const curProcFlg = form.getFieldValue([formName, rowIndex, 'procFlag']);
		form.setFieldValue([formName, rowIndex, 'procFlag'], curProcFlg == 'S' ? 'U' : curProcFlg);
		onTableDataChange?.(form.getFieldValue([formName, rowIndex]));
	};

	// Render Table
	return (
		<ConfigProvider
			renderEmpty={() => <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={t('No Data')} />}
		>
			<Form
				form={form}
				onFinish={onFinish}
				onFieldsChange={onFieldsChange}
				initialValues={{
					[formTableName]: data.map((item, index) => ({ ...item, key: index, procFlag: 'S' })),
				}}
			>
				<Form.List name={formTableName}>
					{(fields, { add, remove }) => {
						// Assign "add, remove" to ref for external use
						fieldsRef.current = fields;
						addRowRef.current = add;
						removeRowRef.current = remove;

						// Convert fields to dataSource for Table
						const dataFieldSource = fields.map((field, index) => ({
							...data[index],
							key: field.key,
							index,
						}));

						return (
							<WrapperTable className="edit-table">
								<DragDropTableContextProvider columns={mappedColumns} setColumns={setTableColumn}>
									<Table<TableData<T>>
										bordered
										ref={tableRef}
										size="small"
										loading={loading}
										className={styles.tableCustom}
										columns={renderCell(columnsWithSort, fields) as any[]}
										dataSource={dataFieldSource as any[]}
										rowSelection={rowSelectionOptions as any}
										scroll={{ x: tableWidth, y: tableHeight }}
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
										onRow={(record) => {
											return {
												onContextMenu: (e) => {
													showMenu(e, record);
												},
											};
										}}
										summary={renderSummary}
										onChange={onTableChange as any}
									/>
									{noFooter ? (
										<></>
									) : (
										<CountItems
											style={{
												bottom: fieldsRef.current.length == 0 ? 12 : paginationOptions ? 18 : 13,
											}}
										>
											Total: {pagination?.total || fieldsRef.current.length || 0} item&#40;s&#41;
										</CountItems>
									)}
								</DragDropTableContextProvider>
							</WrapperTable>
						);
					}}
				</Form.List>

				<EditTableContextMenu
					tableRef={ref as React.RefObject<EditTableHandler<T>>}
					isOpen={isOpenMenu}
					position={menuPosition}
					record={selectedMenuRecord}
					selectedRows={rowSelection}
					hideMenu={hideMenu}
					dataSource={form.getFieldValue(formTableName)}
					columns={mappedColumns}
					summary={renderSummary}
					exportFileName={exportFileName || 'data'}
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
					onSortChange={guardedHandleSortChange}
					onFreezeChange={handleFreezeChange}
					currentSort={sort}
					onResetToDefault={() => {
						void confirmProceedIfUnsaved().then((ok) => {
							if (!ok) return;
							setAllColumnsState(columns);
							setTableColumn(columns);
							handleSortChange(undefined, undefined);
						});
					}}
					hideMenu={hideHeaderMenu}
				/>
			</Form>
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
	color: var(--ant-color-text-secondary);
`;

export default React.forwardRef(EditCustomTable) as <T>(
	props: EditCustomTableProps<T> & { ref?: React.ForwardedRef<EditTableHandler<T>> },
) => ReturnType<typeof EditCustomTable>;
