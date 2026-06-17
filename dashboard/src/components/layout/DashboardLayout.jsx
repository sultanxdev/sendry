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
        <div className="min-h-screen bg-gradient-to-br from-white via-[#EBEBEB]/15 to-[#A7E46A]/5 text-[#222026] relative overflow-hidden font-sans flex">
            {/* Ambient background glows */}
            <div className="absolute top-0 left-1/4 w-[35rem] h-[35rem] bg-[#A7E46A]/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-10 right-1/4 w-[40rem] h-[40rem] bg-[#A8DFF8]/10 rounded-full blur-3xl pointer-events-none"></div>

            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            
            <div className="flex-1 flex flex-col min-w-0 lg:pl-64 relative z-10 transition-all duration-350">
                {/* Floating header */}
                <header className="px-4 pt-4 sticky top-0 z-30 bg-transparent">
                    <div className="w-full bg-white/85 backdrop-blur-md border border-[#EBEBEB] rounded-3xl px-6 h-16 flex items-center justify-between shadow-sm shadow-slate-100">
                        {/* Mobile menu toggle */}
                        <button
                            className="inline-flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-[#222026] hover:bg-slate-50 border-none bg-transparent cursor-pointer lg:hidden"
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            aria-label={sidebarOpen ? 'Close menu' : 'Open menu'}
                        >
                            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                        </button>

                        {/* Last updated text */}
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                            <Clock className="w-3.5 h-3.5 text-[#A7E46A]" />
                            <span>Last updated: {lastUpdated}</span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-3">
                            <button
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 border border-[#EBEBEB] rounded-full bg-white hover:bg-slate-50 text-[#222026] text-xs font-bold shadow-sm transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                onClick={handleRefresh}
                                disabled={isFetching}
                                aria-label="Refresh data"
                            >
                                <RefreshCw
                                    className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`}
                                />
                                <span>Refresh</span>
                            </button>
                            <button
                                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[#222026] hover:bg-slate-800 text-white text-xs font-bold shadow-md shadow-slate-200 transition-all duration-200 border-none cursor-pointer"
                                onClick={onLogout}
                                aria-label="Log out"
                            >
                                <LogOut className="w-3.5 h-3.5 text-[#A7E46A]" />
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
