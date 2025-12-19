import { AddButton } from '@/components/buttons';
import { useAppTranslate, useToggle } from '@/hooks';
import { AddMasterCodeDrawer } from '../drawers';
import { PermissionGate } from '@/components/PermissionGate';
import { ABILITY_ACTION, ABILITY_SUBJECT } from '@/constants';

export const AddMasterCodeButton = () => {
	const { t } = useAppTranslate();
	const { isToggle: isOpenAddDrawer, toggle: toggleAddDrawer } = useToggle(false);

	return (
		<PermissionGate
			permissions={[
				{ ability: ABILITY_ACTION.ADD, entity: ABILITY_SUBJECT.MASTER_CODE_MANAGEMENT },
			]}
			variant="hidden"
		>
			<AddButton type="default" onClick={toggleAddDrawer}>
				{t('Add Master Code')}
			</AddButton>

			<AddMasterCodeDrawer open={isOpenAddDrawer} onClose={toggleAddDrawer} />
		</PermissionGate>
	);
};
