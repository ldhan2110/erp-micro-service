import { CancelButton, SaveButton } from '@/components/buttons';
import { CommonFormDrawer } from '@/components/drawer';
import { FormCheckbox, FormInput, FormTextArea } from '@/components/form';
import { useAppForm, useAppTranslate } from '@/hooks';
import type { EditTableHandler, MasterCodeDto, SubCodeDto } from '@/types';
import { App, Col, Flex, Row } from 'antd';
import { SubCodeTable } from '../tables';
import { useMasterCodeManagementStore } from '@/stores';
import { useAddMasterCode } from '@/hooks/modules';
import { MESSAGE_CODES } from '@/constants';
import { authService } from '@/services/auth/authJwtService';
import React from 'react';

type AddMasterCodeDrawerProps = {
	open: boolean;
	onClose: () => void;
};

export const AddMasterCodeDrawer = ({ open, onClose }: AddMasterCodeDrawerProps) => {
	const { m } = useAppTranslate();
	const form = useAppForm<MasterCodeDto>({ formName: 'addMasterCode' });
	const tableForm = useAppForm<{ [key: string]: SubCodeDto[] }>({ formName: 'subCodeTable' });
	const { message } = App.useApp(); // ✅ use the context-aware version

	// Edit Table Refs
	const tableRef = React.useRef<EditTableHandler<SubCodeDto> | null>(null);

	// Zustands
	const setSelectedRows = useMasterCodeManagementStore((state) => state.setSelectedRows);

	// Hooks
	const { mutate: createMasterCode, isPending: isCreating } = useAddMasterCode({
		onSuccess: () => {
			message.success(m(MESSAGE_CODES.COM000004));
			handleCloseDrawer();
		},
		onError: (err) => {
			console.log(err);
			message.error(m(err.errorCode || MESSAGE_CODES.SYSMESSAGE));
		},
	});

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
		createMasterCode({
			coId: authService.getCurrentCompany(),
			...formValue,
			subCdList: tableValue['subCodeTable'],
		});
	}

	return (
		<CommonFormDrawer<MasterCodeDto>
			form={form}
			initialValues={{
				useFlg: 'Y',
			}}
			open={open}
			title={'Add Master Code'}
			onClose={handleBeforeCloseModal}
			footer={
				<Flex gap={8}>
					<SaveButton loading={isCreating} onClick={handleSave}>
						Save
					</SaveButton>
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
