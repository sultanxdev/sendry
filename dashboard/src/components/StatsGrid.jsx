import { Card, CardContent } from './ui';
import { TrendingUp, Clock, AlertTriangle, CheckCircle2, Layers, Zap } from 'lucide-react';

function StatsGrid({ stats }) {
    const successRate = 100 - (stats?.errorRate ?? 0);

    const statCards = [
        {
            title: 'Total Hits',
            value: (stats?.totalHits ?? 0).toLocaleString(),
            subtitle: 'Aggregated requests',
            icon: TrendingUp,
            iconBg: 'bg-[#DCE7DF]/60',
            iconColor: 'text-[#0E1512]',
            accentColor: 'bg-[#1FD27A]',
        },
        {
            title: 'Average Latency',
            value: `${(stats?.avgLatency ?? 0).toFixed(2)} ms`,
            subtitle: 'Response time',
            icon: Clock,
            iconBg: 'bg-[#1FD27A]/15',
            iconColor: 'text-[#0B3B2E]',
            accentColor: 'bg-[#1FD27A]',
        },
        {
            title: 'Error Rate',
            value: `${(stats?.errorRate ?? 0).toFixed(1)}%`,
            subtitle: `${(stats?.errorHits ?? 0).toLocaleString()} failed hits`,
            icon: AlertTriangle,
            iconBg: 'bg-[#D92D20]/10',
            iconColor: 'text-[#D92D20]',
            accentColor: 'bg-[#D92D20]',
        },
        {
            title: 'Success Rate',
            value: `${successRate.toFixed(1)}%`,
            subtitle: `${(stats?.successHits ?? 0).toLocaleString()} 2xx responses`,
            icon: CheckCircle2,
            iconBg: 'bg-[#1FD27A]/15',
            iconColor: 'text-[#0B3B2E]',
            accentColor: 'bg-[#1FD27A]',
        },
        {
            title: 'Unique Services',
            value: stats?.uniqueServices ?? 0,
            subtitle: 'Connected microservices',
            icon: Layers,
            iconBg: 'bg-[#DCE7DF]/60',
            iconColor: 'text-[#0E1512]',
            accentColor: 'bg-[#7C5CFF]',
        },
        {
            title: 'Monitored Endpoints',
            value: stats?.uniqueEndpoints ?? 0,
            subtitle: 'Active routes recorded',
            icon: Zap,
            iconBg: 'bg-[#1FD27A]/15',
            iconColor: 'text-[#0B3B2E]',
            accentColor: 'bg-[#1FD27A]',
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {statCards.map((stat) => {
                const Icon = stat.icon;
                return (
                    <Card
                        key={stat.title}
                        className="relative overflow-hidden group hover:border-slate-400/60 transition-all bg-white"
                    >
                        <CardContent className="p-6 relative z-10 flex items-center justify-between gap-4">
                            <div className="flex flex-col">
                                <span className="text-[11px] font-bold font-mono text-slate-400 uppercase tracking-wider">
                                    {stat.title}
                                </span>
                                <h3 className="text-3xl font-black text-[#0E1512] font-['Bricolage_Grotesque',sans-serif] mt-1.5 tracking-tight m-0 leading-none">
                                    {stat.value}
                                </h3>
                                <span className="text-xs text-slate-500 font-medium mt-2">
                                    {stat.subtitle}
                                </span>
                            </div>
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border border-[#D9E1DB]/50 ${stat.iconBg}`}>
                                <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                            </div>
                        </CardContent>

                        {/* Bottom Accent Line */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-50">
                            <div className={`h-full ${stat.accentColor} w-full opacity-80`} />
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}

export default StatsGrid;
