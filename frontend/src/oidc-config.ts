/**
 * OIDC configuration for authentication.
 * This configuration connects to the OAuth2 authorization server (auth-service).
 * 
 * The client_id must match the registered client in the authorization server:
 * - Client ID: 'erp-frontend' (public client with PKCE)
 * - Server: http://localhost:8081
 */
export const oidcConfiguration = {
  // OAuth2/OIDC authorization server URL (issuer URI)
  // This should match the issuer URI configured in auth-service
  authority: import.meta.env.VITE_OIDC_AUTHORITY || 'http://localhost:8080',
  
  // Client ID registered with the authorization server
  // Must match the client_id in AuthorizationServerConfig (erp-frontend)
  client_id: import.meta.env.VITE_OIDC_CLIENT_ID || 'erp-frontend',
  
  // Redirect URI after successful authentication
  // Must match the redirect_uri registered in the authorization server
  redirect_uri: `${window.location.origin}/callback`,
  
  // Silent redirect URI for token refresh without user interaction
  silent_redirect_uri: `${window.location.origin}/silent-callback.html`,
  
  // Post logout redirect URI (redirects after logout)
  post_logout_redirect_uri: `${window.location.origin}/`,
  
  // Scopes requested from the authorization server
  scope: 'openid profile email',
  
  // OAuth2 response type (authorization code flow)
  response_type: 'code',
  
  // Enable automatic silent refresh of tokens
  automaticSilentRenew: true,
  
  // Enable demonstrating proof of possession (optional)
  demonstrating_proof_of_possession: false,
  
  // Token storage type: 'localStorage' or 'sessionStorage'
  token_renew_mode: 'access_token_invalid',
}
