import { useGetRoleList } from '@/hooks/modules';
import { authStore, useRoleManagementStore } from '@/stores';
import { RoleTable } from '../tables';
import { AddRoleModal, ViewRoleModal } from '../modals';
import { useAppTranslate, useToggle } from '@/hooks';
import { AddButton } from '@/components/buttons';
import { Flex } from 'antd';

export const RoleView = () => {
	const { t } = useAppTranslate();
	const { isToggle: isOpenAddModal, toggle: toggleAddModal } = useToggle(false);
	const { isToggle: isOpenViewModal, toggle: toggleViewModal } = useToggle(false);
	const searchConditions = useRoleManagementStore((state) => state.search.roleFilter);

	//=========================ZUSTAND STORES===============================
	const setSelectedRoleId = useRoleManagementStore((state) => state.setSelectedRoleId);

	const { data: roleList, isLoading } = useGetRoleList({
		...searchConditions.filter,
		coId: authStore.user?.userInfo.coId,
		pagination: searchConditions.pagination,
		sort: searchConditions.sort,
	});

	function handleSelectRoleId(value: string) {
		setSelectedRoleId(value);
		toggleViewModal();
	}

	return (
		<>
			<Flex
				justify="end"
				gap={8}
				style={{
					paddingBottom: '8px',
				}}
			>
				<AddButton type="default" onClick={toggleAddModal}>
					{t('Add Role')}
				</AddButton>
			</Flex>
			<RoleTable data={roleList!} isLoading={isLoading} onSelectRole={handleSelectRoleId} />

			{/* Modals */}
			<AddRoleModal open={isOpenAddModal} onCancel={toggleAddModal} />
			<ViewRoleModal open={isOpenViewModal} onCancel={toggleViewModal} />
		</>
	);
};
