import { useState, useMemo } from 'react';
import { useDashboardQuery } from '../hooks/useDashboardQuery';
import StatsGrid from '../components/StatsGrid';
import TopEndpoints from '../components/TopEndpoints';
import { ApiHitsChart, StatusDistributionChart } from '../components/charts';
import { PageStatus, Button } from '../components/ui';
import { clientApi } from '../api/api';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, BookOpen, Send, Check } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

export function OverviewPage() {
    const { data, isPending, error, refetch } = useDashboardQuery();
    const [sendingTest, setSendingTest] = useState(false);
    const { addToast } = useToast();

    const stats = data?.data?.stats ?? null;
    const topEndpoints = data?.data?.topEndpoints ?? [];

    const statusData = useMemo(() => {
        if (!stats) return null;
        return {
            labels: ['Success (2xx)', 'Errors (4xx/5xx)'],
            values: [stats.successHits, stats.errorHits],
        };
    }, [stats]);

    const handleSendTestHit = async () => {
        try {
            setSendingTest(true);
            const keysRes = await clientApi.getMyApiKeys();
            let key = keysRes?.data?.[0]?.keyValue;
            
            if (!key) {
                const newKey = await clientApi.createMyApiKey({
                    name: 'Quickstart Test Key',
                    environment: 'development'
                });
                key = newKey?.data?.keyValue;
            }

            const hitRes = await fetch('/api/hit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': key
                },
                body: JSON.stringify({
                    serviceName: 'payments-service',
                    endpoint: '/api/v1/checkout',
                    method: 'POST',
                    statusCode: 200,
                    latencyMs: Math.floor(Math.random() * 45) + 15
                })
            });

            if (hitRes.ok) {
                addToast('Test API hit successfully ingested into pipeline!', 'success');
                setTimeout(() => refetch(), 500);
            } else {
                addToast('Failed to ingest test hit', 'error');
            }
        } catch (err) {
            addToast('Error sending test hit: ' + err.message, 'error');
        } finally {
            setSendingTest(false);
        }
    };

    if (isPending || error || !data) {
        return (
            <PageStatus
                isLoading={isPending || !data}
                error={error}
                onRetry={refetch}
                loadingText="Loading telemetry..."
                errorText="Failed to load telemetry data"
            />
        );
    }

    const isBrandNew = !stats || stats.totalHits === 0;

    return (
        <div className="flex flex-col gap-6 max-w-7xl">
            {/* Header Title Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-col gap-0.5">
                    <h2 className="text-2xl sm:text-3xl font-black text-[#0E1512] font-['Bricolage_Grotesque',sans-serif] tracking-tight m-0">
                        Telemetry Overview
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium m-0">
                        Real-time analytics across all your registered endpoints and services
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={handleSendTestHit}
                        disabled={sendingTest}
                        className="gap-1.5 text-xs font-bold border-[#D9E1DB] text-[#0E1512]"
                    >
                        <Send className={`w-3.5 h-3.5 text-[#1FD27A] ${sendingTest ? 'animate-bounce' : ''}`} />
                        <span>{sendingTest ? 'Ingesting…' : 'Send Test Hit'}</span>
                    </Button>
                    <Link to="/docs">
                        <Button size="sm" variant="default" className="gap-1.5 text-xs font-bold bg-[#0E1512]">
                            <BookOpen className="w-3.5 h-3.5 text-[#1FD27A]" />
                            <span>Setup Guide</span>
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Quickstart Callout when zero hits recorded */}
            {isBrandNew && (
                <div className="p-5 rounded-2xl bg-[#DCE7DF]/40 border border-[#D9E1DB] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#1FD27A] flex items-center justify-center text-[#0E1512] shrink-0 font-bold">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-[#0E1512] m-0">Ready to track your first API hit?</h4>
                            <p className="text-xs text-slate-600 m-0 mt-0.5">
                                Click "Send Test Hit" above to test the queue pipeline, or integrate our 1-line Express middleware.
                            </p>
                        </div>
                    </div>
                    <Link to="/dashboard/settings" className="shrink-0">
                        <Button size="sm" variant="accent" className="text-xs gap-1 font-bold">
                            <span>Get API Key</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                        </Button>
                    </Link>
                </div>
            )}

            {/* KPI Stat Cards Grid */}
            <StatsGrid stats={stats} />

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ApiHitsChart stats={stats} />
                <StatusDistributionChart data={statusData} />
            </div>

            {/* Top Endpoints Table */}
            <TopEndpoints endpoints={topEndpoints} />
        </div>
    );
}

export default OverviewPage;
