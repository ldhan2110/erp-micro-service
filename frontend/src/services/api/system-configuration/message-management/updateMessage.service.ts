import { API_CONFIG, getApiUrl } from '@/configs';
import { authService } from '@/services/auth/authJwtService';
import type { ComMsgDto, SuccessDto } from '@/types';
import axios from 'axios';

export async function updateMessage(request: ComMsgDto): Promise<SuccessDto> {
	const url = getApiUrl(
		API_CONFIG.ENDPOINTS.SYSTEM_CONFIGURATION.MESSAGE_MANAGEMENT.UPDATE_MESSAGE,
	);
	const resp = await axios.post<SuccessDto>(url, request, {
		headers: {
			withCredentials: true,
			'Content-Type': 'application/json',
			Authorization: `Bearer ${authService.getAccessToken()}`,
		},
	});
	return resp.data;
}

