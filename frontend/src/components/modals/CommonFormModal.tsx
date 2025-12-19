import type { ABILITY_ACTION, ABILITY_SUBJECT } from '@/constants';
import { useAppTranslate, usePermission } from '@/hooks';
import { SaveOutlined } from '@ant-design/icons';
import { Form, Modal, type ModalProps } from 'antd';
import type { Store } from 'antd/es/form/interface';
import type { FormInstance } from 'antd/lib';
import type { ReactElement } from 'react';

type CommonFormModalProps<T> = ModalProps & {
	title: string;
	open: boolean;
	children: ReactElement;
	form: FormInstance<T>;
	initialValues?: Store;
	savePermission?: { action: ABILITY_ACTION; subject: ABILITY_SUBJECT };
	onConfirm: () => void;
	onCancel: () => void;
};

export const CommonFormModal = <T,>({
	open,
	title,
	children,
	form,
	initialValues,
	savePermission,
	onConfirm,
	onCancel,
	...props
}: CommonFormModalProps<T>) => {
	const { t } = useAppTranslate();
	const { hasAbility } = usePermission();

	return (
		<Modal
			title={t(title)}
			open={open}
			onOk={onConfirm}
			onCancel={onCancel}
			okText="Save"
			cancelText="Close"
			centered
			okButtonProps={{
				icon: <SaveOutlined />,
				hidden: savePermission
					? hasAbility(savePermission.action, savePermission.subject)
						? false
						: true
					: false,
			}}
			{...props}
		>
			<Form layout="vertical" form={form} initialValues={initialValues}>
				{children}
			</Form>
		</Modal>
	);
};
