import { useOidc } from '@axa-fr/react-oidc'

/**
 * LogoutButton component that logs out the user and clears the session.
 * After logout, the user is redirected to the post_logout_redirect_uri (home page).
 * The logout process also clears the session at the authorization server.
 */
export function LogoutButton() {
  const { logout } = useOidc()

  const handleLogout = () => {
    // Logout and redirect to post_logout_redirect_uri (configured in oidc-config.ts)
    // This will:
    // 1. Clear local tokens
    // 2. Redirect to the authorization server's logout endpoint
    // 3. Then redirect back to the post_logout_redirect_uri (home page)
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
        transition: 'background-color 0.2s',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.backgroundColor = '#c82333'
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.backgroundColor = '#dc3545'
      }}
    >
      Logout
    </button>
  )
}


