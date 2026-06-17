import { Card, CardContent } from './ui';
import { TrendingUp, Clock, AlertTriangle, CheckCircle2, Layers, Zap } from 'lucide-react';

function StatsGrid({ stats }) {
    const successRate = 100 - stats.errorRate;

    const statCards = [
        {
            title: 'Total Hits',
            value: stats.totalHits.toLocaleString(),
            subtitle: 'Last 24 hours',
            icon: TrendingUp,
            iconBg: 'bg-[#A8DFF8]/25',
            iconColor: 'text-slate-700',
            barBg: 'bg-[#A8DFF8]',
            barWidth: 'w-full'
        },
        {
            title: 'Average Latency',
            value: `${stats.avgLatency.toFixed(2)} ms`,
            subtitle: 'Response time',
            icon: Clock,
            iconBg: 'bg-[#A7E46A]/25',
            iconColor: 'text-slate-800',
            barBg: 'bg-[#A7E46A]',
            barWidth: 'w-4/5'
        },
        {
            title: 'Error Rate',
            value: `${stats.errorRate.toFixed(1)}%`,
            subtitle: `${stats.errorHits.toLocaleString()} errors`,
            icon: AlertTriangle,
            iconBg: 'bg-red-500/10',
            iconColor: 'text-red-600',
            barBg: 'bg-[#222026]',
            barWidth: `${Math.min(100, stats.errorRate * 5)}%`
        },
        {
            title: 'Success Rate',
            value: `${successRate.toFixed(1)}%`,
            subtitle: `${stats.successHits.toLocaleString()} success`,
            icon: CheckCircle2,
            iconBg: 'bg-[#A7E46A]/25',
            iconColor: 'text-emerald-700',
            barBg: 'bg-[#A7E46A]',
            barWidth: `${successRate}%`
        },
        {
            title: 'Unique Services',
            value: stats.uniqueServices,
            subtitle: 'Active services',
            icon: Layers,
            iconBg: 'bg-[#A8DFF8]/25',
            iconColor: 'text-slate-700',
            barBg: 'bg-[#A8DFF8]',
            barWidth: 'w-1/2'
        },
        {
            title: 'Unique Endpoints',
            value: stats.uniqueEndpoints,
            subtitle: 'API endpoints',
            icon: Zap,
            iconBg: 'bg-[#A7E46A]/25',
            iconColor: 'text-slate-800',
            barBg: 'bg-[#A7E46A]',
            barWidth: 'w-2/3'
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {statCards.map((stat) => {
                const Icon = stat.icon;
                return (
                    <Card
                        key={stat.title}
                        className="relative overflow-hidden group hover:scale-[1.01]"
                        style={{ animationDelay: `${statCards.indexOf(stat) * 100}ms` }}
                    >
                        <CardContent className="p-6 relative z-10 flex items-center justify-between gap-4">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                                    {stat.title}
                                </span>
                                <h3 className="text-2xl font-black text-[#222026] mt-2 tracking-tight m-0 leading-none">
                                    {stat.value}
                                </h3>
                                <span className="text-xs text-slate-500 font-semibold mt-2.5">
                                    {stat.subtitle}
                                </span>
                            </div>
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${stat.iconBg}`}>
                                <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                            </div>
                        </CardContent>

                        {/* Subtle bottom progress accent indicator */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-50 overflow-hidden">
                            <div className={`h-full ${stat.barBg} ${stat.barWidth} rounded-full transition-all duration-500`} />
                        </div>
                    </Card>
                );
            })}
        </div>
    );
}

export default StatsGrid;
