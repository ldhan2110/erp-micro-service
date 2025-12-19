/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dropdown, Form, message, type FormInstance } from 'antd';
import { useAppTranslate } from '@/hooks';
import {
	CopyOutlined,
	FileExcelOutlined,
	InsertRowAboveOutlined,
	InsertRowBelowOutlined,
	ReloadOutlined,
	DiffOutlined,
} from '@ant-design/icons';
import { useTableExportExcel, useClipboardCopy } from '../../hooks';
import type { EditTableHandler, TableColumn, TableData } from '@/types';

type EditTableContextMenuProps<T> = {
	isOpen: boolean;
	position: {
		x: number;
		y: number;
	};
	record: { [key: string]: any } | null;
	selectedRows?: TableData<T>[];
	dataSource: TableData<T>[];
	columns: TableColumn<TableData<T>>[];
	tableRef: React.RefObject<EditTableHandler<T>>;
	exportFileName: string;
	contextMenu?: {
		onRefresh?: (formValue?: FormInstance) => void;
		onExport?: (
			dataSource: readonly TableData<T>[],
			columns: TableColumn<TableData<T>>[],
			summary: (data: readonly TableData<T>[]) => React.ReactNode | boolean,
		) => void;
		onFullScreen?: (toggleFullScreen: () => void) => void;
	};
	summary: (data: readonly TableData<T>[]) => React.ReactNode | boolean;
	hideMenu: () => void;
};

export const EditTableContextMenu = <T,>({
	isOpen,
	position,
	record,
	selectedRows,
	dataSource,
	columns,
	exportFileName,
	contextMenu,
	tableRef,
	summary,
	hideMenu,
}: EditTableContextMenuProps<T>) => {
	const { t } = useAppTranslate();
	const tableForm = Form.useFormInstance();
	const hasSelectedRows = selectedRows && selectedRows.length > 0;
	const { exportToExcel } = useTableExportExcel(exportFileName);
	const { copyRowsToClipboard } = useClipboardCopy();

	return (
		<Dropdown
			open={isOpen}
			onOpenChange={(isOpen) => {
				// user clicked away, or dropdown closed by AntD
				if (!isOpen) {
					hideMenu();
				}
			}}
			menu={{
				items: [
					{ key: 'INSERT_ABOVE', label: t('Insert Above'), icon: <InsertRowAboveOutlined /> },
					{ key: 'INSERT_BELOW', label: t('Insert Below'), icon: <InsertRowBelowOutlined /> },
					{ type: 'divider' },
					{ key: 'COPY_ROW', label: t('Copy Row'), icon: <CopyOutlined /> },
					{
						key: 'COPY_SELECTED',
						label: t('Copy Selected Rows'),
						icon: <CopyOutlined />,
						disabled: !hasSelectedRows,
					},
					{ type: 'divider' },
					{
						key: 'DUPLICATE_ROW',
						label: hasSelectedRows ? t('Duplicate Selected Rows') : t('Duplicate Row'),
						icon: <DiffOutlined />,
					},
					{ type: 'divider' },
					{ key: 'RELOAD', label: t('Refresh'), icon: <ReloadOutlined /> },
					{ key: 'EXPORT_EXCEL', label: t('Export Excel'), icon: <FileExcelOutlined /> },
				],
				onClick: async ({ key }) => {
					switch (key) {
						case 'INSERT_ABOVE':
							tableRef.current?.insertAbove({}, (record as any).index);
							break;
						case 'INSERT_BELOW':
							tableRef.current?.insertBelow({}, (record as any).index);
							break;
						case 'COPY_ROW':
							if (record) {
								const currentRecord = dataSource.find((item) => item.key === record.key);
								await copyRowsToClipboard([currentRecord] as any[], columns as any[]);
								message.success(t('Row copied to clipboard'));
							}
							break;
						case 'COPY_SELECTED':
							if (hasSelectedRows) {
								const currentSelectedRecords = dataSource.filter((item) => selectedRows.some((selectedItem) => selectedItem.key === item.key));
								await copyRowsToClipboard(currentSelectedRecords as any[], columns as any[]);
								message.success(
									t('{{count}} row(s) copied to clipboard', { count: selectedRows.length }),
								);
							}
							break;
						case 'DUPLICATE_ROW':
							if (hasSelectedRows) {
								const rowsToDuplicate = dataSource.filter((item) =>
									selectedRows.some((selectedItem) => selectedItem.key === item.key)
								);
								tableRef.current?.duplicateRow(rowsToDuplicate as any[]);
								message.success(
									t('{{count}} row(s) duplicated', { count: rowsToDuplicate.length }),
								);
							} else if (record) {
								const currentRecord = dataSource.find((item) => item.key === record.key);
								if (currentRecord) {
									tableRef.current?.duplicateRow([currentRecord] as any[]);
									message.success(t('Row duplicated'));
								}
							}
							break;
						case 'RELOAD':
							if (contextMenu?.onRefresh) {
								contextMenu.onRefresh(tableForm);
							} else {
								tableForm?.resetFields();
							}
							break;
						case 'EXPORT_EXCEL':
							if (contextMenu?.onExport) {
								contextMenu.onExport(dataSource, columns, summary);
							} else {
								exportToExcel(dataSource, columns, summary);
							}
							break;
						default:
							break;
					}
					hideMenu();
				},
			}}
			trigger={['contextMenu']}
			placement="bottomLeft"
		>
			<div
				style={{
					position: 'fixed',
					top: position.y,
					left: position.x,
					width: 1,
					height: 1,
					zIndex: 9999,
				}}
			/>
		</Dropdown>
	);
};
