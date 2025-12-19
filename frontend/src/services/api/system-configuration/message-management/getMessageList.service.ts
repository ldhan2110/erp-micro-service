import { API_CONFIG, getApiUrl } from '@/configs';
import { authService } from '@/services/auth/authJwtService';
import type { ComMsgListDto, SearchComMsgDto } from '@/types';
import axios from 'axios';

export async function getMessageList(request: SearchComMsgDto): Promise<ComMsgListDto> {
	const url = getApiUrl(
		API_CONFIG.ENDPOINTS.SYSTEM_CONFIGURATION.MESSAGE_MANAGEMENT.GET_MESSAGE_LIST,
	);
	const resp = await axios.post<ComMsgListDto>(url, request, {
		headers: {
			withCredentials: true,
			'Content-Type': 'application/json',
			Authorization: `Bearer ${authService.getAccessToken()}`,
		},
	});
	return resp.data;
}

