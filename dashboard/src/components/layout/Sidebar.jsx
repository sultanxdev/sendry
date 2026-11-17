import { NavLink, Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import {
    LayoutDashboard,
    Settings,
    BookOpen,
    Key,
    ExternalLink,
    Sparkles,
} from 'lucide-react';

const navItems = [
    {
        title: 'Overview',
        href: '/dashboard',
        icon: LayoutDashboard,
        description: 'Real-time telemetry'
    },
    {
        title: 'Documentation',
        href: '/docs',
        icon: BookOpen,
        description: 'Integration guide'
    },
];

const bottomNavItems = [
    {
        title: 'Settings & API Keys',
        href: '/dashboard/settings',
        icon: Key,
        description: 'Credentials & preferences'
    },
];

export function Sidebar({ isOpen, onClose }) {
    return (
        <>
            {/* Mobile Sidebar overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-[#0E1512]/40 backdrop-blur-sm z-40 lg:hidden"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}
            
            {/* Sidebar panel */}
            <aside
                className={cn(
                    "fixed top-0 left-0 z-50 h-screen w-64 border-r border-[#D9E1DB] bg-white transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col font-sans",
                    !isOpen && "-translate-x-full"
                )}
                aria-label="Sidebar"
                aria-expanded={isOpen}
            >
                {/* Logo Section */}
                <div className="flex items-center gap-3 h-20 px-6 border-b border-[#D9E1DB] shrink-0">
                    <Link to="/" className="flex items-center gap-2.5 text-inherit no-underline group">
                        <div className="w-9 h-9 rounded-xl bg-[#1FD27A] flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0E1512" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                            </svg>
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-[#0E1512] font-['Bricolage_Grotesque',sans-serif] tracking-tight m-0 leading-none">
                                Sendry
                            </h2>
                            <p className="text-[10px] text-slate-400 font-bold font-mono tracking-wider uppercase m-0 mt-1">
                                API Telemetry
                            </p>
                        </div>
                    </Link>
                </div>

                {/* Primary Navigation */}
                <nav className="flex-1 overflow-y-auto px-4 py-6" aria-label="Main navigation">
                    <div className="flex flex-col gap-1.5">
                        <span className="px-3 text-[10px] font-bold font-mono uppercase tracking-wider text-slate-400 mb-1">
                            Menu
                        </span>
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <NavLink
                                    key={item.href}
                                    to={item.href}
                                    end={item.href === '/dashboard'}
                                    onClick={onClose}
                                    className={({ isActive }) =>
                                        cn(
                                            "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group",
                                            isActive
                                                ? "bg-[#0E1512] text-white font-bold shadow-sm"
                                                : "text-slate-600 hover:text-[#0E1512] hover:bg-[#DCE7DF]/40"
                                        )
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            <div className="flex items-center gap-3">
                                                <Icon className={cn("w-4 h-4 shrink-0 transition-colors", isActive ? "text-[#1FD27A]" : "text-slate-400 group-hover:text-[#0E1512]")} />
                                                <span>{item.title}</span>
                                            </div>
                                            {isActive && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#1FD27A]"></span>
                                            )}
                                        </>
                                    )}
                                </NavLink>
                            );
                        })}
                    </div>
                </nav>

                {/* Quick Link to Landing Page */}
                <div className="px-4 py-2">
                    <Link
                        to="/"
                        className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-[#0E1512] hover:bg-slate-50 transition-colors border border-dashed border-[#D9E1DB]"
                    >
                        <span>Visit Website</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                </div>

                {/* Bottom Navigation */}
                <div className="border-t border-[#D9E1DB] p-4 shrink-0">
                    <div className="flex flex-col gap-1.5">
                        {bottomNavItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <NavLink
                                    key={item.href}
                                    to={item.href}
                                    onClick={onClose}
                                    className={({ isActive }) =>
                                        cn(
                                            "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group",
                                            isActive
                                                ? "bg-[#0E1512] text-white font-bold shadow-sm"
                                                : "text-slate-600 hover:text-[#0E1512] hover:bg-[#DCE7DF]/40"
                                        )
                                    }
                                >
                                    {({ isActive }) => (
                                        <>
                                            <div className="flex items-center gap-3">
                                                <Icon className={cn("w-4 h-4 shrink-0 transition-colors", isActive ? "text-[#1FD27A]" : "text-slate-400 group-hover:text-[#0E1512]")} />
                                                <span>{item.title}</span>
                                            </div>
                                            {isActive && (
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#1FD27A]"></span>
                                            )}
                                        </>
                                    )}
                                </NavLink>
                            );
                        })}
                    </div>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;
