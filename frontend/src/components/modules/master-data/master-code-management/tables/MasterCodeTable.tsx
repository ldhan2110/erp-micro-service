import CustomTable from '@/components/custom-table/CustomTable';
import { useAppTranslate, usePermission, useToggle } from '@/hooks';
import { useGetMasterCodeList } from '@/hooks/modules';

import { authStore, useMasterCodeManagementStore } from '@/stores';
import { SORT, type MasterCodeDto, type TableColumn } from '@/types';
import { convertToDBColumn, formatDate } from '@/utils/helper';
import { Button, Flex, message, Tag } from 'antd';
import { AddMasterCodeButton } from '../buttons';
import { ViewMasterCodeDrawer } from '../drawers';
import { ABILITY_ACTION, ABILITY_SUBJECT, MESSAGE_CODES } from '@/constants';

export const MasterCodeTable = () => {
	const { t, m } = useAppTranslate();
	const { hasAbility } = usePermission();
	const { isToggle: isOpenViewDrawer, toggle: toggleViewDrawer } = useToggle(false);

	// Zustand
	const searchConditions = useMasterCodeManagementStore((state) => state.search);
	const setSelectedMstCd = useMasterCodeManagementStore((state) => state.setSelectedMstCd);
	const setSort = useMasterCodeManagementStore((state) => state.setSort);
	const setPagination = useMasterCodeManagementStore((state) => state.setPagination);

	// Hooks
	const { data: masterCodeList, isLoading } = useGetMasterCodeList({
		...searchConditions.filter,
		coId: authStore.user?.userInfo.coId,
		pagination: searchConditions.pagination,
		sort: searchConditions.sort,
	});

	const columns: TableColumn<MasterCodeDto>[] = [
		{
			key: 'mstCd',
			title: 'Master Code',
			dataIndex: 'mstCd',
			width: 100,
			sorter: true,
			render: (value) => (
				<Button
					type="link"
					onClick={() => {
						if (hasAbility(ABILITY_ACTION.VIEW_DETAIL, ABILITY_SUBJECT.MASTER_CODE_MANAGEMENT)) {
							setSelectedMstCd(value);
							toggleViewDrawer();
						} else message.warning(m(MESSAGE_CODES.COM000010));
					}}
				>
					{value}
				</Button>
			),
		},
		{
			key: 'mstNm',
			title: 'Master Name',
			dataIndex: 'mstNm',
			width: 150,
			sorter: true,
		},
		{
			key: 'mstDesc',
			title: 'Description',
			dataIndex: 'mstDesc',
			width: 200,
			ellipsis: true,
			sorter: true,
		},
		{
			key: 'useFlg',
			title: 'Status',
			dataIndex: 'useFlg',
			width: 90,
			align: 'center',
			sorter: true,
			render: (value: string) =>
				value === 'Y' ? (
					<Tag color="success">{t('Active')}</Tag>
				) : (
					<Tag color="default">{t('Inactive')}</Tag>
				),
		},
		{
			key: 'creDt',
			title: 'Created Date',
			dataIndex: 'creDt',
			sorter: true,
			width: 80,
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
			width: 80,
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

	return (
		<Flex vertical>
			<Flex
				justify="end"
				gap={8}
				style={{
					paddingBottom: '8px',
				}}
			>
				<AddMasterCodeButton />
			</Flex>
			<CustomTable<MasterCodeDto>
				columns={columns}
				loading={isLoading}
				data={
					masterCodeList?.masterCodeList?.map((item, index) => ({
						...item,
						key: index,
						procFlag: 'S',
					})) ?? []
				}
				tableState={{
					rowSelection: undefined,
					pagination: {
						...searchConditions.pagination,
						total: 0,
					},
				}}
				onSortChange={handleSortChange}
				onPaginationChange={setPagination}
			/>

			<ViewMasterCodeDrawer
				open={isOpenViewDrawer}
				onClose={() => {
					toggleViewDrawer();
					setSelectedMstCd(null);
				}}
			/>
		</Flex>
	);
};
