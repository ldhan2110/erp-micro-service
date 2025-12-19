import React from 'react';
import { MenuFoldOutlined, MenuUnfoldOutlined, StarFilled } from '@ant-design/icons';
import { Button, Flex, Image, Menu, theme } from 'antd';
import { ICON_ROUTES, ROUTES } from '../utils/routes';
import { observer } from 'mobx-react-lite';
import appStore from '../stores/AppStore';
import { useAppTranslate } from '../hooks';
import { useGetProgramList } from '@/hooks/modules';
import { authService } from '@/services/auth/authJwtService';
import { buildMenuProgramTree } from '@/utils/helper';
import type { ProgramTree } from '@/types';
import { authStore, useFavoritesStore } from '@/stores';
import { VIEW_PERMISSION_CODE } from '@/constants';

const SideBarMenu: React.FC = observer(() => {
	const { openTab, state } = appStore;
	const { t, changeLanguage } = useAppTranslate();
	const [collapsed, setCollapsed] = React.useState(true);
	const { token } = theme.useToken();
	const favorites = useFavoritesStore((state) => state.favorites);
	
	// Load the current active menu tree
	const { data: programList } = useGetProgramList({
		coId: authService.getCurrentCompany()!,
		useFlg: 'Y',
	});

	// Set the language based on the app state
	React.useEffect(() => {
		changeLanguage(state.lang);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [state.lang]);

	const toggleCollapsed = () => {
		setCollapsed(!collapsed);
	};

	function filterProgramByRoleAuth(nodes: ProgramTree[]) {
		return nodes.filter((node) => {
			const roleAuthList = authStore.role?.roleAuthList || [];
			const isAllow = roleAuthList.findIndex(
				(item) => item.pgmId == node.pgmId && item.permCd == VIEW_PERMISSION_CODE,
			);
			if (isAllow != -1) return true;
			return false;
		});
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	function translateMenuItems(items: any[]): any[] {
		return items.map((item) => ({
			...item,
			label: t(item?.label),
			children: item.children ? translateMenuItems(item.children) : undefined,
		}));
	}

	function handleOpenMenu({ key }: { key: string }) {
		const selectedItem = ROUTES.find((item) => item.key === key);
		if (selectedItem) {
			openTab(selectedItem);
		}
	}

	// Build favorites menu items as children - always use star icon for favorites
	const favoritesChildren = favorites.map((favorite) => {
		const route = ROUTES.find((r) => r.key === favorite.pgmCd);
		return {
			key: favorite.pgmCd,
			label: route ? t(route.label) : favorite.pgmCd,
			icon: <StarFilled />,
		};
	});

	// Build main menu items
	const mainMenuItems = translateMenuItems(
		buildMenuProgramTree(
			filterProgramByRoleAuth(
				programList?.programList?.map((item) => ({
					...item,
					key: item.pgmCd!,
					label: item.pgmNm,
					icon: ICON_ROUTES[item.pgmCd!],
				})) || [],
			),
		),
	);

	// Build favorites menu item (collapsible) - always show, even if empty
	const favoritesMenu = {
		key: 'favorites',
		label: t('Favorites'),
		icon: <StarFilled />,
		children: favoritesChildren.length > 0 ? translateMenuItems(favoritesChildren) : undefined,
	};

	// Combine all menu items with divider before favorites
	const allMenuItems = [
		...mainMenuItems,
		favoritesMenu,
	];

	return (
		<div
			className={`h-full ${
				collapsed ? 'w-[80px]' : 'w-64'
			} shadow-lg transition-width duration-300 float-left`}
			style={{ backgroundColor: token.colorBgContainer }}
		>
			<Flex
				align="center"
				justify={collapsed ? 'center' : 'none'}
				gap={10}
				className="p-4 h-16 w-full text-white"
			>
				<Button size="middle" type="primary" onClick={toggleCollapsed} className="ml-1">
					{collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
				</Button>
				{!collapsed && (
					<Image
						className="mt-1"
						width={80}
						preview={false}
						src="https://itviec.com/rails/active_storage/representations/proxy/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBNGtvUkE9PSIsImV4cCI6bnVsbCwicHVyIjoiYmxvYl9pZCJ9fQ==--b6891a9acd6631e048ebc560edcf2d9ad1080348/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaDdCem9MWm05eWJXRjBTU0lJYW5CbkJqb0dSVlE2RkhKbGMybDZaVjkwYjE5c2FXMXBkRnNIYVFJc0FXa0NMQUU9IiwiZXhwIjpudWxsLCJwdXIiOiJ2YXJpYXRpb24ifX0=--1b8988b96ed4a58d3628eb3340c8b231786ccfc0/435564703_825801186235641_1729614210919770326_n.jpg"
					/>
				)}
			</Flex>
			<div className="overflow-y-auto h-[calc(100vh-64px)]">
				<Menu
					mode="inline"
					theme="light"
					selectedKeys={[state.selectedTab.key]}
					inlineCollapsed={collapsed}
					items={allMenuItems}
					onClick={handleOpenMenu}
				/>
			</div>
		</div>
	);
});

export default SideBarMenu;
