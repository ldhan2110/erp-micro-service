import { AddButton } from "@/components/buttons";
import { useAppTranslate, useToggle } from "@/hooks";
import { AddBatchJobModal } from "../modals";
import { PermissionGate } from "@/components/PermissionGate";
import { ABILITY_ACTION, ABILITY_SUBJECT } from "@/constants";


export const AddBatchJobButton = () => {
    const { t } = useAppTranslate();
    const { isToggle, toggle } = useToggle(false);

    return (
        <>
            <PermissionGate permissions={[
                {
                    ability: ABILITY_ACTION.ADD,
                    entity: ABILITY_SUBJECT.BATCH_JOB_MANAGEMENT,
                },
            ]}
                variant="hidden">
                <AddButton type="default" onClick={toggle}>
                    {t('Add Batch Job')}
                </AddButton>
            </PermissionGate>
            <AddBatchJobModal open={isToggle} onCancel={toggle} />
        </>
    );
};