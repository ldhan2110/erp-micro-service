import axios from 'axios'

/**
 * Base API URL - points to the API Gateway
 * The API Gateway routes requests to the appropriate microservices
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

/**
 * Get access token from OIDC storage
 * The @axa-fr/react-oidc library stores tokens in localStorage/sessionStorage
 * under a key that includes the authority and client_id
 */
const getAccessToken = (): string | null => {
  try {
    // OIDC library stores tokens in localStorage with a specific key pattern
    // The key format is typically: oidc.user:{authority}:{client_id}
    const authority = import.meta.env.VITE_OIDC_AUTHORITY || 'http://localhost:8081'
    const clientId = import.meta.env.VITE_OIDC_CLIENT_ID || 'erp-frontend'
    const storageKey = `oidc.user:${authority}:${clientId}`
    
    // Try localStorage first (default), then sessionStorage
    const storage = localStorage.getItem(storageKey) || sessionStorage.getItem(storageKey)
    
    if (storage) {
      const userData = JSON.parse(storage)
      return userData.access_token || null
    }
    
    return null
  } catch (error) {
    console.error('Error getting access token from storage:', error)
    return null
  }
}

/**
 * Axios instance configured for API calls to the backend
 * Automatically includes the OAuth2 access token in the Authorization header
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Request interceptor to add the OAuth2 access token to all API requests
 * This ensures authenticated requests are made to protected endpoints
 */
apiClient.interceptors.request.use(
  (config) => {
    try {
      // Get the access token from OIDC storage
      const token = getAccessToken()
      
      if (token) {
        // Add the token to the Authorization header
        config.headers.Authorization = `Bearer ${token}`
      }
    } catch (error) {
      console.error('Error getting access token:', error)
      // Continue without token - the backend will return 401 if authentication is required
    }
    
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * Response interceptor to handle errors globally
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle 401 Unauthorized - token might be expired
    if (error.response?.status === 401) {
      console.error('Unauthorized - token may be expired or invalid')
      // The OIDC library should handle token refresh automatically
    }
    
    return Promise.reject(error)
  }
)
