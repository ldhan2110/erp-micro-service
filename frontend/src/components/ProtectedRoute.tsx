import { type ReactNode, useEffect } from 'react'
import { useOidc } from '@axa-fr/react-oidc'

interface ProtectedRouteProps {
  children: ReactNode
}

/**
 * ProtectedRoute component that ensures user is authenticated before rendering children.
 * If user is not authenticated, redirects to the OAuth2 authorization server login page.
 * 
 * This component uses the login() function from @axa-fr/react-oidc which:
 * 1. Redirects the user to the authorization server's login page
 * 2. After successful login, redirects back to /callback with an authorization code
 * 3. The callback handler exchanges the code for tokens
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, login } = useOidc()

  useEffect(() => {
    // Only redirect if not authenticated and not already in the process of authenticating
    if (!isAuthenticated) {
      // Trigger login flow - this will redirect to OAuth2 authorization endpoint
      // The login function redirects to: {authority}/oauth2/authorize
      login()
    }
  }, [isAuthenticated, login])

  // Show loading state while redirecting to login or during authentication
  if (!isAuthenticated) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div style={{ fontSize: '1.5rem', color: '#333' }}>
          {!isAuthenticated && 'Redirecting to login...'}
        </div>
        <div style={{ fontSize: '0.9rem', color: '#666' }}>
          Please wait while we redirect you to the login page.
        </div>
      </div>
    )
  }

  // User is authenticated, render the protected content
  return <>{children}</>
}


