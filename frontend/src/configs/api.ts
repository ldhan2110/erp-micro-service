import { authService } from '../services/auth/authJwtService';

/**
 * API Configuration with runtime support
 */
export const API_CONFIG = {
	get BASE_URL() {
		return import.meta.env.VITE_API_URL || 'http://localhost:9000/api';
	},
	ENDPOINTS: {
		INITIAL_STATE: '',
		COMMON: {
			// File Management
			DOWLOAD_FILE: '/file/download',

			// Error Log Management
			GET_MESSAGE_HISTORY_LIST: '/errorLog/getHistoryList',
			GET_EXPORT_HISTORY_LIST: '/exportJob/getExportJobList',

			// Export Job Management
			CONFIRM_EXPORT_ASYNC: '/exportJob/confirm',
			CANCEL_EXPORT_ASYNC: '/exportJob/cancel',

			// Batch Job Management
			GET_BATCH_JOB_LIST: '/batch/getBatchJobList',
			GET_BATCH_JOB_HISTORY_LIST: '/batch/getBatchJobHistoryList',
			GET_BATCH_JOB: '/batch/getBatchJob',
			REGISTER_BATCH_JOB: '/batch/register',
			UPDATE_BATCH_JOB: '/batch/update',
			PAUSE_BATCH_JOB: '/batch/pause',
			RESUME_BATCH_JOB: '/batch/resume',

			// User Settings
			SAVE_USER_SETTING: '/user/saveUserSetting',
		},
		AUTH: {
			LOGIN: '/auth/login',
			LOGOUT: '/auth/logout',
			REFRESH_TOKEN: '/auth/refresh-token',
			GET_ROLE: '/auth/getUserRole',
		},
		ADMIN: {
			USER_MANAGEMENT: {
				GET_USER_INFO_LIST: '/user/getListUserInfo',
				GET_USER_INFO: '/user/getUserInfo',
				ADD_NEW_USER: '/user/createUser',
				UPDATE_USER: '/user/updateUser',
				RESET_USER_PASSWORD: '/user/resetUserPassword',
				EXPORT_EXCEL: '/user/exportExcel',
			},
			ROLE_MANAGEMENT: {
				// Program
				GET_PROGRAM_LIST: '/program/getProgramList',
				GET_PROGRAM: '/program/getProgram',
				GET_PERMISSION_BY_PROGRAM: '/program/getPermissionByProgram',
				ADD_NEW_PROGRAM: '/program/insertProgram',
				UPDATE_PROGRAM: '/program/updateProgram',
				SAVE_PERMISSIONS: '/program/savePermissionsByProgram',
				DELETE_PROGRAMS: '/program/deletePrograms',

				// Role
				GET_ROLE_LIST: '/role/getRoleList',
				GET_ROLE: '/role/getRole',
				ADD_NEW_ROLE: '/role/insertRole',
				UPDATE_ROLE: '/role/updateRole',
			},
			FAVORITES: {
				GET_FAVORITES: '/favorites',
				ADD_FAVORITE: '/favorites',
				REMOVE_FAVORITE: '/favorites',
			},
		},
		MASTER_DATA: {
			MASTER_CODE_MANAGEMENT: {
				GET_MASTER_CODE_LIST: '/masterCode/getMasterCodeList',
				GET_MASTER_CODE: '/masterCode/getMasterCode',
				ADD_NEW_MASTER_CODE: '/masterCode/insertMasterCode',
				UPDATE_MASTER_CODE: '/masterCode/updateMasterCode',
			},
		},
		SYSTEM_CONFIGURATION: {
			MESSAGE_MANAGEMENT: {
				GET_MESSAGE_LIST: '/comMsg/getMessageList',
				GET_MESSAGE: '/comMsg/getMessage',
				UPDATE_MESSAGE: '/comMsg/updateMessage',
				INSERT_MESSAGE: '/comMsg/insertMessage',
				DELETE_MESSAGE: '/comMsg/deleteMessage',
			},
		},
	},
};

/**
 * Get API URL with optional path
 */
export const getApiUrl = (path?: string): string => {
	const baseUrl = API_CONFIG.BASE_URL;
	return path ? `${baseUrl}${path}` : baseUrl;
};

/**
 * Replace path parameters in URL
 */
export const replacePathParams = (url: string, params: Record<string, string>): string => {
	let result = url;
	Object.entries(params).forEach(([key, value]) => {
		result = result.replace(`{${key}}`, value);
	});
	return result;
};

export const getAccessToken = (): string | null => {
	return authService.getAccessToken();
};
