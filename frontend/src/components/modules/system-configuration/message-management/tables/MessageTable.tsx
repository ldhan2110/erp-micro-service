import CustomTable from '@/components/custom-table/CustomTable';
import { useAppTranslate, usePermission, useToggle } from '@/hooks';
import { useGetMessageList } from '@/hooks/modules';

import { authStore, useMessageManagementStore } from '@/stores';
import { SORT, type ComMsgDto, type TableColumn, type TableData } from '@/types';
import { convertToDBColumn, formatDate } from '@/utils/helper';
import { Button, Flex, message, Tag } from 'antd';
import { ViewMessageDrawer } from '../drawers';
import { ABILITY_ACTION, ABILITY_SUBJECT, MESSAGE_CODES } from '@/constants';
import { AddMessageButton, DeleteMessageButton } from '../buttons';

export const MessageTable = () => {
	const { m } = useAppTranslate();
	const { hasAbility } = usePermission();
	const { isToggle: isOpenViewDrawer, toggle: toggleViewDrawer } = useToggle(false);

	// Zustand
	const searchConditions = useMessageManagementStore((state) => state.search);
	const rowMsgSelection = useMessageManagementStore((state) => state.rowMsgSelection);
	const setRowMsgSelection = useMessageManagementStore((state) => state.setRowMsgSelection);
	const setSelectedMsgId = useMessageManagementStore((state) => state.setSelectedMsgId);
	const setSort = useMessageManagementStore((state) => state.setSort);
	const setPagination = useMessageManagementStore((state) => state.setPagination);

	// Hooks
	const { data: messageList, isLoading } = useGetMessageList({
		...searchConditions.filter,
		coId: authStore.user?.userInfo.coId,
		pagination: searchConditions.pagination,
		sort: searchConditions.sort,
	});

	const columns: TableColumn<ComMsgDto>[] = [
		{
			key: 'msgId',
			title: 'Message ID',
			dataIndex: 'msgId',
			width: 150,
			sorter: true,
			render: (value) => (
				<Button
					type="link"
					onClick={() => {
						if (hasAbility(ABILITY_ACTION.VIEW_DETAIL, ABILITY_SUBJECT.MESSAGE_MANAGEMENT)) {
							setSelectedMsgId(value);
							toggleViewDrawer();
						} else message.warning(m(MESSAGE_CODES.COM000010));
					}}
				>
					{value}
				</Button>
			),
		},
		{
			key: 'dfltMsgVal',
			title: 'Default Message',
			dataIndex: 'dfltMsgVal',
			width: 300,
			ellipsis: true,
			sorter: true,
		},
		{
			key: 'mdlNm',
			title: 'Module',
			dataIndex: 'mdlNm',
			width: 100,
			align: 'center',
			sorter: true,
		},
		{
			key: 'msgTpVal',
			title: 'Type',
			dataIndex: 'msgTpVal',
			width: 100,
			align: 'center',
			sorter: true,
			render: (value: string) => {
				const colorMap: Record<string, string> = {
					INFO: 'blue',
					WARN: 'orange',
					ERROR: 'red',
					SUCCESS: 'green',
				};
				return <Tag color={colorMap[value] || 'default'}>{value}</Tag>;
			},
		},
		{
			key: 'creDt',
			title: 'Created Date',
			dataIndex: 'creDt',
			sorter: true,
			width: 100,
			render: (value) => formatDate(value, true),
		},
		{
			key: 'creUsrId',
			title: 'Created By',
			dataIndex: 'creUsrId',
			width: 120,
			sorter: true,
		},
		{
			key: 'updDt',
			title: 'Updated Date',
			dataIndex: 'updDt',
			sorter: true,
			width: 100,
			render: (value) => formatDate(value, true),
		},
		{
			key: 'updUsrId',
			title: 'Updated By',
			dataIndex: 'updUsrId',
			width: 120,
			sorter: true,
		},
	];

	function handleSortChange(sortField: string | undefined, sortType: SORT | undefined) {
		setSort({
			sortField: convertToDBColumn(sortField as string),
			sortType,
		});
	}

	function handleSelectChange(_seletedKey: React.Key[], selectedRows: TableData<ComMsgDto>[]) {
		setRowMsgSelection(selectedRows);
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
				<DeleteMessageButton />
				<AddMessageButton />
			</Flex>
			<CustomTable<ComMsgDto>
				columns={columns}
				loading={isLoading}
				headerOffset={360}
				data={
					messageList?.messageList?.map((item, index) => ({
						...item,
						key: index,
						procFlag: 'S',
					})) ?? []
				}
				tableState={{
					rowSelection: rowMsgSelection,
					pagination: {
						...searchConditions.pagination,
						total: messageList?.total ?? 0,
					},
				}}
				onSortChange={handleSortChange}
				onPaginationChange={setPagination}
				onSelectChange={handleSelectChange}
			/>

			<ViewMessageDrawer
				open={isOpenViewDrawer}
				onClose={() => {
					toggleViewDrawer();
					setSelectedMsgId(null);
				}}
			/>
		</Flex>
	);
};

