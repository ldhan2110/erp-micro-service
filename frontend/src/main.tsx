import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { OidcProvider } from '@axa-fr/react-oidc'
import './index.css'
import App from './App.tsx'
import { oidcConfiguration } from './oidc-config'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <OidcProvider configuration={oidcConfiguration}>
      <App />
    </OidcProvider>
  </StrictMode>,
)
