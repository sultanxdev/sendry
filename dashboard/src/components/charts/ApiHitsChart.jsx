import { useMemo } from 'react';
import Chart from 'react-apexcharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui';
import { useChartTheme } from '../../hooks/useChartTheme';

export function ApiHitsChart({ stats }) {
    const chart = useChartTheme();

    const isEmpty = !stats || (stats.totalHits === 0 && stats.successHits === 0 && stats.errorHits === 0);

    const options = useMemo(() => ({
        chart: {
            type: 'bar',
            toolbar: { show: false },
            background: 'transparent',
        },
        theme: { mode: chart.mode },
        plotOptions: {
            bar: { borderRadius: 6, columnWidth: '40%', distributed: true },
        },
        dataLabels: { enabled: false },
        grid: { borderColor: '#E5EAE6', strokeDashArray: 3 },
        xaxis: {
            categories: ['Total Hits', 'Success (2xx)', 'Errors (4xx/5xx)'],
            labels: { 
                style: { 
                    colors: '#52625A',
                    fontFamily: "'Instrument Sans', sans-serif",
                    fontWeight: 600,
                    fontSize: '12px'
                } 
            },
            axisBorder: { color: '#D9E1DB' },
            axisTicks: { color: '#D9E1DB' }
        },
        yaxis: {
            labels: { 
                style: { 
                    colors: '#52625A',
                    fontFamily: "'Instrument Sans', sans-serif",
                    fontSize: '12px'
                } 
            },
        },
        colors: ['#0E1512', '#1FD27A', '#D92D20'],
        legend: { show: false },
        tooltip: { 
            theme: chart.tooltipTheme,
            style: {
                fontSize: '12px',
                fontFamily: "'Instrument Sans', sans-serif"
            }
        },
    }), [chart.mode, chart.tooltipTheme]);

    const series = useMemo(() => [{
        name: 'Hits',
        data: [
            stats?.totalHits ?? 0,
            stats?.successHits ?? 0,
            stats?.errorHits ?? 0,
        ],
    }], [stats?.totalHits, stats?.successHits, stats?.errorHits]);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>API Traffic Summary</CardTitle>
                <CardDescription>Total volume, success responses, and error count</CardDescription>
            </CardHeader>
            <CardContent>
                {isEmpty ? (
                    <div className="flex flex-col items-center justify-center min-h-[300px] text-slate-400">
                        <p className="font-semibold text-sm text-[#0E1512] m-0">No traffic data recorded yet</p>
                        <span className="text-xs text-slate-500 mt-1">Data will populate automatically once API requests are ingested</span>
                    </div>
                ) : (
                    <Chart options={options} series={series} type="bar" height={320} />
                )}
            </CardContent>
        </Card>
    );
}

export default ApiHitsChart;
