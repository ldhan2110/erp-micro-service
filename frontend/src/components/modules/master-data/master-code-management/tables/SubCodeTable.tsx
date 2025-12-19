import React from 'react';
import EditCustomTable from '@/components/custom-table/EditCustomTable';
import {
	EDIT_TYPE,
	type EditTableHandler,
	type SubCodeDto,
	type TableColumn,
	type TableData,
} from '@/types';
import { Flex, message, type FormInstance } from 'antd';
import { AddButton, DeleteButton } from '@/components/buttons';
import { useAppTranslate } from '@/hooks';
import { MESSAGE_CODES } from '@/constants';
import { useMasterCodeManagementStore } from '@/stores';

type SubCodeTableProps = {
	form: FormInstance<{ [key: string]: SubCodeDto[] }>;
	tableRef: React.RefObject<EditTableHandler<SubCodeDto> | null>;
};

export const SubCodeTable = ({ form, tableRef }: SubCodeTableProps) => {
	const { t, m } = useAppTranslate();
	const formTableName = React.useMemo(() => 'subCodeTable', []);

	// Zustands
	const selectedRows = useMasterCodeManagementStore((state) => state.selectedRows);
	const setSelectedRows = useMasterCodeManagementStore((state) => state.setSelectedRows);

	const columns: TableColumn<SubCodeDto>[] = [
		{
			key: 'subCd',
			title: 'Sub Code',
			dataIndex: 'subCd',
			width: 50,
			draggable: false,
			sorter: false,
			editType: EDIT_TYPE.INPUT,
			editProps: {
				required: true,
				maxLength: 20,
				placeholder: 'Enter Sub Code',
				rules: [
					{
						validator: (_, value) => {
							const subCdList = form.getFieldValue(formTableName) || [];
							const permissions = subCdList
								.map((subCd: SubCodeDto) => subCd?.subCd)
								.filter(Boolean);
							const duplicateCount = permissions.filter((p: string) => p === value).length;
							if (duplicateCount > 1) {
								return Promise.reject(new Error('Duplicate Sub Code'));
							}
							return Promise.resolve();
						},
					},
				],
			},
		},
		{
			key: 'subNm',
			title: 'Sub Name',
			dataIndex: 'subNm',
			width: 80,
			draggable: false,
			sorter: false,
			editType: EDIT_TYPE.INPUT,
			editProps: {
				required: true,
				maxLength: 100,
				placeholder: 'Enter Sub Name',
			},
		},
		{
			key: 'subDesc',
			title: 'Description',
			dataIndex: 'subDesc',
			width: 120,
			draggable: false,
			sorter: false,
			editType: EDIT_TYPE.INPUT,
			editProps: {
				maxLength: 500,
				placeholder: 'Enter Description',
			},
		},
		{
			key: 'subOrdNo',
			title: 'Order',
			dataIndex: 'subOrdNo',
			width: 50,
			draggable: false,
			sorter: false,
			editType: EDIT_TYPE.INPUT_NUMER,
			editProps: {
				required: true,
				maxLength: 2,
				placeholder: 'Enter Order',
				numberType: 'number',
			},
		},
		{
			key: 'useFlg',
			title: 'Active',
			dataIndex: 'useFlg',
			width: 50,
			sorter: false,
			draggable: false,
			editType: EDIT_TYPE.CHECKBOX,
			editProps: {
				checkboxMapping: {
					checked: 'Y',
					unchecked: 'N',
				},
			},
		},
	];

	function handleSelectChange(_selectedKey: React.Key[], selectedRows: TableData<SubCodeDto>[]) {
		setSelectedRows(selectedRows);
	}

	function handleAddSubCode() {
		tableRef.current?.onAddRow({
			useFlg: 'Y',
		});
	}

	function handleDeleteSubCode() {
		if (selectedRows.length === 0) {
			message.warning(m(MESSAGE_CODES.COM000005));
		} else {
			tableRef.current?.onRemoveRow?.(selectedRows.map((item) => item.key) as number[]);
			setSelectedRows([]);
		}
	}

	return (
		<Flex vertical>
			<Flex
				justify="end"
				gap={8}
				style={{
					paddingBottom: '8px',
				}}
			>
				<DeleteButton hidden={selectedRows.length == 0} onClick={handleDeleteSubCode}>
					{t('Delete Sub Code')}
				</DeleteButton>
				<AddButton type="default" onClick={handleAddSubCode}>
					{t('Add Sub Code')}
				</AddButton>
			</Flex>
			<EditCustomTable<SubCodeDto>
				form={form}
				formTableName={formTableName}
				ref={tableRef}
				columns={columns}
				headerOffset={510}
				data={[]}
				tableState={{
					rowSelection: selectedRows,
				}}
				// loading={isLoadingPermission}
				onSelectChange={handleSelectChange}
			/>
		</Flex>
	);
};
