import React, { type ReactNode } from 'react';
import { AppstoreOutlined, HomeOutlined, SettingOutlined, TeamOutlined } from '@ant-design/icons';

const DefaultPage = React.lazy(() => import('@/pages/app/DefaultPage'));
const UserManagementPage = React.lazy(
	() => import('@/pages/app/administration/UserManagementPage'),
);
const RoleManagementPage = React.lazy(
	() => import('@/pages/app/administration/RoleManagementPage'),
);
const BatchJobManagementPage = React.lazy(
	() => import('@/pages/app/system-configuration/BatchJobManagementPage'),
);
const MessageManagementPage = React.lazy(
	() => import('@/pages/app/system-configuration/MessageManagementPage'),
);
const MasterCodeManagementPage = React.lazy(
	() => import('@/pages/app/master-data/MasterCodeManagementPage'),
);

export const ROUTE_KEYS = {
	// Default
	MAIN: 'MAIN',
	ADMIN: {
		USER_MANAGEMENT: 'ADM_0001',
		ROLE_MANAGEMENT: 'ADM_0002',
	},
	MST: {
		MASTER_CODE_MANAGEMENT: 'MST_0001',
	},
	SYS: {
		MESSAGE_MANAGEMENT: 'SYS_0001',
		BATCH_JOB_MANAGEMENT: 'SYS_0002',
	},
};

// Constants for UI Registration
export const ROUTES = [
	{
		key: ROUTE_KEYS.MAIN,
		label: 'Main',
		content: <DefaultPage />,
	},
	{
		key: ROUTE_KEYS.ADMIN.USER_MANAGEMENT,
		label: 'User Management',
		content: <UserManagementPage />,
	},
	{
		key: ROUTE_KEYS.ADMIN.ROLE_MANAGEMENT,
		label: 'Role Management',
		content: <RoleManagementPage />,
	},
	{
		key: ROUTE_KEYS.MST.MASTER_CODE_MANAGEMENT,
		label: 'Master Code Management',
		content: <MasterCodeManagementPage />,
	},
	{
		key: ROUTE_KEYS.SYS.MESSAGE_MANAGEMENT,
		label: 'Message Management',
		content: <MessageManagementPage />,
	},
	{
		key: ROUTE_KEYS.SYS.BATCH_JOB_MANAGEMENT,
		label: 'Batch Job Management',
		content: <BatchJobManagementPage />,
	},
];

export const ICON_ROUTES: { [key: string]: ReactNode } = {
	ADM: <TeamOutlined />,
	MST: <SettingOutlined />,
	SYS: <AppstoreOutlined />,
	MAIN: <HomeOutlined />,
};
