import { useMemo } from 'react';
import { useDashboardQuery } from '../hooks/useDashboardQuery';
import StatsGrid from '../components/StatsGrid';
import TopEndpoints from '../components/TopEndpoints';
import { ApiHitsChart, StatusDistributionChart } from '../components/charts';
import { PageStatus } from '../components/ui';

export function OverviewPage() {
    const { data, isPending, error, refetch } = useDashboardQuery();

    const stats = data?.data?.stats ?? null;
    const topEndpoints = data?.data?.topEndpoints ?? [];

    const statusData = useMemo(() => {
        if (!stats) return null;
        return {
            labels: ['Success (2xx)', 'Errors (4xx/5xx)'],
            values: [stats.successHits, stats.errorHits],
        };
    }, [stats]);

    if (isPending || error || !data) {
        return (
            <PageStatus
                isLoading={isPending || !data}
                error={error}
                onRetry={refetch}
                loadingText="Loading dashboard..."
                errorText="Failed to load dashboard data"
            />
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-0.5">
                <h2 className="text-2xl font-black text-[#222026] tracking-tight m-0">Overview</h2>
                <p className="text-sm text-slate-500 font-semibold m-0">Welcome to your API monitoring dashboard</p>
            </div>

            <StatsGrid stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ApiHitsChart stats={stats} />
                <StatusDistributionChart data={statusData} />
            </div>

            <TopEndpoints endpoints={topEndpoints} />
        </div>
    );
}
