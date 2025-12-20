import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useOidc } from '@axa-fr/react-oidc'

/**
 * Callback page for OAuth2 authorization code flow.
 * This page handles the redirect from the authorization server after user login.
 * The OIDC library automatically processes the authorization code and exchanges it for tokens.
 */
export function Callback() {
  const { isAuthenticated } = useOidc()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check for error parameters in the URL
    const errorParam = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')
    
    if (errorParam) {
      setError(errorDescription || errorParam)
      return
    }

    // Once authentication is complete, redirect to home page
    if (isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, navigate, searchParams])

  if (error) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem',
        padding: '2rem'
      }}>
        <div style={{ fontSize: '1.5rem', color: '#dc3545', fontWeight: 'bold' }}>
          Authentication Error
        </div>
        <div style={{ fontSize: '1rem', color: '#666', textAlign: 'center', maxWidth: '600px' }}>
          {error}
        </div>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '0.75rem 1.5rem',
            fontSize: '1rem',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '1rem'
          }}
        >
          Return to Home
        </button>
      </div>
    )
  }

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div style={{ fontSize: '1.5rem' }}>Processing authentication...</div>
      <div style={{ fontSize: '1rem', color: '#666' }}>Please wait while we complete your login.</div>
    </div>
  )
}


