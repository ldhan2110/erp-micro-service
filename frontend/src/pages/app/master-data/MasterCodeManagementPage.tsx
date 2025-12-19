import { MasterCodeFilter, MasterCodeTable } from '@/components/modules/master-data';
import { PermissionGate } from '@/components/PermissionGate';
import { ABILITY_ACTION, ABILITY_SUBJECT } from '@/constants';
import { Flex } from 'antd';
import { observer } from 'mobx-react-lite';

const MasterCodeManagementPage = observer(() => {
	return (
		<PermissionGate
			permissions={[
				{
					ability: ABILITY_ACTION.VIEW,
					entity: ABILITY_SUBJECT.MASTER_CODE_MANAGEMENT,
				},
			]}
		>
			<Flex vertical gap={8}>
				<MasterCodeFilter />
				<MasterCodeTable />
			</Flex>
		</PermissionGate>
	);
});

export default MasterCodeManagementPage;
