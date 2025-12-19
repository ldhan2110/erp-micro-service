import CustomTable from "@/components/custom-table/CustomTable";
import { useAppTranslate } from "@/hooks";
import { useGetBatchJobHistoryList } from "@/hooks/modules";
import { authStore } from "@/stores";
import { useBatchJobStore } from "@/stores/modules/common";
import type { BatchJobConfigDto, SORT, TableColumn } from "@/types";
import { convertToDBColumn, formatDate } from "@/utils/helper";
import { Tag } from "antd";
import { isEmpty } from "lodash";

export const BatchJobHistoryTable = () => {
    const { t } = useAppTranslate();

    // Zustands
    const searchHistoryCondition = useBatchJobStore(state => state.searchHistoryCondition);
    const rowSelectionId = useBatchJobStore(state => state.selectedRowId);
    const setHistoryPagination = useBatchJobStore(state => state.setHistoryPagination);
    const setHistorySort = useBatchJobStore(state => state.setHistorySort);


    // Hooks 
    const { data: batchJobHistoryList, isLoading } = useGetBatchJobHistoryList({
        batJbId: rowSelectionId,
        coId: authStore.user?.userInfo.coId,
        pagination: searchHistoryCondition.pagination,
        sort: searchHistoryCondition.sort,
    }, !isEmpty(rowSelectionId));

    //=========================COLUMNS DEFINITIONS===============================
    const columns: TableColumn<BatchJobConfigDto>[] = [
        {
            key: 'batJbStsCd',
            title: 'Status',
            dataIndex: 'batJbStsCd',
            align: 'center',
            width: 100,
            sorter: true,
            render: (value: string) => {
                switch (value) {
                    case 'COMPLETED':
                        return <Tag color="success">{t('COMPLETED')}</Tag>
                    case 'PAUSED':
                        return <Tag color="warning">{t('PAUSED')}</Tag>
                    case 'RUNNING':
                        return <Tag color="processing">{t('RUNNING')}</Tag>
                    case 'FAILED':
                        return <Tag color="error">{t('FAILED')}</Tag>
                }
            }

        },
        {
            key: 'batJbStDt',
            title: 'Start Date',
            dataIndex: 'batJbStDt',
            sorter: true,
            width: 100,
            render: (value) => formatDate(value, true),
        },
        {
            key: 'batJbEndDt',
            title: 'End Date',
            dataIndex: 'batJbEndDt',
            sorter: true,
            width: 100,
            render: (value) => formatDate(value, true),
        },
        {
            key: 'batJbMsg',
            title: 'Log Message',
            dataIndex: 'batJbMsg',
            sorter: true,
            ellipsis: true,
            width: 250,
        },
        {
            key: 'updDt',
            title: 'Updated Date',
            dataIndex: 'updDt',
            sorter: true,
            width: 130,
            render: (value) => formatDate(value, true),
        },
        {
            key: 'updUsrId',
            title: 'Updated By',
            dataIndex: 'updUsrId',
            width: 120,
            sorter: true,
        },
    ];

    function handleSortChange(sortField: string | undefined, sortType: SORT | undefined) {
        setHistorySort({
            sortField: convertToDBColumn(sortField as string),
            sortType,
        });
    }

    return (
        <>
            <CustomTable<any>
                columns={columns}
                headerOffset={390}
                data={batchJobHistoryList?.executionHistory?.map((item, index) => ({
                    ...item,
                    key: index,
                    procFlag: 'S'
                })) ?? []}
                onPaginationChange={setHistoryPagination}
                onSortChange={handleSortChange}
                loading={isLoading}
                tableState={{
                    pagination: {
                        ...searchHistoryCondition.pagination,
                        total: batchJobHistoryList?.total || 0,
                    },
                }}
            />
        </>
    );
}