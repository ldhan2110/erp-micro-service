import { useOidc } from '@axa-fr/react-oidc'

/**
 * LoginButton component that triggers the OAuth2 login flow.
 */
export function LoginButton() {
  const { login } = useOidc()

  const handleLogin = () => {
    login()
  }

  return (
    <button 
      onClick={handleLogin}
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
      Login
    </button>
  )
}


