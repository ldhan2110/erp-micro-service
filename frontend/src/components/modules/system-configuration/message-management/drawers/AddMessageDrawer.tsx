import { CancelButton, SaveButton } from '@/components/buttons';
import { CommonFormDrawer } from '@/components/drawer';
import { FormInput, FormSelect, FormTextArea } from '@/components/form';
import { useAppForm, useAppTranslate } from '@/hooks';
import type { ComMsgDto, ComMsgTransDto, EditTableHandler } from '@/types';
import { App, Col, Flex, Row } from 'antd';
import { TranslationTable } from '../tables';
import { useMessageManagementStore } from '@/stores';
import { useAddMessage } from '@/hooks/modules';
import { MESSAGE_CODES } from '@/constants';
import { authService } from '@/services/auth/authJwtService';
import React from 'react';

type AddMessageDrawerProps = {
	open: boolean;
	onClose: () => void;
};

export const AddMessageDrawer = ({ open, onClose }: AddMessageDrawerProps) => {
	const { m } = useAppTranslate();
	const form = useAppForm<ComMsgDto>({ formName: 'addMessage' });
	const tableForm = useAppForm<{ [key: string]: ComMsgTransDto[] }>({ formName: 'translationTable' });
	const { message } = App.useApp();

	// Edit Table Refs
	const tableRef = React.useRef<EditTableHandler<ComMsgTransDto> | null>(null);

	// Zustands
	const setSelectedRows = useMessageManagementStore((state) => state.setSelectedRows);

	// Hooks
	const { mutate: createMessage, isPending: isCreating } = useAddMessage({
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
		const tableValue = (await tableForm.validateFields()) as { [key: string]: ComMsgTransDto[] };
		createMessage({
			coId: authService.getCurrentCompany(),
			...formValue,
			translations: tableValue['translationTable'],
		});
	}

	return (
		<CommonFormDrawer<ComMsgDto>
			form={form}
			initialValues={{
				mdlNm: 'COM',
				msgTpVal: 'INFO',
			}}
			open={open}
			title={'Add Message'}
			onClose={handleBeforeCloseModal}
			footer={
				<Flex gap={8}>
					<SaveButton loading={isCreating} onClick={handleSave}>
						Save
					</SaveButton>
					<CancelButton onClick={handleBeforeCloseModal}>Cancel</CancelButton>
				</Flex>
			}
			tableNode={<TranslationTable form={tableForm} tableRef={tableRef} />}
		>
			<Flex gap={32} vertical>
				<Flex gap={12} vertical>
					<Row gutter={[16, 16]}>
						<Col span={12}>
							<FormInput
								name="msgId"
								label="Message ID"
								placeholder="Enter Message ID (e.g., COM000001)"
								required
								maxLength={20}
							/>
						</Col>
						<Col span={6}>
							<FormSelect
								name="mdlNm"
								label="Module"
								required
								options={[
									{ label: 'Common', value: 'COM' },
									{ label: 'Admin', value: 'ADM' },
									{ label: 'Master', value: 'MST' },
									{ label: 'System Configuration', value: 'SYS' },
								]}
							/>
						</Col>
						<Col span={6}>
							<FormSelect
								name="msgTpVal"
								label="Type"
								required
								options={[
									{ label: 'Info', value: 'INFO' },
									{ label: 'Warning', value: 'WARN' },
									{ label: 'Error', value: 'ERROR' },
									{ label: 'Success', value: 'SUCCESS' },
								]}
							/>
						</Col>
					</Row>
					<FormTextArea
						name="dfltMsgVal"
						label="Default Message"
						placeholder="Enter Default Message"
						required
						maxLength={500}
						rows={3}
					/>
				</Flex>
			</Flex>
		</CommonFormDrawer>
	);
};

