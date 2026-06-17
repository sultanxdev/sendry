import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import Login from './components/Login';
import { authApi } from './api/api';
import { DashboardLayout } from './components/layout';
import { ThemeProvider } from './contexts/ThemeContext';
import { ToastProvider } from './contexts/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import LandingPage from './pages/LandingPage';
import DocsPage from './pages/DocsPage';

const OverviewPage = lazy(() => import('./pages/OverviewPage').then(m => ({ default: m.OverviewPage })));
const SettingsPage = lazy(() => import('./pages/SettingsPage').then(m => ({ default: m.SettingsPage })));

const pageFallback = (
    <div style={{ height: '60vh', display: 'grid', placeItems: 'center' }}>Loading…</div>
);

function AuthGate() {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const queryClient = useQueryClient();

    useEffect(() => {
        const controller = new AbortController();
        authApi.getProfile({ signal: controller.signal })
            .then(() => setIsAuthenticated(true))
            .catch((err) => {
                if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
                    setIsAuthenticated(false);
                }
            });
        return () => controller.abort();
    }, []);

    const handleLoginSuccess = () => setIsAuthenticated(true);

    const handleLogout = useCallback(async () => {
        try { await authApi.logout(); } catch { }
        queryClient.clear();
        setIsAuthenticated(false);
    }, [queryClient]);

    useEffect(() => {
        if (isAuthenticated !== true) return;
        const handle401 = () => {
            queryClient.clear();
            setIsAuthenticated(false);
        };
        window.addEventListener('auth:unauthorized', handle401);
        return () => window.removeEventListener('auth:unauthorized', handle401);
    }, [isAuthenticated, queryClient]);

    if (isAuthenticated === null) {
        return (
            <div style={{ height: '100vh', display: 'grid', placeItems: 'center', background: 'var(--theme-background)', color: 'hsl(var(--foreground))' }}>
                Checking authentication…
            </div>
        );
    }

    return (
        <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage isAuthenticated={isAuthenticated} onLogout={handleLogout} />} />
            <Route path="/docs" element={<DocsPage isAuthenticated={isAuthenticated} />} />
            
            {/* Auth routes */}
            <Route path="/login" element={
                isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login onLoginSuccess={handleLoginSuccess} initialMode="login" />
            } />
            <Route path="/register" element={
                isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login onLoginSuccess={handleLoginSuccess} initialMode="register" />
            } />

            {/* Guarded dashboard routes */}
            <Route path="/dashboard/*" element={
                isAuthenticated ? (
                    <DashboardLayout onLogout={handleLogout}>
                        <Suspense fallback={pageFallback}>
                            <Routes>
                                <Route path="/" element={<OverviewPage />} />
                                <Route path="/settings" element={<SettingsPage />} />
                                <Route path="*" element={<Navigate to="/dashboard" replace />} />
                            </Routes>
                        </Suspense>
                    </DashboardLayout>
                ) : (
                    <Navigate to="/login" replace />
                )
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <ErrorBoundary>
            <ThemeProvider>
                <ToastProvider>
                    <BrowserRouter>
                        <AuthGate />
                    </BrowserRouter>
                </ToastProvider>
            </ThemeProvider>
        </ErrorBoundary>
    );
}

export default App;
