import { useMemo } from 'react';
import Chart from 'react-apexcharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui';
import { useChartTheme } from '../../hooks/useChartTheme';

export function StatusDistributionChart({ data }) {
    const chart = useChartTheme();

    const options = useMemo(() => ({
        chart: { type: 'donut', background: 'transparent' },
        theme: { mode: chart.mode },
        labels: data?.labels ?? ['Success', 'Errors'],
        colors: ['#A7E46A', '#222026'],
        dataLabels: {
            enabled: true,
            style: { 
                fontSize: '12px', 
                fontWeight: 'bold',
                fontFamily: 'Urbanist, sans-serif'
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
                            fontSize: '14px', 
                            color: chart.labelColor,
                            fontFamily: 'Urbanist, sans-serif',
                            fontWeight: 650
                        },
                        value: {
                            show: true,
                            fontSize: '22px',
                            fontWeight: 'bold',
                            color: '#222026',
                            fontFamily: 'Urbanist, sans-serif',
                            formatter: (val) => Number(val).toLocaleString(),
                        },
                        total: {
                            show: true,
                            label: 'Total Requests',
                            fontSize: '12px',
                            color: chart.labelColor,
                            fontFamily: 'Urbanist, sans-serif',
                            fontWeight: 500,
                            formatter: (w) => w.globals.seriesTotals.reduce((a, b) => a + b, 0).toLocaleString(),
                        },
                    },
                },
            },
        },
        legend: { 
            position: 'bottom', 
            labels: { colors: chart.labelColor },
            fontFamily: 'Urbanist, sans-serif',
            fontWeight: 600
        },
        tooltip: {
            theme: chart.tooltipTheme,
            style: {
                fontFamily: 'Urbanist, sans-serif'
            },
            y: { formatter: (v) => `${Number(v).toLocaleString()} requests` },
        },
    }), [data?.labels, chart.mode, chart.labelColor, chart.tooltipTheme]);

    const series = useMemo(() => data?.values ?? [], [data?.values]);

    const isEmpty = !series.length || series.every((v) => v === 0);

    return (
        <Card className="w-full">
            <CardHeader>
                <CardTitle>Status Code Distribution</CardTitle>
                <CardDescription>HTTP status code breakdown</CardDescription>
            </CardHeader>
            <CardContent>
                {isEmpty ? (
                    <div className="flex flex-col items-center justify-center min-h-[300px] text-slate-400">
                        <p className="font-semibold text-sm m-0">No request data available yet</p>
                        <span className="text-xs text-slate-500 mt-1">Data will appear once API requests are ingested</span>
                    </div>
                ) : (
                    <div className="py-2">
                        <Chart options={options} series={series} type="donut" height={335} />
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
