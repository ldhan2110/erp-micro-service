import { Tabs } from 'antd';
import { StarFilled, StarOutlined } from '@ant-design/icons';
import { observer } from 'mobx-react-lite';
import store from '@/stores/AppStore';
import { ROUTES } from '@/utils/routes';
import { useAppTranslate, useFavorites, useShowMessage, useTabUrlSync } from '@/hooks';
import { Suspense, useState } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { LoadingOverlay } from './modules/common';
import { MESSAGE_CODES, TAB_ACTIONS } from '@/constants';
import appStore from '@/stores/AppStore';
import { TabDropdown } from './TabDropdown';
import { SortableTabBarWrapper, SortableTabNode } from './SortableTabBar';
import { useFavoritesStore, useTabsStore } from '@/stores';
import type { Tab } from '@/types';
import React from 'react';

const MainScreen: React.FC = observer(() => {
	const [menuTabKey, setMenuTabKey] = useState<string | null>(null);
	const [refreshKeys, setRefreshKeys] = useState<Record<string, number>>({});
	const { showWarningMessage } = useShowMessage();
	const { t } = useAppTranslate();
	const { state: appState, setSelectedTab, closeTab } = store;

	// Sync tabs with browser URL
	useTabUrlSync();

	// Favorites management
	const { addFavorite, removeFavorite } = useFavorites();
	const isFavorite = useFavoritesStore((state) => state.isFavorite);

	//=========================ZUSTAND STORES===============================
	const checkUnsaveChangeByTab = useTabsStore((state) => state.checkUnsaveChangeByTab);
	const checkFormChangeByTab = useTabsStore((state) => state.checkFormChangeByTab);
	const clearWatchFormListByTab = useTabsStore((state) => state.clearWatchFormListByTab);

	function closeUnsaveTabRecursive(tabList: Tab[]) {
		if (tabList.length == 0) return;
		const currentTabKey = tabList[tabList.length - 1].key;
		setSelectedTab(currentTabKey);
		checkUnsaveChangeByTab(currentTabKey, () => {
			clearWatchFormListByTab(currentTabKey);
			closeTab(currentTabKey);
			tabList.pop();
			closeUnsaveTabRecursive(tabList);
		});
	}

	const handleMenuClick = ({ key }: { key: string }) => {
		if (!menuTabKey) return;
		switch (key) {
			case TAB_ACTIONS.CLOSE: {
				const tabsRemain = appState.openedTabs.filter((tab) => tab.key !== menuTabKey);
				if (tabsRemain.length == 0) {
					showWarningMessage(MESSAGE_CODES.COM000001);
					return;
				}
				checkUnsaveChangeByTab(menuTabKey, () => {
					clearWatchFormListByTab(menuTabKey);
					closeTab(menuTabKey);
				});
				break;
			}
			case TAB_ACTIONS.CLOSE_OTHER: {
				const otherTabs = appState.openedTabs.filter((tab) => tab.key !== menuTabKey);
				const changesTabs = [];
				for (const tab of otherTabs) {
					if (checkFormChangeByTab(tab.key)) {
						changesTabs.push(tab);
					} else closeTab(tab.key);
				}

				if (changesTabs.length > 0) {
					closeUnsaveTabRecursive(changesTabs);
				}
				break;
			}
			case TAB_ACTIONS.REFRESH: {
				setRefreshKeys((prev) => ({
					...prev,
					[menuTabKey!]: (prev[menuTabKey!] || 0) + 1,
				}));
				break;
			}
			case TAB_ACTIONS.ADD_FAVORITE: {
				if (menuTabKey) {
					addFavorite(menuTabKey);
				}
				break;
			}
			case TAB_ACTIONS.REMOVE_FAVORITE: {
				if (menuTabKey) {
					removeFavorite(menuTabKey);
				}
				break;
			}
		}
	};

	return (
		<Tabs
			style={{ padding: 8 }}
			type="editable-card"
			hideAdd
			tabBarGutter={8}
			activeKey={appState.selectedTab.key}
			onChange={setSelectedTab.bind(store)}
			onEdit={(key, action) => {
				if (action === 'remove') {
					const tabsRemain = appState.openedTabs.filter((tab) => tab.key !== key);
					if (tabsRemain.length == 0) {
						showWarningMessage(MESSAGE_CODES.COM000001);
						return;
					}
					checkUnsaveChangeByTab(key as string, () => {
						clearWatchFormListByTab(key as string);
						appStore.closeTab(key as string);
					});
				}
			}}
			renderTabBar={(props, DefaultTabBar) => (
				<SortableTabBarWrapper tabs={appState.openedTabs}>
					<DefaultTabBar {...props}>
						{(node) => {
							const tabKey = node.key as string;
							return (
								<SortableTabNode id={tabKey}>
									<TabDropdown
										tabKey={tabKey}
										node={node}
										handleItemClick={handleMenuClick}
										onOpenCallback={() => setMenuTabKey(node.key)}
									/>
								</SortableTabNode>
							);
						}}
					</DefaultTabBar>
				</SortableTabBarWrapper>
			)}
			items={appState.openedTabs.map((tab) => {
				const page = ROUTES.find((route) => route.key === tab.key)?.content;
				const tabIsFavorite = isFavorite(tab.key);
				const StarIcon = tabIsFavorite ? StarFilled : StarOutlined;
				return {
					key: tab.key,
					label: (
						<div className="flex items-center">
							<StarIcon
								className={`cursor-pointer ${tabIsFavorite ? 'text-yellow-500' : 'text-gray-400'}`}
								onClick={(e) => {
									e.stopPropagation();
									if (tabIsFavorite) {
										removeFavorite(tab.key);
									} else {
										addFavorite(tab.key);
									}
								}}
							/>
							{appState.selectedTab.key != tab.key ? (
								<span
									className="w-[50px] text-center overflow-hidden text-ellipsis whitespace-nowrap inline-block align-middle"
									title={t(tab.label)}
								>
									{t(tab.label)}
								</span>
							) : (
								<span>{t(tab.label)}</span>
							)}
						</div>
					),
					children: (
						<ErrorBoundary handleRefresh={() => handleMenuClick({ key: TAB_ACTIONS.REFRESH })}>
							<Suspense fallback={<LoadingOverlay />}>
								<div
									className="pr-2 overflow-auto max-h-[calc(100vh-140px)]"
									key={refreshKeys[tab.key] || 0} // 👈 force remount on refresh
								>
									{page ? React.cloneElement(page, { params: tab.params }) : null}
								</div>
							</Suspense>
						</ErrorBoundary>
					),
					closable: true,
				};
			})}
		/>
	);
});

export default MainScreen;
