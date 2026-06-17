import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui';
import { BarChart3, TrendingUp, Clock, AlertCircle, Activity } from 'lucide-react';

function TopEndpoints({ endpoints }) {
    const getMethodVariant = (method) => {
        const variants = {
            GET: "secondary", // blue theme
            POST: "success",  // green theme
            PUT: "warning",
            DELETE: "destructive",
            PATCH: "outline",
        };
        return variants[method] || "outline";
    };

    const getRankStyle = (index) => {
        if (index === 0) return "bg-[#A7E46A] text-[#222026] shadow-sm";
        if (index === 1) return "bg-[#A8DFF8] text-[#222026] shadow-sm";
        if (index === 2) return "bg-[#EBEBEB] text-[#222026]";
        return "bg-slate-100 text-slate-500";
    };

    if (!endpoints || endpoints.length === 0) {
        return (
            <Card className="w-full">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
                            <BarChart3 className="w-5 h-5" />
                        </div>
                        <div>
                            <CardTitle>Top Endpoints</CardTitle>
                            <CardDescription>Most active API endpoints</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mb-3">
                            <Activity className="w-6 h-6 animate-pulse" />
                        </div>
                        <p className="font-bold text-sm text-[#222026] m-0">No data available yet</p>
                        <p className="text-xs text-slate-500 mt-1 font-semibold">
                            Endpoint statistics will appear here once traffic is recorded
                        </p>
                    </div>
                </CardContent>
            </Card >
        );
    }

    return (
        <Card className="w-full">
            <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#222026] flex items-center justify-center text-[#A7E46A] shadow-sm">
                            <BarChart3 className="w-5 h-5" />
                        </div>
                        <div>
                            <CardTitle>Top Endpoints</CardTitle>
                            <CardDescription>Most active API endpoints by hit count</CardDescription>
                        </div>
                    </div>
                    <Badge variant="secondary" className="self-start sm:self-auto gap-1">
                        <TrendingUp className="w-3 h-3 text-[#A8DFF8]" />
                        <span>Top {endpoints.length} Active</span>
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-4">
                    {endpoints.map((endpoint, index) => (
                        <div
                            key={`${endpoint.endpoint}-${endpoint.method}`}
                            className="border border-[#EBEBEB] bg-slate-50/50 hover:bg-white hover:border-[#A7E46A]/45 hover:shadow-md hover:shadow-slate-100 rounded-3xl p-5 transition-all duration-250"
                        >
                            <div className="flex items-start gap-4">
                                {/* Rank */}
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${getRankStyle(index)}`}>
                                    {index + 1}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 flex flex-col gap-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                        <code className="text-xs font-mono font-bold bg-[#222026] text-white px-3 py-1 rounded-xl self-start overflow-x-auto max-w-full">
                                            {endpoint.endpoint}
                                        </code>
                                        <div className="flex items-center gap-2">
                                            <Badge variant={getMethodVariant(endpoint.method)} className="font-bold">
                                                {endpoint.method}
                                            </Badge>
                                            <Badge variant="outline" className="font-bold text-slate-500">
                                                <Activity className="w-3.5 h-3.5 mr-1 text-[#A7E46A]" />
                                                {endpoint.serviceName}
                                            </Badge>
                                        </div>
                                    </div>

                                    {/* Stats grid */}
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <div className="bg-white border border-[#EBEBEB] p-3 rounded-2xl flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-[#A8DFF8]/20 flex items-center justify-center text-slate-800 shrink-0">
                                                <TrendingUp className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider m-0">Hits</p>
                                                <p className="text-sm font-black text-[#222026] m-0 mt-0.5">
                                                    {parseInt(endpoint.totalHits).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="bg-white border border-[#EBEBEB] p-3 rounded-2xl flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-[#A7E46A]/20 flex items-center justify-center text-slate-800 shrink-0">
                                                <Clock className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider m-0">Avg Latency</p>
                                                <p className="text-sm font-black text-[#222026] m-0 mt-0.5">{endpoint.avgLatency} ms</p>
                                            </div>
                                        </div>
                                        <div className="bg-white border border-[#EBEBEB] p-3 rounded-2xl flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-red-500/10 flex items-center justify-center text-red-650 shrink-0">
                                                <AlertCircle className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider m-0">Error Rate</p>
                                                <p className="text-sm font-black text-red-600 m-0 mt-0.5">{endpoint.errorRate}%</p>
                                            </div>
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
