import { MessageFilter, MessageTable } from '@/components/modules/system-configuration';
import { PermissionGate } from '@/components/PermissionGate';
import { ABILITY_ACTION, ABILITY_SUBJECT } from '@/constants';
import { Flex } from 'antd';
import { observer } from 'mobx-react-lite';

const MessageManagementPage = observer(() => {
	return (
		<PermissionGate
			permissions={[
				{
					ability: ABILITY_ACTION.VIEW,
					entity: ABILITY_SUBJECT.MESSAGE_MANAGEMENT,
				},
			]}
		>
			<Flex vertical gap={8}>
				<MessageFilter />
				<MessageTable />
			</Flex>
		</PermissionGate>
	);
});

export default MessageManagementPage;

