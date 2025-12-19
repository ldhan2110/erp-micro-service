import React, { type ReactNode } from 'react';
import { Drawer, Flex, Form, type FormInstance } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import type { Store } from 'antd/es/form/interface';

export interface CommonDrawerProps<T> {
	open: boolean;
	title: string;
	width?: number;
	footer?: React.ReactNode;
	children: React.ReactNode;
	form: FormInstance<T>;
	initialValues?: Store;
	loading?: boolean;
	tableNode?: ReactNode;
	onClose: () => void;
}

export const CommonFormDrawer = <T,>({
	open,
	title,
	width = 720,
	footer,
	form,
	initialValues,
	children,
	loading,
	tableNode,
	onClose,
}: CommonDrawerProps<T>) => {
	return (
		<Drawer
			closable={false}
			title={<div className="font-bold text-lg">{title}</div>}
			width={width}
			onClose={onClose}
			open={open}
			footer={footer}
			destroyOnHidden
			forceRender
			loading={loading}
			size={'default'}
			extra={<CloseOutlined onClick={onClose} className="text-lg cursor-pointer" />}
		>
			<Flex gap={16} vertical>
				<Form layout="vertical" form={form} initialValues={initialValues}>
					{children}
				</Form>
				{tableNode}
			</Flex>
		</Drawer>
	);
};
