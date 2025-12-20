import { useOidc } from '@axa-fr/react-oidc'
import { LogoutButton } from '../components/LogoutButton'

/**
 * DemoPage component that displays user information after successful authentication.
 */
export function DemoPage() {
  const { isAuthenticated } = useOidc()

  if (!isAuthenticated) {
    return <div>Loading...</div>
  }

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
                {"Unknown"}
              </div>
            </div>

            <div>
              <strong style={{ color: '#495057' }}>Email:</strong>
              <div style={{ 
                marginTop: '0.25rem',
                padding: '0.5rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '4px',
              }}>
                {"Not provided"}
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
          }}>
            <div><strong>Access Token:</strong> Present ✓</div>
            <div><strong>ID Token:</strong> Present ✓</div>
            <div><strong>Token Type:</strong> Bearer</div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1rem',
        }}>
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
          }}>
            ""
          </pre>
        </details>
      </div>
    </div>
  )
}
