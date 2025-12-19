import { AddButton } from '@/components/buttons';
import { useAppTranslate, useToggle } from '@/hooks';
import { AddMessageDrawer } from '../drawers';
import { PermissionGate } from '@/components/PermissionGate';
import { ABILITY_ACTION, ABILITY_SUBJECT } from '@/constants';

export const AddMessageButton = () => {
	const { t } = useAppTranslate();
	const { isToggle: isOpenAddDrawer, toggle: toggleAddDrawer } = useToggle(false);

	return (
		<PermissionGate
			permissions={[
				{ ability: ABILITY_ACTION.ADD, entity: ABILITY_SUBJECT.MESSAGE_MANAGEMENT },
			]}
			variant="hidden"
		>
			<AddButton type="default" onClick={toggleAddDrawer}>
				{t('Add Message')}
			</AddButton>

			<AddMessageDrawer open={isOpenAddDrawer} onClose={toggleAddDrawer} />
		</PermissionGate>
	);
};

