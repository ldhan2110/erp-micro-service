import CustomTable from '@/components/custom-table/CustomTable';
import { useGetMessageHistoryList } from '@/hooks/modules';
import { useMessageHistoryStore } from '@/stores/modules/common';
import type { ErrorLogDto, SORT, TableColumn } from '@/types';
import { convertToDBColumn, formatDate } from '@/utils/helper';

export const MessageHistoryTable = () => {
	// Zustands
	const searchCondition = useMessageHistoryStore((state) => state.search);
	const setSort = useMessageHistoryStore((state) => state.setSort);

	// Hooks
	const { data: messageList, fetchNextPage } = useGetMessageHistoryList({
		...searchCondition.filter,
		sort: searchCondition.sort,
		pagination: searchCondition.pagination,
	});

	const columns: TableColumn<ErrorLogDto>[] = [
		{
			key: 'errMsg',
			title: 'Message',
			dataIndex: 'errMsg',
			width: 200,
			sorter: true,
		},
		{
			key: 'endpoint',
			title: 'Endpoint',
			dataIndex: 'endpoint',
			width: 150,
			sorter: true,
		},
		{
			key: 'mdlNm',
			title: 'Module',
			dataIndex: 'mdlNm',
			width: 100,
			sorter: true,
		},
		{
			key: 'rqstPara',
			title: 'Parameters',
			dataIndex: 'rqstPara',
			width: 250,
			sorter: true,
			render: (value) => <>{JSON.stringify(value)}</>,
		},
		{
			key: 'creUsrId',
			title: 'Created User',
			dataIndex: 'creUsrId',
			width: 100,
			sorter: true,
		},
		{
			key: 'creDt',
			title: 'Created Date',
			dataIndex: 'creDt',
			width: 150,
			sorter: true,
			render: (value) => formatDate(value, true),
		},
	];

	function handleScrollChange() {
		fetchNextPage();
	}

	function handleSortChange(sortField: string | undefined, sortType: SORT | undefined) {
		setSort({
			sortField: convertToDBColumn(sortField as string),
			sortType,
		});
	}

	return (
		<CustomTable<ErrorLogDto>
			columns={columns}
			data={(messageList?.pages.flatMap((page) => page.messageList) ?? [])?.map((item, index) => ({
				...item,
				key: index,
				procFlag: 'S',
			}))}
			virtual
			headerOffset={450}
			tableState={{}}
			onScrollChange={handleScrollChange}
			onSortChange={handleSortChange}
			noFooter
		/>
	);
};
