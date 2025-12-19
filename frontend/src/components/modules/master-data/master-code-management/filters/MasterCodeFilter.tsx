import { FormInput, FormSearchContainer, FormSelect } from '@/components/form';
import { useAppTranslate } from '@/hooks';
import { useMasterCodeManagementStore } from '@/stores';
import type { MasterCodeListFilterForm } from '@/types';
import { Flex, Form } from 'antd';

export const MasterCodeFilter = () => {
	const { t } = useAppTranslate();
	const [filterForm] = Form.useForm<MasterCodeListFilterForm>();

	// Zustand Store
	const searchConditions = useMasterCodeManagementStore((state) => state.search);
	const setFilter = useMasterCodeManagementStore((state) => state.setFilter);
	const clearSearch = useMasterCodeManagementStore((state) => state.clearSearch);

	async function onFormRefresh() {
		clearSearch(filterForm);
	}

	function onFormSearch() {
		const conditions = filterForm.getFieldsValue();
		setFilter(conditions);
	}

	return (
		<>
			<FormSearchContainer
				form={filterForm}
				initialValues={searchConditions.filter}
				onRefresh={onFormRefresh}
				onSearch={onFormSearch}
			>
				<Flex gap={8} vertical>
					<Flex gap={24}>
						<FormInput
							name="mstCd"
							label={'Master Code'}
							placeholder={t('Enter Master Code')}
							width={200}
						/>
						<FormInput
							name="mstNm"
							label={'Master Name'}
							placeholder={t('Enter Master Name')}
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
		</>
	);
};
