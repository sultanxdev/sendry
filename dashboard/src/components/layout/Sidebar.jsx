import { NavLink } from 'react-router-dom';
import { cn } from '../../lib/utils';
import {
    LayoutDashboard,
    Settings,
    Activity,
} from 'lucide-react';

const navItems = [
    {
        title: 'Overview',
        href: '/',
        icon: LayoutDashboard,
        description: 'Main dashboard view'
    },
];

const bottomNavItems = [
    {
        title: 'Settings',
        href: '/settings',
        icon: Settings,
        description: 'App settings'
    },
];

export function Sidebar({ isOpen, onClose }) {
    return (
        <>
            {/* Mobile Sidebar overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/30 backdrop-blur-sm z-45 lg:hidden"
                    onClick={onClose}
                    aria-hidden="true"
                />
            )}
            
            {/* Sidebar panel */}
            <aside
                className={cn(
                    "fixed top-0 left-0 z-50 h-screen w-64 border-r border-[#EBEBEB] bg-white transition-transform duration-350 ease-in-out lg:translate-x-0 flex flex-col",
                    !isOpen && "-translate-x-full"
                )}
                aria-label="Sidebar"
                aria-expanded={isOpen}
            >
                {/* Logo Section */}
                <div className="flex items-center gap-3 h-20 px-6 border-b border-[#EBEBEB] shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-[#222026] flex items-center justify-center shadow-md">
                        <Activity className="w-5.5 h-5.5 text-[#A7E46A]" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-[#222026] tracking-tight m-0 leading-tight">Sendry</h2>
                        <p className="text-[10px] text-slate-400 font-bold tracking-wider uppercase m-0 mt-0.5">API Monitor</p>
                    </div>
                </div>

                {/* Primary Navigation */}
                <nav className="flex-1 overflow-y-auto px-4 py-6" aria-label="Main navigation">
                    <div className="flex flex-col gap-1.5">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <NavLink
                                    key={item.href}
                                    to={item.href}
                                    end={item.href === '/'}
                                    onClick={onClose}
                                    className={({ isActive }) =>
                                        cn(
                                            "flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                                            isActive
                                                ? "bg-[#222026] text-white font-bold shadow-md shadow-slate-200"
                                                : "text-slate-500 hover:text-[#222026] hover:bg-[#EBEBEB]/30"
                                        )
                                    }
                                >
                                    <Icon className="w-4.5 h-4.5 shrink-0" aria-hidden="true" />
                                    <span>{item.title}</span>
                                </NavLink>
                            );
                        })}
                    </div>
                </nav>

                {/* Bottom Navigation */}
                <div className="border-t border-[#EBEBEB] p-4 shrink-0">
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
                                            "flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200",
                                            isActive
                                                ? "bg-[#222026] text-white font-bold shadow-md shadow-slate-200"
                                                : "text-slate-500 hover:text-[#222026] hover:bg-[#EBEBEB]/30"
                                        )
                                    }
                                >
                                    <Icon className="w-4.5 h-4.5 shrink-0" aria-hidden="true" />
                                    <span>{item.title}</span>
                                </NavLink>
                            );
                        })}
                    </div>
                </div>
            </aside>
        </>
    );
}
