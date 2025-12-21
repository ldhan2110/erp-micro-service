import { createContext, useContext, type ReactNode, useMemo, useEffect, useRef } from 'react'
import { useOidcAccessToken, useOidcUser } from '@axa-fr/react-oidc'
import axios, { type AxiosInstance } from 'axios'

/**
 * Base API URL - points to the API Gateway
 * The API Gateway routes requests to the appropriate microservices
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

/**
 * Context for providing an authenticated axios instance
 */
interface ApiContextType {
  apiClient: AxiosInstance
}

const ApiContext = createContext<ApiContextType | undefined>(undefined)

/**
 * Provider component that creates an axios instance with OIDC token integration
 * This ensures tokens are always fresh and properly attached to requests
 */
export function ApiProvider({ children }: { children: ReactNode }) {
  // Use useOidcAccessToken to get the access token (version 5 approach)
  const { accessToken } = useOidcAccessToken()
  // Also keep useOidcUser as fallback for older versions or different token location
  const { oidcUser } = useOidcUser()
  
  // Use a ref to store the latest token so interceptors can access it
  const tokenRef = useRef<string | null>(null)
  
  // Update token ref when accessToken or oidcUser changes
  // Try accessToken first (version 5), then fallback to oidcUser.access_token
  useEffect(() => {
    const token = accessToken || oidcUser?.access_token || null
    tokenRef.current = token
    
    // Debug logging
    if (token) {
      console.log('ApiContext: Token updated', { 
        hasAccessToken: !!accessToken,
        hasOidcUserToken: !!oidcUser?.access_token,
        tokenLength: token.length 
      })
    } else {
      console.warn('ApiContext: No token available', {
        hasAccessToken: !!accessToken,
        hasOidcUser: !!oidcUser,
        oidcUserKeys: oidcUser ? Object.keys(oidcUser) : []
      })
    }
  }, [accessToken, oidcUser?.access_token])

  // Create axios instance once and reuse it
  const apiClient = useMemo(() => {
    const client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add request interceptor to include access token
    // The interceptor reads from tokenRef which is always up-to-date
    client.interceptors.request.use(
      (config) => {
        const token = tokenRef.current
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
          console.log('Request interceptor: Token attached to request', {
            url: config.url,
            hasToken: !!token,
            tokenPrefix: token.substring(0, 20) + '...'
          })
        } else {
          console.warn('Request interceptor: No token available for request', {
            url: config.url
          })
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Add response interceptor to handle errors
    client.interceptors.response.use(
      (response) => response,
      (error) => {
        // Handle 401 Unauthorized - token might be expired
        if (error.response?.status === 401) {
          console.error('Unauthorized - token may be expired or invalid')
          // The OIDC library should handle token refresh automatically
          // If refresh fails, the user will need to re-authenticate
        }
        return Promise.reject(error)
      }
    )

    return client
  }, []) // Create once, token is accessed via ref

  return (
    <ApiContext.Provider value={{ apiClient }}>
      {children}
    </ApiContext.Provider>
  )
}

/**
 * Hook to access the authenticated axios instance
 * Must be used within ApiProvider
 */
export function useApiClient(): AxiosInstance {
  const context = useContext(ApiContext)
  if (context === undefined) {
    throw new Error('useApiClient must be used within an ApiProvider')
  }
  return context.apiClient
}
