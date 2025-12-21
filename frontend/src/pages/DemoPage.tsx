import { useOidc, useOidcUser } from '@axa-fr/react-oidc'
import { LogoutButton } from '../components/LogoutButton'
import { Link } from 'react-router-dom'
import { useEffect } from 'react'

/**
 * DemoPage component that displays user information after successful authentication.
 * This page shows the user's profile information extracted from the OIDC user object.
 */
export function DemoPage() {
  const { isAuthenticated } = useOidc()
  const { oidcUser } = useOidcUser()

  useEffect(() => {
    console.log('oidcUser', oidcUser)
  }, [oidcUser])

  // Show loading state if not authenticated
  if (!isAuthenticated) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div>Redirecting to login...</div>
      </div>
    )
  }

  // Show loading state while user data is being fetched
  if (!oidcUser) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}>
        <div>Loading user information...</div>
      </div>
    )
  }

  // Extract user information from the OIDC user object
  // The oidcUser object has a 'profile' property containing user claims
  const profile = oidcUser?.profile || {}
  const subject = profile.sub || 'Not available'
  const email = profile.email || 'Not provided'
  const name = oidcUser.name || profile.preferred_username || 'Not provided'
  const givenName = profile.given_name || 'Not provided'
  const familyName = profile.family_name || 'Not provided'
  const emailVerified = profile.email_verified ? 'Yes' : 'No'

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '2rem',
      fontFamily: 'system-ui, -apple-system, sans-serif',
    }}>
      <div style={{
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        padding: '2rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      }}>
        <h1 style={{
          marginTop: 0,
          marginBottom: '0.5rem',
          fontSize: '1.75rem',
          color: '#212529',
        }}>
          Welcome to LBU ERP System
        </h1>
        
        <p style={{
          fontSize: '1.1rem',
          color: '#666',
          marginBottom: '2rem',
        }}>
          You have successfully authenticated using OAuth2. Here are your profile details:
        </p>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '6px',
          padding: '1.5rem',
          marginBottom: '2rem',
          border: '1px solid #dee2e6',
        }}>
          <h2 style={{
            marginTop: 0,
            marginBottom: '1rem',
            fontSize: '1.25rem',
            color: '#495057',
          }}>
            User Profile Information
          </h2>
          
          <div style={{
            display: 'grid',
            gap: '1rem',
          }}>
            <div>
              <strong style={{ color: '#495057' }}>Subject (User ID):</strong>
              <div style={{ 
                marginTop: '0.25rem',
                padding: '0.5rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                wordBreak: 'break-all',
              }}>
                {oidcUser.usr_id}
              </div>
            </div>

            <div>
              <strong style={{ color: '#495057' }}>Name:</strong>
              <div style={{ 
                marginTop: '0.25rem',
                padding: '0.5rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
              }}>
                {oidcUser.name}
              </div>
            </div>

            {(givenName !== 'Not provided' || familyName !== 'Not provided') && (
              <>
                {givenName !== 'Not provided' && (
                  <div>
                    <strong style={{ color: '#495057' }}>Given Name:</strong>
                    <div style={{ 
                      marginTop: '0.25rem',
                      padding: '0.5rem',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '4px',
                    }}>
                      {oidcUser.given_name}
                    </div>
                  </div>
                )}
                {familyName !== 'Not provided' && (
                  <div>
                    <strong style={{ color: '#495057' }}>Family Name:</strong>
                    <div style={{ 
                      marginTop: '0.25rem',
                      padding: '0.5rem',
                      backgroundColor: '#f8f9fa',
                      borderRadius: '4px',
                    }}>
                      {familyName}
                    </div>
                  </div>
                )}
              </>
            )}

            <div>
              <strong style={{ color: '#495057' }}>Email:</strong>
              <div style={{ 
                marginTop: '0.25rem',
                padding: '0.5rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
              }}>
                {oidcUser.email} {typeof profile.email_verified === 'boolean' && `(Verified: ${emailVerified})`}
              </div>
            </div>
          </div>
        </div>

        <div style={{
          backgroundColor: 'white',
          borderRadius: '6px',
          padding: '1.5rem',
          marginBottom: '2rem',
          border: '1px solid #dee2e6',
        }}>
          <h2 style={{
            marginTop: 0,
            marginBottom: '1rem',
            fontSize: '1.25rem',
            color: '#495057',
          }}>
            Token Information
          </h2>
          
          <div style={{
            fontSize: '0.9rem',
            color: '#666',
            display: 'grid',
            gap: '0.5rem',
          }}>
            <div><strong>Access Token:</strong> {oidcUser.access_token ? 'Present ✓' : 'Not available'}</div>
            <div><strong>ID Token:</strong> {oidcUser.id_token ? 'Present ✓' : 'Not available'}</div>
            <div><strong>Token Type:</strong> Bearer</div>
            {oidcUser.expires_at && (
              <div><strong>Expires At:</strong> {new Date(oidcUser.expires_at * 1000).toLocaleString()}</div>
            )}
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
        }}>
          <Link
            to="/employees"
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#007bff',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              fontWeight: 500,
              display: 'inline-block',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#0056b3'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#007bff'
            }}
          >
            View Employees
          </Link>
          <LogoutButton />
        </div>

        <details style={{
          marginTop: '2rem',
          padding: '1rem',
          backgroundColor: '#fff3cd',
          borderRadius: '4px',
          border: '1px solid #ffc107',
        }}>
          <summary style={{
            cursor: 'pointer',
            fontWeight: 'bold',
            color: '#856404',
          }}>
            View Full Token Claims (Debug)
          </summary>
          <pre style={{
            marginTop: '1rem',
            padding: '1rem',
            backgroundColor: 'white',
            borderRadius: '4px',
            overflow: 'auto',
            fontSize: '0.85rem',
            maxHeight: '400px',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}>
            {JSON.stringify(oidcUser, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  )
}
