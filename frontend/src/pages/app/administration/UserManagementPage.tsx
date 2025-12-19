import { AddButton } from '@/components/buttons';
import CustomTable from '@/components/custom-table/CustomTable';
import { FormInput, FormSearchContainer, FormSelect } from '@/components/form';
import { AddUserModal, ViewUserModal } from '@/components/modules/administration';
import { PermissionGate } from '@/components/PermissionGate';
import { ABILITY_ACTION, ABILITY_SUBJECT, MESSAGE_CODES } from '@/constants';
import { useAppTranslate, useExcelExport, usePermission, useShowMessage, useToggle } from '@/hooks';
import { useGetUserList, useResetUserPassword } from '@/hooks/modules';
import { cancelExportAsync, confirmExportAsync, exportExcel } from '@/services/api';
import { authStore, useUserManagementStore } from '@/stores';
import {
	type DynamicFilterDto,
	type SORT,
	type TableColumn,
	type TableData,
	type UserInfoDto,
	type UserListFilterForm,
} from '@/types';
import { convertToDBColumn, formatDate } from '@/utils/helper';
import { App, Button, Flex, Form, Tag } from 'antd';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react-lite';
import React from 'react';

const UserManagementPage = observer(() => {
	const { t, m } = useAppTranslate();
	const [filterForm] = Form.useForm<UserListFilterForm>();
	const [tableFilterForm] = Form.useForm();
	const { message } = App.useApp();
	const { hasAbility } = usePermission();
	const { showConfirmMessage } = useShowMessage();
	const { isToggle: isOpenAddModal, toggle: toggleAddModal } = useToggle(false);
	const { isToggle: isOpenViewModal, toggle: toggleViewModal } = useToggle(false);

	// Zustand Stores
	const searchConditions = useUserManagementStore((state) => state.search);
	const selectionRows = useUserManagementStore((state) => state.selectionRows);
	const setSelectedUserId = useUserManagementStore((state) => state.setSelectedUserId);
	const setSelectionRows = useUserManagementStore((state) => state.setSelectionRows);
	const setFilter = useUserManagementStore((state) => state.setFilter);
	const setSort = useUserManagementStore((state) => state.setSort);
	const setPagination = useUserManagementStore((state) => state.setPagination);
	const clearSearch = useUserManagementStore((state) => state.clearSearch);

	const { data: userList, isLoading } = useGetUserList({
		...searchConditions.filter,
		coId: authStore.user?.userInfo.coId,
		pagination: searchConditions.pagination,
		sort: searchConditions.sort,
	});

	const { mutate: resetUserPassword, isPending: isResetting } = useResetUserPassword({
		onSuccess: () => {
			message.success(m(MESSAGE_CODES.ADM000004));
			setSelectionRows([]);
		},
		onError: (err) => {
			console.log(err);
			message.error(m(err.errorCode || MESSAGE_CODES.SYSMESSAGE));
		},
	});

	async function resetPassword() {
		await resetUserPassword(selectionRows);
	}

	async function handleResetPassword() {
		if (selectionRows.length == 0) {
			message.warning(m(MESSAGE_CODES.COM000005));
			return;
		}
		try {
			showConfirmMessage(m(MESSAGE_CODES.ADM000005), () => resetPassword());
		} catch {
			return;
		}
	}

	// Excel Export Hook
	const { handleExport: handleExportExcel, isExporting } = useExcelExport(exportExcel, {
		defaultFileName: 'user_list.xlsx',
		confirmAsyncExport: true,
		onAsyncConfirmed: async (jobId) => {
			console.log('Async export job started:', jobId);
			if (!isEmpty(jobId)) await confirmExportAsync(jobId);
		},
		onAsyncCancelled: async (jobId) => {
			console.log('Async export job cancelled');
			if (!isEmpty(jobId)) await cancelExportAsync(jobId);
		},
	});

	function handleSelectUserId(value: string) {
		const isPermit = hasAbility(ABILITY_ACTION.VIEW_DETAIL, ABILITY_SUBJECT.USER_MANAGEMENT);
		if (isPermit) {
			setSelectedUserId(value);
			toggleViewModal();
		} else {
			message.warning(m(MESSAGE_CODES.COM000010));
		}
	}

	function handleSelectChange(_seletedKey: React.Key[], selectedRows: TableData<UserInfoDto>[]) {
		setSelectionRows(selectedRows);
	}

	function handleSortChange(sortField: string | undefined, sortType: SORT | undefined) {
		setSort({
			sortField: convertToDBColumn(sortField as string),
			sortType,
		});
	}

	function onExportClick() {
		// Build search request with current filters
		const exportRequest = {
			...searchConditions.filter,
			coId: authStore.user?.userInfo.coId,
			sort: searchConditions.sort,
			// Don't include pagination for export - export all matching records
		};
		handleExportExcel(exportRequest, "user_list.xlsx");
	}

	const columns: TableColumn<UserInfoDto>[] = [
		{
			key: 'usrId',
			title: 'User ID',
			dataIndex: 'usrId',
			width: 100,
			sorter: true,
			// filterProps: {
			// 	showFilter: true,
			// 	filterType: TABLE_FILTER_TYPE.TEXT,
			// 	filterName: 'usrId',
			// },
			render: (value) => (
				<Button type="link" onClick={() => handleSelectUserId(value)}>
					{value}
				</Button>
			),
		},
		{
			key: 'usrNm',
			title: 'Full Name',
			dataIndex: 'usrNm',
			width: 120,
			sorter: true,
			// filterProps: {
			// 	showFilter: true,
			// 	filterType: TABLE_FILTER_TYPE.TEXT,
			// 	filterName: 'usrNm',
			// },
		},
		{
			key: 'roleNm',
			title: 'Role',
			dataIndex: 'roleNm',
			width: 100,
			sorter: true,
		},
		{
			key: 'usrEml',
			title: 'Email',
			dataIndex: 'usrEml',
			width: 150,
			ellipsis: true,
			sorter: true,
			// filterProps: {
			// 	showFilter: true,
			// 	filterType: TABLE_FILTER_TYPE.TEXT,
			// 	filterName: 'usrEml',
			// },
		},
		{
			key: 'useFlg',
			title: 'Status',
			dataIndex: 'useFlg',
			width: 90,
			align: 'center',
			sorter: true,
			// filterProps: {
			// 	showFilter: true,
			// 	filterType: TABLE_FILTER_TYPE.SELECT,
			// 	filterName: 'useFlg',
			// 	filterInitialValue: '',
			// 	filterOptions: [
			// 		{ label: 'All', value: '' },
			// 		{ label: 'Active', value: 'Y' },
			// 		{ label: 'Inactive', value: 'N' },
			// 	],
			// },
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
			width: 100,
			// filterProps: {
			// 	showFilter: true,
			// 	filterType: TABLE_FILTER_TYPE.DATEPICKER,
			// 	filterName: 'creDt',
			// },
			excelProps: {
				exportType: 'date',
			},
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
			excelProps: {
				exportType: 'date',
			},
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

	async function onFormRefresh() {
		clearSearch(filterForm);
	}

	function onFormSearch() {
		const conditions = filterForm.getFieldsValue();
		setFilter(conditions);
	}

	function handleTableFilterChange(filterValue: DynamicFilterDto[]) {
		setFilter({
			...filterForm.getFieldsValue(),
			filters: filterValue,
		});
	}

	return (
		<>
			<PermissionGate
				permissions={[
					{
						ability: ABILITY_ACTION.VIEW,
						entity: ABILITY_SUBJECT.USER_MANAGEMENT,
					},
				]}
			>
				<Flex vertical gap={8}>
					<FormSearchContainer
						form={filterForm}
						initialValues={searchConditions.filter}
						onRefresh={onFormRefresh}
						onSearch={onFormSearch}
					>
						<Flex gap={8} vertical>
							<Flex gap={16}>
								<FormInput
									name="usrId"
									label={'User ID'}
									placeholder={t('Enter User ID')}
									width={200}
								/>
								<FormInput
									name="usrNm"
									label={'User Name'}
									placeholder={t('Enter User Name')}
									width={220}
								/>
								<FormSelect
									name="useFlg"
									label={'Status'}
									width={100}
									options={[
										{ label: 'All', value: '' },
										{ label: 'Active', value: 'Y' },
										{ label: 'Inactive', value: 'N' },
									]}
								/>
							</Flex>
						</Flex>
					</FormSearchContainer>

					<Flex justify="end" gap={8}>
						<PermissionGate
							permissions={[
								{
									ability: ABILITY_ACTION.RESET_PASSWORD,
									entity: ABILITY_SUBJECT.USER_MANAGEMENT,
								},
							]}
							variant="hidden"
						>
							<Button loading={isResetting} onClick={handleResetPassword}>
								{t('Reset Password')}
							</Button>
						</PermissionGate>
						<PermissionGate
							permissions={[
								{
									ability: ABILITY_ACTION.EXPORT,
									entity: ABILITY_SUBJECT.USER_MANAGEMENT,
								},
							]}
							variant="hidden"
						>
							<Button loading={isExporting} onClick={onExportClick}>
								{t('Export Excel')}
							</Button>
						</PermissionGate>
						<PermissionGate
							permissions={[
								{
									ability: ABILITY_ACTION.ADD,
									entity: ABILITY_SUBJECT.USER_MANAGEMENT,
								},
							]}
							variant="hidden"
						>
							<AddButton type="default" onClick={toggleAddModal}>
								Add User
							</AddButton>
						</PermissionGate>
					</Flex>
					<CustomTable<UserInfoDto>
						columns={columns}
						tableFilterForm={tableFilterForm}
						onFilterTableChange={handleTableFilterChange}
						headerOffset={390}
						data={
							userList?.userInfo?.map((item, index) => ({
								...item,
								key: index,
								procFlag: 'S',
							})) || []
						}
						loading={isLoading}
						tableState={{
							pagination: {
								...searchConditions.pagination,
								total: userList?.total || 0,
							},
							rowSelection: selectionRows,
						}}
						onPaginationChange={setPagination}
						onSelectChange={handleSelectChange}
						onSortChange={handleSortChange}
					/>
				</Flex>
				<AddUserModal onCancel={toggleAddModal} open={isOpenAddModal} />
				<ViewUserModal onCancel={toggleViewModal} open={isOpenViewModal} />
			</PermissionGate>
		</>
	);
});

export default UserManagementPage;
