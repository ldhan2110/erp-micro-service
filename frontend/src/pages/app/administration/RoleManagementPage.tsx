import {
	ProgramFilter,
	ProgramView,
	RoleFilter,
	RoleView,
} from '@/components/modules/administration';
import { PermissionGate } from '@/components/PermissionGate';
import { ABILITY_ACTION, ABILITY_SUBJECT } from '@/constants';
import { usePermission } from '@/hooks';
import type { ProgramListFilterForm, RoleListFilterForm } from '@/types';
import { Flex, Form, Tabs, type TabsProps } from 'antd';
import { observer } from 'mobx-react-lite';
import React from 'react';

const TAB_KEY = {
	ROLE: 'ROLE',
	PGM: 'PGM',
};

const TAB_ITEMS: TabsProps['items'] = [
	{
		key: TAB_KEY.ROLE,
		id: TAB_KEY.ROLE,
		label: 'Role',
		children: <RoleView />,
	},
	{
		key: TAB_KEY.PGM,
		id: TAB_KEY.PGM,
		label: 'Program',
		children: <ProgramView />,
	},
];

const RoleManagementPage = observer(() => {
	const [activeKey, setActiveKey] = React.useState(TAB_KEY.ROLE);
	const { hasAbility } = usePermission();

	// Filters
	const [roleFilterForm] = Form.useForm<RoleListFilterForm>();
	const [pgmFilterForm] = Form.useForm<ProgramListFilterForm>();

	function onTabChange(activeKey: string) {
		setActiveKey(activeKey);
	}

	return (
		<>
			<PermissionGate
				permissions={[
					{
						ability: ABILITY_ACTION.VIEW,
						entity: ABILITY_SUBJECT.ROLE_MANAGEMENT,
					},
				]}
			>
				<Flex vertical>
					{activeKey == 'ROLE' ? (
						<RoleFilter form={roleFilterForm} />
					) : (
						<ProgramFilter form={pgmFilterForm} />
					)}
					<Tabs
						tabBarGutter={8}
						activeKey={activeKey}
						type="card"
						items={TAB_ITEMS.filter((item) => {
							switch (item.key) {
								case TAB_KEY.PGM:
									if (hasAbility(ABILITY_ACTION.VIEW_PROGRAM, ABILITY_SUBJECT.ROLE_MANAGEMENT)) {
										return true;
									}
									return false;
								case TAB_KEY.ROLE:
									if (hasAbility(ABILITY_ACTION.VIEW, ABILITY_SUBJECT.ROLE_MANAGEMENT)) {
										return true;
									}
									return false;
							}
						})}
						onChange={onTabChange}
					/>
				</Flex>
			</PermissionGate>
		</>
	);
});

export default RoleManagementPage;
