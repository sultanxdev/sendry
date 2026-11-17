import { useMemo } from 'react';
import Chart from 'react-apexcharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui';
import { useChartTheme } from '../../hooks/useChartTheme';

export function StatusDistributionChart({ data }) {
    const chart = useChartTheme();

    const options = useMemo(() => ({
        chart: { type: 'donut', background: 'transparent' },
        theme: { mode: chart.mode },
        labels: data?.labels ?? ['Success (2xx)', 'Errors (4xx/5xx)'],
        colors: ['#1FD27A', '#D92D20'],
        dataLabels: {
            enabled: true,
            style: { 
                fontSize: '12px', 
                fontWeight: 'bold',
                fontFamily: "'Instrument Sans', sans-serif"
            },
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '72%',
                    labels: {
                        show: true,
                        name: { 
                            show: true, 
                            fontSize: '13px', 
                            color: '#52625A',
                            fontFamily: "'Instrument Sans', sans-serif",
                            fontWeight: 600
                        },
                        value: {
                            show: true,
                            fontSize: '24px',
                            fontWeight: 'bold',
                            color: '#0E1512',
                            fontFamily: "'Bricolage Grotesque', sans-serif",
                            formatter: (val) => Number(val).toLocaleString(),
                        },
                        total: {
                            show: true,
                            label: 'Total Requests',
                            fontSize: '11px',
                            color: '#52625A',
                            fontFamily: "'DM Mono', monospace",
                            fontWeight: 500,
                            formatter: (w) => w.globals.seriesTotals.reduce((a, b) => a + b, 0).toLocaleString(),
                        },
                    },
                },
            },
        },
        legend: { 
            position: 'bottom', 
            labels: { colors: '#0E1512' },
            fontFamily: "'Instrument Sans', sans-serif",
            fontWeight: 600
        },
        tooltip: {
            theme: chart.tooltipTheme,
            style: {
                fontFamily: "'Instrument Sans', sans-serif"
            },
            y: { formatter: (v) => `${Number(v).toLocaleString()} hits` },
        },
    }), [data?.labels, chart.mode, chart.tooltipTheme]);

    const series = useMemo(() => data?.values ?? [], [data?.values]);

    const isEmpty = !series.length || series.every((v) => v === 0);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Status Code Distribution</CardTitle>
                <CardDescription>Breakdown between successful and failed requests</CardDescription>
            </CardHeader>
            <CardContent>
                {isEmpty ? (
                    <div className="flex flex-col items-center justify-center min-h-[300px] text-slate-400">
                        <p className="font-semibold text-sm text-[#0E1512] m-0">No status code distribution yet</p>
                        <span className="text-xs text-slate-500 mt-1">Data will populate automatically once API requests are ingested</span>
                    </div>
                ) : (
                    <div className="py-2">
                        <Chart options={options} series={series} type="donut" height={320} />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export default StatusDistributionChart;
