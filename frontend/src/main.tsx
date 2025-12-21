import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { OidcProvider } from '@axa-fr/react-oidc'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ApiProvider } from './contexts/ApiContext'
import './index.css'
import App from './App.tsx'
import { oidcConfiguration } from './oidc-config'

// Create a React Query client with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <OidcProvider configuration={oidcConfiguration}>
      <ApiProvider>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </ApiProvider>
    </OidcProvider>
  </StrictMode>,
)
