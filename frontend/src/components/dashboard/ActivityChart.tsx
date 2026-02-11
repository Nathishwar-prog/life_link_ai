
import Chart from 'react-apexcharts';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { motion } from 'framer-motion';
import { ApexOptions } from 'apexcharts';

export function ActivityChart() {
    const options: ApexOptions = {
        chart: {
            type: 'area',
            toolbar: { show: false },
            fontFamily: 'inherit',
            animations: {
                enabled: true,
                speed: 800,
            }
        },
        dataLabels: { enabled: false },
        stroke: { curve: 'smooth', width: 2 },
        xaxis: {
            categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
            axisBorder: { show: false },
            axisTicks: { show: false },
            labels: { style: { colors: '#9ca3af' } }
        },
        yaxis: {
            labels: { style: { colors: '#9ca3af' } }
        },
        grid: {
            borderColor: '#f3f4f6',
            strokeDashArray: 4,
            xaxis: { lines: { show: false } }
        },
        fill: {
            type: 'gradient',
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.7,
                opacityTo: 0.2,
                stops: [0, 90, 100]
            }
        },
        colors: ['#ef4444', '#3b82f6'],
        tooltip: {
            theme: 'light',
            y: { formatter: (val) => `${val}` }
        },
        legend: { position: 'top', horizontalAlign: 'right' }
    };

    const series = [
        { name: 'Donations', data: [40, 30, 20, 27, 18, 23, 34] },
        { name: 'Requests', data: [24, 13, 98, 39, 48, 38, 43] }
    ];

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
        >
            <Card className="border-none shadow-md bg-white/50 backdrop-blur-sm">
                <CardHeader>
                    <CardTitle>Donation & Request Trends</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="h-[350px] w-full">
                        <Chart options={options} series={series} type="area" height="100%" />
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
