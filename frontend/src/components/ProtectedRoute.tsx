import { ReactNode, useEffect } from 'react'
import { useOidc } from '@axa-fr/react-oidc'

interface ProtectedRouteProps {
  children: ReactNode
}

/**
 * ProtectedRoute component that ensures user is authenticated before rendering children.
 * If user is not authenticated, redirects to login.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, login } = useOidc()

  useEffect(() => {
    if (!isAuthenticated) {
      // Trigger login flow - this will redirect to OAuth2 authorization endpoint
      login()
    }
  }, [isAuthenticated, login])

  if (!isAuthenticated) {
    // Show loading state while redirecting to login
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ fontSize: '1.5rem' }}>Redirecting to login...</div>
      </div>
    )
  }

  return <>{children}</>
}


