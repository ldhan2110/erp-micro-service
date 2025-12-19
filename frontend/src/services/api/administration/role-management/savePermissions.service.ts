import { API_CONFIG, getApiUrl } from '@/configs';
import { authService } from '@/services/auth/authJwtService';
import type { PermissionDto, SuccessDto } from '@/types';
import axios from 'axios';

export async function savePermissions(request: PermissionDto[]): Promise<SuccessDto> {
	const url = getApiUrl(API_CONFIG.ENDPOINTS.ADMIN.ROLE_MANAGEMENT.SAVE_PERMISSIONS);
	const resp = await axios.post<SuccessDto>(url, request, {
		headers: {
			withCredentials: true,
			'Content-Type': 'application/json',
			Authorization: `Bearer ${authService.getAccessToken()}`,
		},
	});
	return resp.data;
}
