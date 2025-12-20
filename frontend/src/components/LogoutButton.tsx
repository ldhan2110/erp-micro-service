import { useOidc } from '@axa-fr/react-oidc'

/**
 * LogoutButton component that logs out the user and clears the session.
 */
export function LogoutButton() {
  const { logout } = useOidc()

  const handleLogout = () => {
    logout()
  }

  return (
    <button 
      onClick={handleLogout}
      style={{
        padding: '0.75rem 1.5rem',
        fontSize: '1rem',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontWeight: '500',
      }}
    >
      Logout
    </button>
  )
}


