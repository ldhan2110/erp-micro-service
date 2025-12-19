import { API_CONFIG, getApiUrl } from '@/configs';
import { authService } from '@/services/auth/authJwtService';
import type { ComMsgDto, SearchComMsgDto } from '@/types';
import axios from 'axios';

export async function getMessage(request: SearchComMsgDto): Promise<ComMsgDto> {
	const url = getApiUrl(
		API_CONFIG.ENDPOINTS.SYSTEM_CONFIGURATION.MESSAGE_MANAGEMENT.GET_MESSAGE,
	);
	const resp = await axios.post<ComMsgDto>(url, request, {
		headers: {
			withCredentials: true,
			'Content-Type': 'application/json',
			Authorization: `Bearer ${authService.getAccessToken()}`,
		},
	});
	return resp.data;
}

