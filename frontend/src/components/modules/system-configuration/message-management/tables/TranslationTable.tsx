import React from 'react';
import EditCustomTable from '@/components/custom-table/EditCustomTable';
import {
	EDIT_TYPE,
	type ComMsgTransDto,
	type EditTableHandler,
	type TableColumn,
	type TableData,
} from '@/types';
import { Flex, message, type FormInstance } from 'antd';
import { AddButton, DeleteButton } from '@/components/buttons';
import { useAppTranslate } from '@/hooks';
import { MESSAGE_CODES } from '@/constants';
import { useMessageManagementStore } from '@/stores';

type TranslationTableProps = {
	form: FormInstance<{ [key: string]: ComMsgTransDto[] }>;
	tableRef: React.RefObject<EditTableHandler<ComMsgTransDto> | null>;
};

export const TranslationTable = ({ form, tableRef }: TranslationTableProps) => {
	const { t, m } = useAppTranslate();
	const formTableName = React.useMemo(() => 'translationTable', []);

	// Zustands
	const selectedRows = useMessageManagementStore((state) => state.selectedRows);
	const setSelectedRows = useMessageManagementStore((state) => state.setSelectedRows);

	const columns: TableColumn<ComMsgTransDto>[] = [
		{
			key: 'langVal',
			title: 'Language',
			dataIndex: 'langVal',
			width: 120,
			draggable: false,
			sorter: false,
			editType: EDIT_TYPE.SELECT,
			editProps: {
				required: true,
				placeholder: 'Select Language',
				options: [
					{ label: 'English', value: 'en' },
					{ label: 'Korean', value: 'kr' },
					{ label: 'Vietnamese', value: 'vn' },
				],
				rules: [
					{
						validator: (_, value) => {
							const translationList = form.getFieldValue(formTableName) || [];
							const languages = translationList
								.map((trans: ComMsgTransDto) => trans?.langVal)
								.filter(Boolean);
							const duplicateCount = languages.filter((l: string) => l === value).length;
							if (duplicateCount > 1) {
								return Promise.reject(new Error('Duplicate Language'));
							}
							return Promise.resolve();
						},
					},
				],
			},
		},
		{
			key: 'transMsgVal',
			title: 'Translation',
			dataIndex: 'transMsgVal',
			width: 350,
			draggable: false,
			sorter: false,
			editType: EDIT_TYPE.INPUT,
			editProps: {
				required: true,
				maxLength: 1000,
				placeholder: 'Enter Translation',
			},
		},
	];

	function handleSelectChange(_selectedKey: React.Key[], selectedRows: TableData<ComMsgTransDto>[]) {
		setSelectedRows(selectedRows);
	}

	function handleAddTranslation() {
		tableRef.current?.onAddRow({});
	}

	function handleDeleteTranslation() {
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
				<DeleteButton hidden={selectedRows.length == 0} onClick={handleDeleteTranslation}>
					{t('Delete Translation')}
				</DeleteButton>
				<AddButton type="default" onClick={handleAddTranslation}>
					{t('Add Translation')}
				</AddButton>
			</Flex>
			<EditCustomTable<ComMsgTransDto>
				form={form}
				formTableName={formTableName}
				ref={tableRef}
				columns={columns}
				headerOffset={440}
				data={[]}
				tableState={{
					rowSelection: selectedRows,
				}}
				onSelectChange={handleSelectChange}
			/>
		</Flex>
	);
};

