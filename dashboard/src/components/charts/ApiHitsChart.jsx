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
            bar: { borderRadius: 8, columnWidth: '45%', distributed: true },
        },
        dataLabels: { enabled: false },
        grid: { borderColor: chart.gridColor, strokeDashArray: 4 },
        xaxis: {
            categories: ['Total Hits', 'Success', 'Errors'],
            labels: { 
                style: { 
                    colors: chart.labelColor,
                    fontFamily: 'Urbanist, sans-serif',
                    fontWeight: 600
                } 
            },
        },
        yaxis: {
            labels: { 
                style: { 
                    colors: chart.labelColor,
                    fontFamily: 'Urbanist, sans-serif'
                } 
            },
        },
        colors: ['#A8DFF8', '#A7E46A', '#222026'],
        legend: { show: false },
        tooltip: { 
            theme: chart.tooltipTheme,
            style: {
                fontSize: '12px',
                fontFamily: 'Urbanist, sans-serif'
            }
        },
    }), [chart.mode, chart.labelColor, chart.gridColor, chart.tooltipTheme]);

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
                <CardDescription>Total, success and error hit counts</CardDescription>
            </CardHeader>
            <CardContent>
                {isEmpty ? (
                    <div className="flex flex-col items-center justify-center min-h-[300px] text-slate-400">
                        <p className="font-semibold text-sm m-0">No traffic data available yet</p>
                        <span className="text-xs text-slate-500 mt-1">Data will appear once API requests are ingested</span>
                    </div>
                ) : (
                    <Chart options={options} series={series} type="bar" height={350} />
                )}
            </CardContent>
        </Card>
    );
}
