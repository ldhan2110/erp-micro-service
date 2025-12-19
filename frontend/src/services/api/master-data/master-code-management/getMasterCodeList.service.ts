import { API_CONFIG, getApiUrl } from '@/configs';
import { authService } from '@/services/auth/authJwtService';
import type { MasterCodeListDto, SearchMasterCodeDto } from '@/types';
import axios from 'axios';

export async function getMasterCodeList(request: SearchMasterCodeDto): Promise<MasterCodeListDto> {
	const url = getApiUrl(
		API_CONFIG.ENDPOINTS.MASTER_DATA.MASTER_CODE_MANAGEMENT.GET_MASTER_CODE_LIST,
	);
	const resp = await axios.post<MasterCodeListDto>(url, request, {
		headers: {
			withCredentials: true,
			'Content-Type': 'application/json',
			Authorization: `Bearer ${authService.getAccessToken()}`,
		},
	});
	return resp.data;
}
