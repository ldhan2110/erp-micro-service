import { CancelButton, SaveButton } from '@/components/buttons';
import { CommonFormDrawer } from '@/components/drawer';
import { FormCheckbox, FormInput, FormTextArea } from '@/components/form';
import { useAppForm, useAppTranslate } from '@/hooks';
import type { EditTableHandler, MasterCodeDto, SubCodeDto, TableData } from '@/types';
import { App, Col, Flex, Row } from 'antd';
import { SubCodeTable } from '../tables';
import { authStore, useMasterCodeManagementStore } from '@/stores';
import { useGetMasterCode, useUpdateMasterCode } from '@/hooks/modules';
import { ABILITY_ACTION, ABILITY_SUBJECT, MESSAGE_CODES } from '@/constants';
import { authService } from '@/services/auth/authJwtService';
import { isEmpty } from 'lodash';
import React from 'react';
import { PermissionGate } from '@/components/PermissionGate';

type ViewMasterCodeDrawerProps = {
	open: boolean;
	onClose: () => void;
};

export const ViewMasterCodeDrawer = ({ open, onClose }: ViewMasterCodeDrawerProps) => {
	const { m } = useAppTranslate();
	const { message } = App.useApp(); // ✅ use the context-aware version

	// Edit Table Refs
	const tableRef = React.useRef<EditTableHandler<SubCodeDto> | null>(null);

	// Zustands
	const selectMstCd = useMasterCodeManagementStore((state) => state.selectMstCd);
	const setSelectedRows = useMasterCodeManagementStore((state) => state.setSelectedRows);

	// Hooks
	const { data: masterCodeInfo, isLoading } = useGetMasterCode(
		{
			coId: authStore.user?.userInfo.coId,
			mstCd: selectMstCd!,
		},
		!isEmpty(selectMstCd),
	);

	const form = useAppForm<MasterCodeDto>({
		formName: 'viewMasterCode',
		initialValues: masterCodeInfo,
	});
	const tableForm = useAppForm<{ [key: string]: SubCodeDto[] }>({
		formName: 'subCodeTable',
	});

	const { mutate: updateMasterCode, isPending: isUpdating } = useUpdateMasterCode({
		onSuccess: () => {
			message.success(m(MESSAGE_CODES.COM000004));
			handleCloseDrawer();
		},
		onError: (err) => {
			console.log(err);
			message.error(m(err.errorCode || MESSAGE_CODES.SYSMESSAGE));
		},
	});

	React.useEffect(() => {
		tableForm.setInitialFieldsValue({
			['subCodeTable']: masterCodeInfo?.subCdList?.map((item, index) => ({
				...item,
				key: index,
				procFlag: 'S',
			})),
		});
	}, [masterCodeInfo]);

	function handleCloseDrawer() {
		form.resetFields();
		tableForm.resetFields();
		setSelectedRows([]);
		onClose();
	}

	function handleBeforeCloseModal() {
		const isClean = tableForm.checkUnsavedFormChange(handleCloseDrawer);
		if (!isClean) {
			return;
		}
		form.checkUnsavedFormChange(handleCloseDrawer);
	}

	async function handleSave() {
		const formValue = await form.validateFields();
		const tableValue = (await tableForm.validateFields()) as { [key: string]: SubCodeDto[] };
		const deletedRows = tableRef.current?.getDeletedRows?.() || [];
		const modifiedRows = (tableValue['subCodeTable'] as TableData<SubCodeDto>[]).filter(
			(item: SubCodeDto) => item.procFlag != 'S',
		);

		updateMasterCode({
			coId: authService.getCurrentCompany(),
			...formValue,
			subCdList: [...modifiedRows, ...deletedRows],
		});
	}

	return (
		<CommonFormDrawer<MasterCodeDto>
			form={form}
			initialValues={{
				useFlg: 'Y',
			}}
			open={open}
			title={'Master Code Information'}
			loading={isLoading}
			onClose={handleBeforeCloseModal}
			footer={
				<Flex gap={8}>
					<PermissionGate
						permissions={[
							{ ability: ABILITY_ACTION.SAVE, entity: ABILITY_SUBJECT.MASTER_CODE_MANAGEMENT },
						]}
						variant="hidden"
					>
						<SaveButton loading={isUpdating} onClick={handleSave}>
							Save
						</SaveButton>
					</PermissionGate>
					<CancelButton onClick={handleBeforeCloseModal}>Cancel</CancelButton>
				</Flex>
			}
			tableNode={<SubCodeTable form={tableForm} tableRef={tableRef} />}
		>
			<Flex gap={32} vertical>
				<Flex gap={12} vertical>
					<Row gutter={[16, 16]}>
						<Col span={19}>
							<FormInput
								name="mstCd"
								label="Master Code"
								placeholder="Input Master Code"
								required
								maxLength={20}
								disabled
							/>
						</Col>
						<Col span={4}>
							<Flex align="end" className="h-full">
								<FormCheckbox
									name="useFlg"
									title="Active"
									checkboxMapping={{
										checked: 'Y',
										unchecked: 'N',
									}}
								/>
							</Flex>
						</Col>
					</Row>
					<FormInput
						name="mstNm"
						label="Master Name"
						placeholder="Input Master Name"
						required
						maxLength={100}
					/>
					<FormTextArea name="mstDesc" label="Description" maxLength={500} />
				</Flex>
			</Flex>
		</CommonFormDrawer>
	);
};
