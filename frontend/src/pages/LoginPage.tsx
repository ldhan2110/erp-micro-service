import React from 'react';
import { Form, Input, Button, Card, Typography, Alert, Flex, ConfigProvider } from 'antd';
import type { LoginRequest } from '../types';
import { authStore } from '../stores';
import { useAppTranslate } from '../hooks';

const LoginPage: React.FC = () => {
	const [form] = Form.useForm();
	const { t } = useAppTranslate();

	const onFinish = (values: LoginRequest) => {
		authStore.login({
			...values,
			username: `${values.companyCode}::${values.username}`,
		});
	};

	return (
		<div
			style={{
				minHeight: '100vh',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				background: '#f0f2f5',
			}}
		>
			<ConfigProvider componentSize="middle">
				<Card style={{ width: 350 }}>
					<Typography.Title level={3} style={{ textAlign: 'center' }}>
						Login
					</Typography.Title>

					{authStore.error && (
						<Alert
							message="Login Error"
							description={t(authStore.error)}
							type="error"
							showIcon
							closable
							onClose={() => authStore.clearError()}
							style={{ marginBottom: 16 }}
						/>
					)}

					<Form form={form} layout="vertical" onFinish={onFinish}>
						<Flex vertical gap={24}>
							<Form.Item
								label="Company Code"
								name="companyCode"
								rules={[{ required: true, message: 'Please input your company code!' }]}
							>
								<Input
									placeholder="Enter company code"
									autoComplete="organization"
									style={{
										padding: '4px 11px',
										fontSize: '14px',
									}}
								/>
							</Form.Item>
							<Form.Item
								label="Username"
								name="username"
								rules={[{ required: true, message: 'Please input your username!' }]}
							>
								<Input
									placeholder="Enter username"
									autoComplete="username"
									style={{
										padding: '4px 11px',
										fontSize: '14px',
									}}
								/>
							</Form.Item>
							<Form.Item
								label="Password"
								name="password"
								rules={[{ required: true, message: 'Please input your password!' }]}
							>
								<Input.Password placeholder="Enter password" autoComplete="current-password" />
							</Form.Item>
							<Form.Item>
								<Button type="primary" htmlType="submit" block>
									Login
								</Button>
							</Form.Item>
						</Flex>
					</Form>
				</Card>
			</ConfigProvider>
		</div>
	);
};

export default LoginPage;
