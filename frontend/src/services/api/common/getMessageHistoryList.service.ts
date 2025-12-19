import { API_CONFIG, getApiUrl } from '@/configs';
import { authService } from '@/services/auth/authJwtService';
import type { ErrorLogListDto, SearchErrorLogDto } from '@/types';
import axios from 'axios';

export async function getMessageHistoryList(request: SearchErrorLogDto): Promise<ErrorLogListDto> {
	const url = getApiUrl(API_CONFIG.ENDPOINTS.COMMON.GET_MESSAGE_HISTORY_LIST);
	const resp = await axios.post<ErrorLogListDto>(url, request, {
		headers: {
			withCredentials: true,
			'Content-Type': 'application/json',
			Authorization: `Bearer ${authService.getAccessToken()}`,
		},
	});
	return resp.data;
}
