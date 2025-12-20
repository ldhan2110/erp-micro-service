import { useEffect, useState } from 'react'
import { useOidc } from '@axa-fr/react-oidc'

/**
 * Component displayed when an authentication error occurs.
 */
export function AuthenticationError() {
  const { login } = useOidc()
  const [errorDetails, setErrorDetails] = useState<string>('')

  useEffect(() => {
    // Check browser console for error details
    // Also check sessionStorage for any stored error information
    const checkForErrors = () => {
      // Try to get error from URL parameters if available
      const urlParams = new URLSearchParams(window.location.search)
      const error = urlParams.get('error')
      const errorDescription = urlParams.get('error_description')
      
      if (error) {
        setErrorDetails(`${error}: ${errorDescription || 'No description available'}`)
      } else {
        setErrorDetails('Check the browser console (F12) for detailed error messages.')
      }
    }

    checkForErrors()
  }, [])

  const testEndpoints = async () => {
    const endpoints = [
      'http://localhost:8080/.well-known/openid-configuration',
      'http://localhost:8080/.well-known/jwks.json',
      'http://localhost:8080/oauth2/authorize',
    ]

    console.log('Testing OAuth2 endpoints...')
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, { method: 'GET', mode: 'no-cors' })
        console.log(`${endpoint}:`, response.status)
      } catch (error) {
        console.error(`${endpoint}:`, error)
      }
    }
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      gap: '1rem',
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{
        backgroundColor: '#f8d7da',
        border: '1px solid #f5c6cb',
        borderRadius: '8px',
        padding: '2rem',
        maxWidth: '800px',
        textAlign: 'center',
      }}>
        <h2 style={{
          marginTop: 0,
          marginBottom: '1rem',
          color: '#721c24',
        }}>
          Authentication Error
        </h2>
        <p style={{
          color: '#721c24',
          marginBottom: '1rem',
          fontWeight: 'bold',
        }}>
          {errorDetails || 'An error occurred during authentication.'}
        </p>
        <p style={{
          color: '#721c24',
          marginBottom: '1.5rem',
        }}>
          This could be due to:
        </p>
        <ul style={{
          textAlign: 'left',
          color: '#721c24',
          marginBottom: '1.5rem',
        }}>
          <li>Invalid client configuration</li>
          <li>Network connectivity issues</li>
          <li>Authorization server unavailable</li>
          <li>CORS configuration issues</li>
          <li>OpenID Connect discovery endpoint not accessible</li>
        </ul>
        
        <div style={{
          backgroundColor: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '4px',
          padding: '1rem',
          marginBottom: '1.5rem',
          textAlign: 'left',
        }}>
          <strong style={{ color: '#856404' }}>Debugging Steps:</strong>
          <ol style={{ color: '#856404', marginTop: '0.5rem' }}>
            <li>Open browser console (F12) and check for error messages</li>
            <li>Verify backend services are running:
              <ul>
                <li>Service Registry (Eureka): http://localhost:8761</li>
                <li>Auth Service: http://localhost:8081</li>
                <li>API Gateway: http://localhost:8080</li>
              </ul>
            </li>
            <li>Test OpenID endpoint: <a href="http://localhost:8080/.well-known/openid-configuration" target="_blank" rel="noopener noreferrer">http://localhost:8080/.well-known/openid-configuration</a></li>
            <li>Check Network tab for failed requests</li>
          </ol>
        </div>

        <div style={{
          display: 'flex',
          gap: '1rem',
          justifyContent: 'center',
        }}>
          <button
            onClick={() => login()}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            Retry Login
          </button>
          <button
            onClick={testEndpoints}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '500',
            }}
          >
            Test Endpoints
          </button>
        </div>
      </div>
    </div>
  )
}


