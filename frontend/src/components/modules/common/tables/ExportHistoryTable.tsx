import CustomTable from "@/components/custom-table/CustomTable";
import { useAppTranslate } from "@/hooks";
import { useGetExportHistoryList } from "@/hooks/modules";
import { cancelExportAsync, confirmExportAsync, downloadFileAndSave } from "@/services/api";
import { useExportHistoryStore } from "@/stores/modules/common";
import type { ExportJobDto, TableColumn, TableData } from "@/types";
import { formatDate } from "@/utils/helper";
import { CloseOutlined, DownloadOutlined, RedoOutlined } from "@ant-design/icons";
import { Button, Flex, message, Progress, Tag } from "antd";
import { isEmpty } from "lodash";
import React from "react";

export const ExportHistoryTable = ({ enabled }: { enabled: boolean }) => {
    const { t } = useAppTranslate();

    // Zustands
    const searchCondition = useExportHistoryStore((state) => state.search);

    // Hooks
    const { data: exportHistoryList, isLoading: loading } = useGetExportHistoryList({
        ...searchCondition.filter,
        sort: searchCondition.sort,
        pagination: searchCondition.pagination,
    }, enabled);

    // Transform data for table
    const tableData = React.useMemo(() => {
        return exportHistoryList?.jobs?.map((item, index) => ({
            ...item,
            key: index,
            procFlag: 'S'
        })) || [];
    }, [exportHistoryList]);


    function handleDownloadFile(fileId: string) {
        if (isEmpty(fileId)) {
            message.warning("Not Found File");
            return;
        }
        downloadFileAndSave(fileId)
    }

    const columns: TableColumn<ExportJobDto>[] = [
        {
            key: 'fileNm',
            title: 'File Name',
            dataIndex: 'fileNm',
            width: 200,
            sorter: false,
            draggable: false,
        },
        {
            key: 'jbSts',
            title: 'Status',
            dataIndex: 'jbSts',
            width: 150,
            sorter: false,
            draggable: false,
            render: (value: string) => {
                switch (value) {
                    case 'COMPLETED':
                        return <Tag color="success">{t('Completed')}</Tag>
                    case 'FAILED':
                        return <Tag color="error">{t('Failed')}</Tag>
                    case 'PENDING_CONFIRMATION':
                        return <Tag color="yellow">{t('Waiting for Confirmation')}</Tag>
                    case 'QUEUED':
                        return <Tag color="yellow">{t('Queued')}</Tag>
                    case 'CANCELLED':
                        return <Tag color="default">{t('Cancelled')}</Tag>
                    case 'PROCESSING':
                        return <Tag color="processing">{t('Processing')}</Tag>
                    default:
                        return <Tag color="default">{t('Unknown')}</Tag>
                }
            }
        },
        {
            key: 'jbProg',
            title: 'Progress',
            dataIndex: 'jbProg',
            width: 200,
            sorter: false,
            draggable: false,
            render: (value: string) => {
                return <Progress percent={Number(value)} />
            }
        },
        {
            key: 'creUsrId',
            title: 'Created User',
            dataIndex: 'creUsrId',
            width: 100,
            sorter: false,
            draggable: false,
        },
        {
            key: 'creDt',
            title: 'Created Date',
            dataIndex: 'creDt',
            width: 120,
            sorter: false,
            draggable: false,
            render: (value) => formatDate(value, true),
        },
        {
            key: 'action',
            title: 'Actions',
            dataIndex: 'action',
            fixed: "right",
            width: 150,
            sorter: false,
            draggable: false,
            render: (_value, record) => {
                switch (record.jbSts) {
                    case 'PENDING_CONFIRMATION':
                        return (
                            <Flex gap={8}>
                                <Button icon={<RedoOutlined />} onClick={async () => await confirmExportAsync(record.jbId || '')}>
                                    Retry
                                </Button >
                                <Button icon={<CloseOutlined />} onClick={async () => await cancelExportAsync(record.jbId || '')}>
                                    Cancel
                                </Button >
                            </Flex>

                        )
                    default:
                        return (
                            <Button
                                icon={<DownloadOutlined />}
                                onClick={() => handleDownloadFile(record.fileId!)} disabled={record.jbSts !== 'COMPLETED'}>
                                Download
                            </Button>
                        )
                }
            }
        },
    ];

    return (
        <CustomTable<ExportJobDto>
            columns={columns}
            loading={loading}
            data={tableData as TableData<ExportJobDto>[]}
            virtual
            headerOffset={450}
            tableState={{
                pagination: {
                    ...searchCondition.pagination,
                    total: exportHistoryList?.total || 0,
                },
            }}
        />
    );
}