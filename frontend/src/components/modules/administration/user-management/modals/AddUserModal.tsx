import { FormCheckbox, FormInput, FormSelect, FormTextArea } from '@/components/form';
import { CommonFormModal } from '@/components/modals';
import { MESSAGE_CODES } from '@/constants';
import { useAppTranslate, useAppForm } from '@/hooks';
import { useAddUser, useGetRoleList } from '@/hooks/modules';
import { authService } from '@/services/auth/authJwtService';
import { authStore } from '@/stores';
import { type UserInfoDto } from '@/types';
import { App, Col, Flex, Row } from 'antd';

type AddUserModalProps = {
	open: boolean;
	onCancel: () => void;
};

export const AddUserModal = ({ open, onCancel }: AddUserModalProps) => {
	const { m } = useAppTranslate();
	const form = useAppForm<UserInfoDto>({ formName: 'addUser' });
	const { message } = App.useApp(); // ✅ use the context-aware version

	// Hooks
	const { data: roleList, isLoading: isLoadingRole } = useGetRoleList({
		coId: authStore.user?.userInfo.coId,
		useFlg: 'Y',
	});

	const { mutate: createUser, isPending: isCreating } = useAddUser({
		onSuccess: () => {
			message.success(m(MESSAGE_CODES.COM000004));
			handleCloseModal();
		},
		onError: (err) => {
			console.log(err);
			message.error(m(err.errorCode || MESSAGE_CODES.SYSMESSAGE));
		},
	});

	async function handleAddNewUser() {
		try {
			const formValues = await form.validateFields();
			await createUser({
				coId: authService.getCurrentCompany()!,
				...formValues,
			});
		} catch {
			return;
		}
	}

	function handleCloseModal() {
		form.resetFields();
		onCancel();
	}

	function handleBeforeCloseModal() {
		form.checkUnsavedFormChange(handleCloseModal);
	}

	return (
		<CommonFormModal
			title="Add New User"
			open={open}
			form={form}
			onConfirm={handleAddNewUser}
			onCancel={handleBeforeCloseModal}
			width={400}
			okText={'Save'}
			cancelText={'Close'}
			confirmLoading={isCreating}
			loading={isLoadingRole}
			initialValues={{
				useFlg: 'Y',
			}}
		>
			<Flex gap={12} className="!mt-4" vertical>
				<Row gutter={[16, 16]}>
					<Col span={19}>
						<FormInput
							name="usrId"
							label="User ID"
							placeholder="Input User ID"
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
				<FormSelect
					name="roleId"
					label="Role"
					placeholder="Select User Role"
					required
					maxLength={100}
					options={roleList?.roleList!.map((role) => ({
						label: role.roleNm,
						value: role.roleId,
					}))}
				/>
				<FormInput
					name="usrNm"
					label="Full Name"
					placeholder="Input User Name"
					required
					maxLength={100}
				/>
				<FormInput
					name="usrEml"
					label="Email"
					placeholder="Input User Email"
					required
					maxLength={100}
				/>
				<FormInput
					name="usrPhn"
					label="Phone Number"
					placeholder="Input Phone Number"
					maxLength={20}
				/>
				<FormTextArea name="usrDesc" label="Remark" maxLength={500} />
			</Flex>
		</CommonFormModal>
	);
};
