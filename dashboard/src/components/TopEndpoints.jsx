import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui';
import { BarChart3, TrendingUp, Clock, AlertCircle, Activity, Zap } from 'lucide-react';

function TopEndpoints({ endpoints }) {
    const getMethodStyle = (method) => {
        switch (method) {
            case 'GET':
                return 'bg-[#8FBBFF]/20 text-[#1B4B8A] border-[#8FBBFF]/40';
            case 'POST':
                return 'bg-[#1FD27A]/20 text-[#0B3B2E] border-[#1FD27A]/40 font-bold';
            case 'PUT':
                return 'bg-[#F2B233]/20 text-[#8F5B00] border-[#F2B233]/40';
            case 'DELETE':
                return 'bg-[#D92D20]/15 text-[#D92D20] border-[#D92D20]/30';
            default:
                return 'bg-slate-100 text-slate-700 border-slate-200';
        }
    };

    const getRankStyle = (index) => {
        if (index === 0) return 'bg-[#1FD27A] text-[#0E1512] font-black shadow-sm';
        if (index === 1) return 'bg-[#DCE7DF] text-[#0E1512] font-bold';
        if (index === 2) return 'bg-slate-200 text-[#0E1512] font-bold';
        return 'bg-slate-100 text-slate-500 font-medium';
    };

    if (!endpoints || endpoints.length === 0) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#DCE7DF] flex items-center justify-center text-[#0E1512]">
                            <BarChart3 className="w-4 h-4" />
                        </div>
                        <div>
                            <CardTitle>Top Endpoints</CardTitle>
                            <CardDescription>Most frequently hit API routes</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-12 h-12 rounded-xl bg-slate-50 border border-[#D9E1DB] flex items-center justify-center text-slate-400 mb-3">
                            <Activity className="w-5 h-5 text-[#1FD27A] animate-pulse" />
                        </div>
                        <p className="font-bold text-sm text-[#0E1512] m-0">No endpoint data recorded yet</p>
                        <p className="text-xs text-slate-500 mt-1 max-w-sm">
                            Once your application routes traffic through the Sendry middleware or POST /api/hit, the most active endpoints will be ranked here.
                        </p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#0E1512] flex items-center justify-center text-[#1FD27A] shadow-sm">
                            <BarChart3 className="w-4 h-4" />
                        </div>
                        <div>
                            <CardTitle>Top Endpoints</CardTitle>
                            <CardDescription>Ranked by volume of incoming requests</CardDescription>
                        </div>
                    </div>
                    <Badge variant="secondary" className="self-start sm:self-auto gap-1 font-mono text-xs">
                        <TrendingUp className="w-3 h-3 text-[#0E1512]" />
                        <span>Top {endpoints.length} Routes</span>
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-3">
                    {endpoints.map((endpoint, index) => (
                        <div
                            key={`${endpoint.endpoint}-${endpoint.method}-${index}`}
                            className="border border-[#D9E1DB] bg-white hover:border-[#1FD27A] rounded-2xl p-4 transition-all duration-200"
                        >
                            <div className="flex items-start gap-3.5">
                                {/* Rank Pill */}
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0 ${getRankStyle(index)}`}>
                                    {index + 1}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 flex flex-col gap-3">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <code className="text-xs font-mono font-bold bg-[#0E1512] text-[#1FD27A] px-3 py-1.5 rounded-lg self-start overflow-x-auto max-w-full">
                                            {endpoint.endpoint}
                                        </code>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-md border ${getMethodStyle(endpoint.method)}`}>
                                                {endpoint.method}
                                            </span>
                                            <span className="text-xs font-medium text-slate-500 bg-slate-50 border border-[#D9E1DB] px-2 py-0.5 rounded-md flex items-center gap-1">
                                                <Zap className="w-3 h-3 text-[#1FD27A]" />
                                                {endpoint.serviceName}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Metrics Bar */}
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
                                        <div>
                                            <span className="text-slate-400 block font-mono text-[10px] uppercase">Hits</span>
                                            <span className="font-bold text-[#0E1512] font-mono">
                                                {Number(endpoint.totalHits).toLocaleString()}
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block font-mono text-[10px] uppercase">Avg Latency</span>
                                            <span className="font-bold text-[#0E1512] font-mono">
                                                {endpoint.avgLatency} ms
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block font-mono text-[10px] uppercase">Min / Max</span>
                                            <span className="font-medium text-slate-600 font-mono text-[11px]">
                                                {endpoint.minLatency} / {endpoint.maxLatency} ms
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-slate-400 block font-mono text-[10px] uppercase">Errors</span>
                                            <span className={`font-bold font-mono ${endpoint.errorHits > 0 ? 'text-[#D92D20]' : 'text-emerald-700'}`}>
                                                {Number(endpoint.errorHits).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}

export default TopEndpoints;
