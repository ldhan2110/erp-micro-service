import './i18n'; // Ensure i18n is initialized
import './global.css';
import { queryClient } from './configs';
import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './pages/App';
import { App as AntApp } from 'antd';
import AuthGuard from './pages/AuthGuard';
import { Route, Routes, BrowserRouter, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AntdConfigProvider, PermissionProvider } from './components/modules/common';

createRoot(document.getElementById('root')!).render(
	<Suspense>
		<StrictMode>
			<QueryClientProvider client={queryClient}>
				<AntdConfigProvider>
					<AuthGuard>
						<PermissionProvider>
							<AntApp>
								<BrowserRouter>
									<Routes>
										<Route path="/" element={<App />} />
										<Route path="/:tabKeys" element={<App />} />
										<Route path="*" element={<Navigate to="/" replace />} />
									</Routes>
								</BrowserRouter>
							</AntApp>
						</PermissionProvider>
					</AuthGuard>
				</AntdConfigProvider>
			</QueryClientProvider>
		</StrictMode>
	</Suspense>
);
