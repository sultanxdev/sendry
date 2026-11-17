import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Menu, X, LogOut, Clock, RefreshCw } from 'lucide-react';
import { useQueryClient, useIsFetching } from '@tanstack/react-query';
import { useDashboardQuery } from '../../hooks/useDashboardQuery';
import { QUERY_KEYS } from '../../constants';

export function DashboardLayout({ children, onLogout }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const queryClient = useQueryClient();
    const isFetching = useIsFetching({ queryKey: QUERY_KEYS.DASHBOARD }) > 0;
    const { dataUpdatedAt } = useDashboardQuery({ notifyOnChangeProps: ['dataUpdatedAt'] });

    const lastUpdated = dataUpdatedAt
        ? new Date(dataUpdatedAt).toLocaleTimeString()
        : '--';

    const handleRefresh = () => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.DASHBOARD });
    };

    return (
        <div className="min-h-screen bg-[#F3F5F0] text-[#0E1512] relative overflow-hidden font-sans flex">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-1/4 w-[35rem] h-[35rem] bg-[#1FD27A]/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-10 left-1/4 w-[40rem] h-[40rem] bg-[#DCE7DF]/40 rounded-full blur-3xl pointer-events-none"></div>

            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            
            <div className="flex-1 flex flex-col min-w-0 lg:pl-64 relative z-10 transition-all duration-300">
                {/* Floating header */}
                <header className="px-4 pt-4 sticky top-0 z-30 bg-transparent">
                    <div className="w-full bg-white/90 backdrop-blur-md border border-[#D9E1DB] rounded-2xl px-6 h-16 flex items-center justify-between shadow-sm">
                        {/* Mobile menu toggle */}
                        <button
                            className="inline-flex items-center justify-center p-2 rounded-xl text-slate-600 hover:text-[#0E1512] hover:bg-slate-100 border-none bg-transparent cursor-pointer lg:hidden"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
                        >
                            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>

                        {/* Live Telemetry Indicator */}
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#1FD27A] shadow-[0_0_0_3px_rgba(31,210,122,0.25)] animate-pulse"></span>
                            <span className="font-mono text-xs font-semibold text-slate-600 hidden sm:inline">
                                Live Telemetry · Updated {lastUpdated}
                            </span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 sm:gap-3">
                            <button
                                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 border border-[#D9E1DB] rounded-xl bg-white hover:bg-slate-50 text-[#0E1512] text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                                onClick={handleRefresh}
                                disabled={isFetching}
                                aria-label="Refresh data"
                                title="Refresh dashboard metrics"
                            >
                                <RefreshCw
                                    className={`w-3.5 h-3.5 text-slate-500 ${isFetching ? 'animate-spin' : ''}`}
                                />
                                <span className="hidden sm:inline">Refresh</span>
                            </button>
                            <button
                                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#0E1512] hover:bg-[#11503F] text-white text-xs font-bold transition-all border border-[#0E1512] cursor-pointer"
                                onClick={onLogout}
                                aria-label="Log out"
                            >
                                <LogOut className="w-3.5 h-3.5 text-[#1FD27A]" />
                                <span>Logout</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-grow p-4 sm:p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}

export default DashboardLayout;
