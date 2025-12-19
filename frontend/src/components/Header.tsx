import {
	LogoutOutlined,
	SettingOutlined,
	UserOutlined,
} from '@ant-design/icons';
import {
	Avatar,
	Divider,
	Dropdown,
	Flex,
	theme,
} from 'antd';
import { observer } from 'mobx-react-lite';
import React, { useMemo, useState } from 'react';
import { useAppTranslate, useFavorites } from '../hooks';
import { authStore } from '../stores';
import { SettingModal } from './modules/common/modals/setting-modals';
import { DebugButton, ExportHistoryButton, FavoritesList, MessageHistoryButton, NotificationButton } from './modules/common';
import ProgramSearchAutoComplete from './ProgramSearchAutoComplete';

const Header: React.FC = observer(() => {
	const { t } = useAppTranslate();
	const [settingModalVisible, setSettingModalVisible] = useState(false);
	const { token } = theme.useToken();
	
	// Load favorites on mount
	useFavorites();

	// Check if the URL has the mode=DEBUG parameter
	const isDebugMode = () => {
		return new URLSearchParams(window.location.search).get('mode') === 'debug';
	};

	let rawSub = authStore.user?.sub;

	// Try reading from localStorage if store is empty
	if (!rawSub) {
		rawSub = localStorage.getItem('userSub') || 'Unknown User';
	} else {
		// Store it for later use
		localStorage.setItem('userSub', rawSub);
	}
	const userId = rawSub.includes('::') ? rawSub.split('::')[1] : rawSub;
	const avatarLetter = userId.charAt(0).toUpperCase();
	const userName = authStore.user?.userInfo?.usrNm;

	// Random background color using useMemo so it doesn't change every render
	const randomBgColor = useMemo(() => {
		const randomColor = () =>
			'#' +
			Math.floor(Math.random() * 16777215)
				.toString(16)
				.padStart(6, '0');
		return randomColor();
	}, []);

	const onMenuClick = ({ key }: { key: string }) => {
		if (key === 'settings') return setSettingModalVisible(true);
		if (key === 'logout') return authStore.logout();
	};

	const userMenuItems = [
		{ key: 'profile', icon: <UserOutlined />, label: t('Profile') },
		{ key: 'settings', icon: <SettingOutlined />, label: t('Setting') },
		{ type: 'divider' as const },
		{
			key: 'logout',
			icon: <LogoutOutlined />,
			label: t('Logout'),
			danger: true,
		},
	];

	return (
		<>
			<div className="shadow-md h-16 px-4 flex items-center justify-between" style={{ backgroundColor: token.colorBgContainer }}>
				<ProgramSearchAutoComplete />
				<Flex justify="end" gap={4}>
					<Flex gap={8} style={{ alignItems: 'center' }}>
						{/* Debug Icon cho mobile - chỉ hiển thị khi có param mode=DEBUG */}
						{isDebugMode() && <DebugButton />}
						<FavoritesList />
						<ExportHistoryButton />
						<MessageHistoryButton />
						<NotificationButton />
					</Flex>
					<Flex justify="center" align="center" gap={2}>
						<Divider type="vertical" size="middle" />
					</Flex>
					<Dropdown
						menu={{ items: userMenuItems, onClick: onMenuClick }}
						trigger={['click']}
						placement="bottomRight"
						getPopupContainer={(triggerNode) => triggerNode.parentElement || document.body}
					>
						<div
							className="flex items-center text-gray-700 cursor-pointer select-none self-center"
							tabIndex={0}
						>
							<Avatar style={{ backgroundColor: randomBgColor, cursor: 'pointer' }}>
								{avatarLetter}
							</Avatar>
							<span className="ml-2" style={{ color: token.colorText }}>
								Hi, <span className="font-bold" >{userName}</span>
							</span>
						</div>
					</Dropdown>
				</Flex>
			</div>

			<SettingModal
				isOpen={settingModalVisible}
				handleClose={() => {
					setSettingModalVisible(false);
				}}
			/>
		</>
	);
});

export default Header;
