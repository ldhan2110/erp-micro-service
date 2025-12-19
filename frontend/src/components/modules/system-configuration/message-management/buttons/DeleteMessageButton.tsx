import { DeleteButton } from '@/components/buttons';
import { useAppTranslate, useShowMessage } from '@/hooks';
import { PermissionGate } from '@/components/PermissionGate';
import { ABILITY_ACTION, ABILITY_SUBJECT, MESSAGE_CODES } from '@/constants';
import { message } from 'antd';
import { useDeleteMessage } from '@/hooks/modules';
import { useMessageManagementStore } from '@/stores';

export const DeleteMessageButton = () => {
	const { t, m } = useAppTranslate();
    const { showConfirmMessage } = useShowMessage();

    // Zustand
    const rowMsgSelection = useMessageManagementStore((state) => state.rowMsgSelection);
    const setRowMsgSelection = useMessageManagementStore((state) => state.setRowMsgSelection);

    // Hooks
    const { mutate: deleteMessage, isPending: isDeleting } = useDeleteMessage({
        onSuccess: () => {
			message.success(m(MESSAGE_CODES.ADM000004));
			setRowMsgSelection([]);
		},
		onError: (err) => {
			console.log(err);
			message.error(m(err.errorCode || MESSAGE_CODES.SYSMESSAGE));
		},
    });
	
    function handleDeleteMessage() {
        showConfirmMessage(m(MESSAGE_CODES.COM000006), () => {
            deleteMessage(rowMsgSelection);
        });
    }

	return (
		<PermissionGate
			permissions={[
				{ ability: ABILITY_ACTION.DELETE, entity: ABILITY_SUBJECT.MESSAGE_MANAGEMENT },
			]}
			variant="hidden"
		>
			<DeleteButton hidden={rowMsgSelection.length === 0} onClick={handleDeleteMessage} loading={isDeleting}>
				{t('Delete Message')}
			</DeleteButton>
		</PermissionGate>
	);
};

