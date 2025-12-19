import { CancelButton, SaveButton } from '@/components/buttons';
import { CommonFormDrawer } from '@/components/drawer';
import { FormInput, FormSelect, FormTextArea } from '@/components/form';
import { useAppForm, useAppTranslate } from '@/hooks';
import type { ComMsgDto, ComMsgTransDto, EditTableHandler, TableData } from '@/types';
import { App, Col, Flex, Row } from 'antd';
import { TranslationTable } from '../tables';
import { authStore, useMessageManagementStore } from '@/stores';
import { useGetMessage, useUpdateMessage } from '@/hooks/modules';
import { ABILITY_ACTION, ABILITY_SUBJECT, MESSAGE_CODES } from '@/constants';
import { authService } from '@/services/auth/authJwtService';
import { isEmpty } from 'lodash';
import React from 'react';
import { PermissionGate } from '@/components/PermissionGate';

type ViewMessageDrawerProps = {
	open: boolean;
	onClose: () => void;
};

export const ViewMessageDrawer = ({ open, onClose }: ViewMessageDrawerProps) => {
	const { m } = useAppTranslate();
	const { message } = App.useApp();

	// Edit Table Refs
	const tableRef = React.useRef<EditTableHandler<ComMsgTransDto> | null>(null);

	// Zustands
	const selectMsgId = useMessageManagementStore((state) => state.selectMsgId);
	const setSelectedRows = useMessageManagementStore((state) => state.setSelectedRows);

	// Hooks
	const { data: messageInfo, isLoading } = useGetMessage(
		{
			coId: authStore.user?.userInfo.coId,
			msgId: selectMsgId!,
		},
		!isEmpty(selectMsgId),
	);

	const form = useAppForm<ComMsgDto>({
		formName: 'viewMessage',
		initialValues: messageInfo,
	});
	const tableForm = useAppForm<{ [key: string]: ComMsgTransDto[] }>({
		formName: 'translationTable',
	});

	const { mutate: updateMessageMutation, isPending: isUpdating } = useUpdateMessage({
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
			['translationTable']: messageInfo?.translations?.map((item, index) => ({
				...item,
				key: index,
				procFlag: 'S',
			})),
		});
	}, [messageInfo]);

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
		const deletedRows = tableRef.current?.getDeletedRows?.() || [];
		const modifiedRows = (tableValue['translationTable'] as TableData<ComMsgTransDto>[]).filter(
			(item: ComMsgTransDto) => item.procFlag != 'S',
		);

		updateMessageMutation({
			coId: authService.getCurrentCompany(),
			...formValue,
			translations: [...modifiedRows, ...deletedRows],
		});
	}

	return (
		<CommonFormDrawer<ComMsgDto>
			form={form}
			initialValues={{}}
			open={open}
			title={'Message Information'}
			loading={isLoading}
			onClose={handleBeforeCloseModal}
			footer={
				<Flex gap={8}>
					<PermissionGate
						permissions={[
							{ ability: ABILITY_ACTION.SAVE, entity: ABILITY_SUBJECT.MESSAGE_MANAGEMENT },
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
			tableNode={<TranslationTable form={tableForm} tableRef={tableRef} />}
		>
			<Flex gap={32} vertical>
				<Flex gap={12} vertical>
					<Row gutter={[16, 16]}>
						<Col span={12}>
							<FormInput
								name="msgId"
								label="Message ID"
								placeholder="Message ID"
								required
								maxLength={20}
								disabled
							/>
						</Col>
						<Col span={6}>
							<FormSelect
								name="mdlNm"
								label="Module"
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
						maxLength={500}
						rows={3}
					/>
				</Flex>
			</Flex>
		</CommonFormDrawer>
	);
};

