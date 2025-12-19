import axios from 'axios';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { API_CONFIG, getApiUrl } from '@/configs/api';
import type { LoginRequestDto, LoginResponseDto, RoleDto } from '@/types/api';
import type { DecodedToken } from '@/types';

// Storage keys
export const ACCESS_TOKEN_KEY = 'access_token';
export const REFRESH_TOKEN_KEY = 'refresh_token';

class AuthJwtService {
	/**
	 * Đăng nhập với username và password
	 */
	async login(credentials: LoginRequestDto): Promise<LoginResponseDto> {
		try {
			const tokenEndpoint = getApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGIN);

			const response = await axios.post<LoginResponseDto>(
				tokenEndpoint,
				{
					username: credentials.username,
					password: credentials.password,
				},
				{
					headers: {
						'Content-Type': 'application/json',
					},
					withCredentials: true, // Để gửi cookie nếu cần
				},
			);

			const tokenData = response.data;

			// Lưu tokens
			this.saveTokens(tokenData);

			return tokenData;
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			console.error('Login failed:', error);
			throw new Error(
				error.response?.data?.errorCode || error.response?.data?.errorMessage || 'Login failed.',
			);
		}
	}

	/**
	 * Refresh access token bằng refresh token
	 */
	async refreshToken(): Promise<LoginResponseDto | null> {
		try {
			const refreshToken = this.getRefreshToken();
			if (!refreshToken || refreshToken === 'undefined') {
				console.warn('⚠️ No refresh token available, clearing all tokens');
				this.clearTokens();
				throw new Error('No refresh token available');
			}

			const tokenEndpoint = getApiUrl(API_CONFIG.ENDPOINTS.AUTH.REFRESH_TOKEN);

			const response = await axios.post<LoginResponseDto>(
				tokenEndpoint,
				{
					refreshToken: refreshToken, // Gửi refresh token trong body
				},
				{
					headers: {
						'Content-Type': 'application/json',
					},
				},
			);

			const tokenData = response.data;

			// Lưu tokens mới
			this.saveTokens(tokenData);

			return tokenData;
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			console.error('❌ Token refresh failed:', error);
			// Nếu refresh token hết hạn hoặc có lỗi, xóa tất cả tokens và storage
			this.clearTokens();
			this.clearAllUserData();
			return null;
		}
	}

	/**
	 * Lưu tokens vào storage
	 */
	saveTokens(tokenData: LoginResponseDto): void {
		// Lưu access token vào sessionStorage
		sessionStorage.setItem(ACCESS_TOKEN_KEY, tokenData.accessToken!);

		// Lưu refresh token vào httpOnly cookie (secure)
		Cookies.set(REFRESH_TOKEN_KEY, tokenData.refreshToken!, {
			expires: tokenData.refreshExpireIn! / (24 * 60 * 60), // Convert seconds to days
			// httpOnly: false, // Note: js-cookie không thể set httpOnly, cần backend support
			// secure: true,
			// sameSite: "strict",
		});
	}

	/**
	 * Lấy access token từ sessionStorage
	 */
	getAccessToken(): string | null {
		return sessionStorage.getItem(ACCESS_TOKEN_KEY);
	}

	/**
	 * Lấy refresh token từ cookie
	 */
	getRefreshToken(): string | null {
		return Cookies.get(REFRESH_TOKEN_KEY) || null;
	}

	/**
	 * Kiểm tra access token có hợp lệ không
	 */
	isAccessTokenValid(): boolean {
		const token = this.getAccessToken();
		if (!token || token == 'undefined') return false;

		try {
			const decoded = jwtDecode<DecodedToken>(token);
			const currentTime = Date.now() / 1000;

			// Kiểm tra token có hết hạn không (với buffer 30 giây)
			return decoded.exp > currentTime + 30;
		} catch (error) {
			console.error('Invalid token:', error);
			return false;
		}
	}

	/**
	 * Decode access token để lấy thông tin user
	 */
	getDecodedToken(): DecodedToken | null {
		const token = this.getAccessToken();
		if (!token) return null;

		try {
			return jwtDecode<DecodedToken>(token);
		} catch (error) {
			console.error('Failed to decode token:', error);
			return null;
		}
	}

	/**
	 * Kiểm tra user đã đăng nhập chưa
	 */
	async isAuthenticated(): Promise<boolean> {
		try {
			// Kiểm tra access token trước
			if (this.isAccessTokenValid()) {
				return true;
			}

			// Nếu access token không hợp lệ, thử refresh
			const refreshed = await this.refreshToken();
			return refreshed !== null;
		} catch (error) {
			console.error('❌ Authentication check failed:', error);
			// Clear tất cả tokens và data khi có lỗi
			this.clearTokens();
			this.clearAllUserData();
			return false;
		}
	}

	/**
	 * Đăng xuất
	 */
	async logout() {
		try {
			const tokenEndpoint = getApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGOUT);
			const response = await axios.post(tokenEndpoint, {
				headers: {
					'Content-Type': 'application/json',
				},
				withCredentials: true, // Để gửi cookie nếu cần
			});
			const isSuccess = response.data;
			if (isSuccess) {
				this.clearTokens();
			}
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			console.error('Logout failed:', error);
			throw new Error(
				error.response?.data?.errorCode || error.response?.data?.errorMessage || 'Logout failed.',
			);
		}
	}

	/**
	 * Xóa tất cả tokens
	 */
	clearTokens(): void {
		console.log('🧹 Clearing all tokens...');

		// Clear từ sessionStorage
		sessionStorage.removeItem(ACCESS_TOKEN_KEY);

		// Không cần clear từ localStorage vì chúng ta chỉ dùng sessionStorage

		// Clear cookies
		Cookies.remove(REFRESH_TOKEN_KEY);
		Cookies.remove(REFRESH_TOKEN_KEY, { path: '/' });

		// Clear tất cả cookies khác liên quan đến auth
		const allCookies = document.cookie.split(';');
		allCookies.forEach((cookie) => {
			const cookieName = cookie.split('=')[0].trim();
			if (cookieName.includes('auth') || cookieName.includes('token')) {
				Cookies.remove(cookieName);
				Cookies.remove(cookieName, { path: '/' });
			}
		});

		console.log('✅ All tokens cleared');
	}

	/**
	 * Xóa tất cả dữ liệu user (bao gồm cả app state)
	 */
	private clearAllUserData(): void {
		try {
			console.log('🧹 Clearing all user data...');

			// Không cần clear localStorage vì chúng ta đã chuyển sang IndexedDB
			// IndexedDB sẽ được clear qua indexedDBSystemCache.clearCache()

			// Clear sessionStorage
			sessionStorage.clear();

			console.log('✅ All user data cleared');
		} catch (error) {
			console.error('❌ Failed to clear user data:', error);
		}
	}

	/**
	 * Lấy thông tin user hiện tại
	 */
	getCurrentUser(): DecodedToken | null {
		if (!this.isAccessTokenValid()) {
			return null;
		}
		return this.getDecodedToken();
	}

	getCurrentCompany(): string | null {
		if (!this.isAccessTokenValid()) {
			return null;
		}
		return this.getDecodedToken()?.userInfo.coId || null;
	}

	async getUserRole(): Promise<RoleDto> {
		try {
			const roleEndpoint = getApiUrl(API_CONFIG.ENDPOINTS.AUTH.GET_ROLE);
			const response = await axios.get<RoleDto>(roleEndpoint, {
				headers: {
					Authorization: `Bearer ${this.getAccessToken()}`,
					'Content-Type': 'application/json',
				},
				withCredentials: true, // Để gửi cookie nếu cần
			});
			const role = response.data;
			return role;
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
		} catch (error: any) {
			console.error('Failed to get Role:', error);
			throw new Error(
				error.response?.data?.errorCode ||
					error.response?.data?.errorMessage ||
					'Failed to get Role.',
			);
		}
	}

	/**
	 * Tạo axios interceptor để tự động thêm token vào request
	 */
	setupAxiosInterceptors(): void {
		// Request interceptor - thêm token vào header
		axios.interceptors.request.use(
			(config) => {
				const token = this.getAccessToken();
				if (token && this.isAccessTokenValid()) {
					config.headers.Authorization = `Bearer ${token}`;
				}
				return config;
			},
			(error) => {
				return Promise.reject(error);
			},
		);

		// Response interceptor - xử lý token hết hạn
		axios.interceptors.response.use(
			(response) => response,
			async (error) => {
				const originalRequest = error.config;
				// Get the Login Enpoints
				const tokenEndpoint = getApiUrl(API_CONFIG.ENDPOINTS.AUTH.LOGIN);

				if (error.response?.status === 403 && !originalRequest._retry) {
					// Nếu request endpoint là login enpoints -> trả về response
					if (error.request.responseURL.endsWith(tokenEndpoint)) return Promise.reject(error);
					originalRequest._retry = true;

					// Thử refresh token
					const refreshed = await this.refreshToken();
					if (refreshed) {
						// Retry request với token mới
						originalRequest.headers.Authorization = `Bearer ${refreshed.accessToken}`;
						return axios(originalRequest);
					} else {
						// Refresh thất bại, redirect to login
						this.clearTokens();
						window.location.href = '/login';
					}
				} else if (error.response?.status === 401 && !originalRequest._retry) {
					this.logout();
					this.clearTokens();
					window.location.href = '/login';
				}

				return Promise.reject(error);
			},
		);
	}
}

export const authService = new AuthJwtService();
