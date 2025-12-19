import { QUERY_KEY } from '@/constants';
import { getMasterCodeList } from '@/services/api';
import type { MasterCodeListDto, SearchMasterCodeDto } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { message } from 'antd';

export const useGetMasterCodeList = (request: SearchMasterCodeDto) => {
	const query = useQuery<MasterCodeListDto>({
		queryKey: [QUERY_KEY.MASTER_DATA.MASTER_CODE_MANAGEMENT.GET_MASTER_CODE_LIST, request],
		queryFn: () => getMasterCodeList(request),
		staleTime: 0,
		refetchOnWindowFocus: false,
		retry: 0,
		enabled: request.coId != null,
		throwOnError: (error) => {
			message.error(error.message || 'Failed to load Master Code List data.');
			return false;
		},
	});
	return query;
};
