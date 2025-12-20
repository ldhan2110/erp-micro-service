import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { OidcProvider } from '@axa-fr/react-oidc'
import './index.css'
import App from './App.tsx'
import { oidcConfig } from './oidc-config'
import { AuthenticationError } from './components/AuthenticationError'
import { testOpenIdConfiguration, logOidcConfig } from './utils/oidc-debug'

// Log configuration for debugging
console.log('Initializing OIDC Provider...')
logOidcConfig(oidcConfig)

// Test OpenID configuration endpoint on startup
testOpenIdConfiguration().catch(console.error)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <OidcProvider 
      configuration={oidcConfig}
      authenticatingErrorComponent={AuthenticationError}
    >
      <App />
    </OidcProvider>
  </StrictMode>,
)
