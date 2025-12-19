import { BatchJobFilter, BatchJobHistoryTable, BatchJobTable } from "@/components/modules/system-configuration";
import { PermissionGate } from "@/components/PermissionGate";
import { ABILITY_ACTION, ABILITY_SUBJECT } from "@/constants";
import { Flex, Form } from "antd";
import { observer } from "mobx-react-lite";

const BatchJobManagementPage = observer(() => {
    const [form] = Form.useForm();

    return <>
        <PermissionGate
            permissions={[
                {
                    ability: ABILITY_ACTION.VIEW,
                    entity: ABILITY_SUBJECT.BATCH_JOB_MANAGEMENT,
                },
            ]}
        >
            <Flex gap={8} vertical>
                <BatchJobFilter form={form} />
                <BatchJobTable />
                <BatchJobHistoryTable />
            </Flex>
        </PermissionGate>

    </>
});

export default BatchJobManagementPage;